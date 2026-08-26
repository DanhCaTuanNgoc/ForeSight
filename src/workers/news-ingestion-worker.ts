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

  /** CryptoPanic: free public crypto news aggregator. */
  private async fetchCryptoPanic(): Promise<NewsEventInsert[]> {
    const baseUrl = "https://cryptopanic.com/api/free/v1/posts/";
    const params = new URLSearchParams({
      currencies: "BTC,ETH",
      kind: "news",
      public: "true",
    });
    if (this.authToken) {
      params.set("auth_token", this.authToken);
    }

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

  /** CoinGecko: free status updates endpoint. */
  private async fetchCoinGeckoStatus(): Promise<NewsEventInsert[]> {
    const url = "https://api.coingecko.com/api/v3/status_updates?per_page=20";
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`CoinGecko API returned ${res.status}`);
    }

    const json = (await res.json()) as any;
    const updates: any[] = json?.status_updates || [];

    return updates.map((u) => ({
      title: u.project?.name ? `${u.project.name}: ${(u.description || "").slice(0, 120)}` : (u.description || "").slice(0, 120),
      summary: u.description || null,
      url: u.project?.links?.homepage?.[0] || null,
      source: "coingecko",
      asset_tags: this.extractAssetTags(u.description || ""),
      sentiment: "neutral" as const,
      published_at: u.created_at || new Date().toISOString(),
    }));
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
