/**
 * News Ingestion Worker
 *
 * Fetches crypto news from free public APIs and RSS feeds,
 * normalizes them, and stores into Supabase `news_events` table.
 *
 * Sources:
 *   1. CryptoPanic API (free tier, no auth needed for public posts)
 *   2. CoinGecko Status Updates (free, no auth)
 *
 * This data feeds the RAG retrieval pipeline for explaining Spikes.
 */

import chalk from "chalk";
import { isSupabaseConfigured } from "../db/supabase.js";
import { insertNewsEvents } from "../db/repository.js";
import type { NewsEventInsert } from "../db/types.js";

/** Default polling interval: every 2 minutes. */
const DEFAULT_POLL_INTERVAL_SEC = 120;

/** Seen URLs dedup set (in-memory, resets on restart). */
const seenUrls = new Set<string>();

export interface NewsWorkerOptions {
  pollIntervalSec?: number;
  cryptoPanicAuthToken?: string;
}

export class NewsIngestionWorker {
  private interval: ReturnType<typeof setInterval> | null = null;
  private pollSec: number;
  private authToken: string | null;
  private isRunning = false;
  private tickCount = 0;
  private totalIngested = 0;

  constructor(opts: NewsWorkerOptions = {}) {
    this.pollSec = opts.pollIntervalSec ?? DEFAULT_POLL_INTERVAL_SEC;
    this.authToken = opts.cryptoPanicAuthToken || process.env.CRYPTOPANIC_TOKEN || null;
  }

  /** Start the polling loop. */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log(
      chalk.cyan(`[NewsWorker] Started — polling every ${this.pollSec}s`),
    );

    // First tick immediately
    this.tick().catch((err) => console.error(chalk.red("[NewsWorker] tick error:"), err));

    this.interval = setInterval(() => {
      this.tick().catch((err) => console.error(chalk.red("[NewsWorker] tick error:"), err));
    }, this.pollSec * 1000);
  }

  /** Stop the polling loop. */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log(chalk.yellow(`[NewsWorker] Stopped — ${this.totalIngested} total articles ingested`));
  }

  /** Return current worker stats. */
  getStats() {
    return {
      isRunning: this.isRunning,
      tickCount: this.tickCount,
      totalIngested: this.totalIngested,
      seenUrlCount: seenUrls.size,
    };
  }

  /** Single poll iteration: fetch from all sources → deduplicate → store. */
  private async tick(): Promise<void> {
    this.tickCount++;
    const articles: NewsEventInsert[] = [];

    // ── Source 1: CryptoPanic ─────────────────────────────────
    try {
      const cpArticles = await this.fetchCryptoPanic();
      articles.push(...cpArticles);
    } catch (err: any) {
      if (this.tickCount <= 2) {
        console.warn(chalk.yellow(`[NewsWorker] CryptoPanic fetch failed: ${err?.message}`));
      }
    }

    // ── Source 2: CoinGecko Status (free, no key) ─────────────
    try {
      const cgArticles = await this.fetchCoinGeckoStatus();
      articles.push(...cgArticles);
    } catch (err: any) {
      if (this.tickCount <= 2) {
        console.warn(chalk.yellow(`[NewsWorker] CoinGecko fetch failed: ${err?.message}`));
      }
    }

    // ── Deduplicate ───────────────────────────────────────────
    const fresh = articles.filter((a) => {
      const key = a.url || a.title;
      if (seenUrls.has(key)) return false;
      seenUrls.add(key);
      return true;
    });

    // ── Persist ───────────────────────────────────────────────
    if (fresh.length > 0 && isSupabaseConfigured()) {
      const written = await insertNewsEvents(fresh);
      this.totalIngested += written;

      if (written > 0) {
        console.log(
          chalk.gray(`[NewsWorker] tick #${this.tickCount} — ingested ${written} new articles`),
        );
      }
    }
  }

  // ────────────────────────────────────────────────────────────
  // Data Sources
  // ────────────────────────────────────────────────────────────

  /** CryptoPanic: crypto news aggregator (requires free auth token). */
  private async fetchCryptoPanic(): Promise<NewsEventInsert[]> {
    if (!this.authToken) {
      return []; // Silently skip if no API token configured
    }

    const baseUrl = "https://cryptopanic.com/api/v1/posts/";
    const params = new URLSearchParams({
      auth_token: this.authToken,
      currencies: "BTC,ETH",
      kind: "news",
      public: "true",
    });

    const res = await fetch(`${baseUrl}?${params}`, {
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`CryptoPanic API returned ${res.status}`);
    }

    const json = (await res.json()) as any;
    const posts: any[] = json?.results || [];

    return posts.map((post) => {
      const tags = this.extractAssetTags(post.title + " " + (post.currencies?.map((c: any) => c.code).join(" ") || ""));
      return {
        title: post.title || "Untitled",
        summary: post.metadata?.description || null,
        url: post.url || post.source?.url || null,
        source: "cryptopanic",
        asset_tags: tags,
        sentiment: this.mapSentiment(post.votes),
        published_at: post.published_at || new Date().toISOString(),
      };
    });
  }

  /** CoinTelegraph RSS: free real-time public crypto news feed (no auth required). */
  private async fetchCoinGeckoStatus(): Promise<NewsEventInsert[]> {
    const url = "https://cointelegraph.com/rss";
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });

    if (!res.ok) {
      throw new Error(`CoinTelegraph RSS returned ${res.status}`);
    }

    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    const seen = new Set<string>();
    const results: NewsEventInsert[] = [];
    for (const item of items.slice(0, 25)) {
      const content = item[1];
      const titleMatch = content.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || content.match(/<title>(.*?)<\/title>/);
      const linkMatch = content.match(/<link>(.*?)<\/link>/);
      const descMatch = content.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || content.match(/<description>(.*?)<\/description>/);
      const pubDateMatch = content.match(/<pubDate>(.*?)<\/pubDate>/);

      const title = titleMatch ? titleMatch[1].trim() : "";
      if (!title) continue;

      const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 28);
      if (seen.has(normTitle)) continue;
      seen.add(normTitle);

      const cleanDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      const dateStr = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

      const rawLink = linkMatch ? linkMatch[1].trim() : "";
      const cleanLink = rawLink.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();

      results.push({
        title,
        summary: cleanDesc.slice(0, 200) || null,
        url: cleanLink || null,
        source: "cointelegraph",
        asset_tags: this.extractAssetTags(title + " " + cleanDesc),
        sentiment: "neutral" as const,
        published_at: dateStr,
      });
      if (results.length >= 15) break;
    }

    return results;
  }

  // ────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────

  /** Extract asset tags (BTC, ETH, CRYPTO) from text. */
  private extractAssetTags(text: string): string[] {
    const tags: string[] = [];
    const upper = text.toUpperCase();
    if (upper.includes("BTC") || upper.includes("BITCOIN")) tags.push("BTC");
    if (upper.includes("ETH") || upper.includes("ETHEREUM")) tags.push("ETH");
    if (tags.length === 0) tags.push("CRYPTO");
    return tags;
  }

  /** Map CryptoPanic votes to sentiment. */
  private mapSentiment(votes: any): "bullish" | "bearish" | "neutral" {
    if (!votes) return "neutral";
    const pos = (votes.positive || 0) + (votes.liked || 0);
    const neg = (votes.negative || 0) + (votes.disliked || 0);
    if (pos > neg + 2) return "bullish";
    if (neg > pos + 2) return "bearish";
    return "neutral";
  }
}
