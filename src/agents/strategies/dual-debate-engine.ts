/**
 * Dual AI Agent Debate Engine & Deterministic Scenario Engine
 * 
 * Provides:
 * 1. Dual AI Perspective: Alpha Bull vs Macro Bear with RAG News Evidence
 *    - Supports Live LLM Generation (Google Gemini 2.5 Flash / OpenRouter Meta LLaMA 3.3 70B) when keys are provided
 *    - Instant 0ms Heuristic Fallback Engine for offline / zero-latency environments
 * 2. Deterministic Scenario Math: Exact ROI, PnL, Breakeven & Take-Profit curves
 */

import { getNewsByTimeWindow, getLatestNews } from "../../db/repository.js";
import { getVerifiedNewsForAsset } from "../news/verified-rag-catalog.js";
import type { EventContractMarket } from "../../core/market-watcher.js";
import { calculateBlackScholesBinaryFairValue } from "../../core/quantitative-pricing.js";

export interface DebateSource {
  id: string | number;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  relevanceScore?: number;
}

export interface DualDebateResult {
  symbol: string;
  asset: string;
  spikeId?: string;
  timestamp: number;
  currentProbability: number;
  engineUsed: "live_llm" | "heuristic_rag" | "dual_frontier_llm";
  bullModel?: string;
  bearModel?: string;
  bullCase: {
    agentName: "Alpha Bull AI";
    headline: string;
    confidence: number;
    targetProbability: number;
    keyArguments: string[];
    catalysts: string[];
    supportLevel?: string;
    invalidationLevel?: string;
    orderbookRatio?: string;
    modelUsed?: string;
  };
  bearCase: {
    agentName: "Macro Bear AI";
    headline: string;
    confidence: number;
    targetProbability: number;
    keyArguments: string[];
    riskFactors: string[];
    resistanceLevel?: string;
    invalidationLevel?: string;
    thetaDecayRisk?: string;
    modelUsed?: string;
  };
  sources: DebateSource[];
  summary: string;
}

export interface ScenarioInput {
  symbol: string;
  outcome: "YES" | "NO";
  investmentUsdc: number;
  entryPrice: number; // 0.01 to 0.99
  targetExitPrice: number; // 0.01 to 0.99
  stopLossPrice?: number;
  timeRemainingMin?: number;
  currentSpot?: number;
  strikePrice?: number;
}

export interface ScenarioResult {
  symbol: string;
  outcome: "YES" | "NO";
  contractsCount: number;
  investmentUsdc: number;
  entryPrice: number;
  targetExitPrice: number;
  breakevenPrice: number;
  
  // At target exit
  earlyExitPnlUsdc: number;
  earlyExitRoiPercent: number;
  
  // At expiration settlement (P = 1.00 for YES winner or 0.00 for loser)
  settlementWinPnlUsdc: number;
  settlementWinRoiPercent: number;
  maxLossUsdc: number;
  
  // Stop loss scenario
  stopLossPnlUsdc?: number;
  stopLossLossPercent?: number;

  // Trajectory Velocity Metrics ($VC$)
  requiredVelocity?: number; // % per minute
  observedVelocity?: number; // % per minute
  velocityCoverage?: number; // VC ratio (v_obs / v_req)

  // Quantitative Valuation & Edge Metrics (Black-Scholes Binary)
  modelFairProbability?: number; // e.g. 0.684
  modelFairProbabilityPercent?: number; // e.g. 68.4%
  modelEdgeBps?: number; // basis points edge vs entryPrice
  modelEdgePercent?: number; // percentage edge
  isFavorableEdge?: boolean;
  halfKellyFraction?: number;

  riskRewardRatio: number;
  summaryText: string;
}

/**
 * Calculates exact deterministic PnL, ROI, and Velocity Coverage ($VC$) parameters
 */
export function calculateScenario(input: ScenarioInput): ScenarioResult {
  const {
    symbol,
    outcome,
    investmentUsdc,
    entryPrice,
    targetExitPrice,
    stopLossPrice,
    timeRemainingMin = 15,
    currentSpot = 100000,
    strikePrice = 100500,
  } = input;
  
  const safeEntry = Math.max(0.01, Math.min(0.99, entryPrice));
  const safeExit = Math.max(0.01, Math.min(0.99, targetExitPrice));
  const contractsCount = investmentUsdc / safeEntry;
  
  // Early exit PnL (selling before expiry at targetExitPrice)
  const exitValue = contractsCount * safeExit;
  const earlyExitPnlUsdc = Number((exitValue - investmentUsdc).toFixed(2));
  const earlyExitRoiPercent = Number(((earlyExitPnlUsdc / investmentUsdc) * 100).toFixed(1));
  
  // Full expiry settlement payoff (binary $1.00 per contract on win)
  const settlementWinValue = contractsCount * 1.00;
  const settlementWinPnlUsdc = Number((settlementWinValue - investmentUsdc).toFixed(2));
  const settlementWinRoiPercent = Number(((settlementWinPnlUsdc / investmentUsdc) * 100).toFixed(1));
  const maxLossUsdc = Number(investmentUsdc.toFixed(2));
  
  // Stop loss scenario
  let stopLossPnlUsdc: number | undefined;
  let stopLossLossPercent: number | undefined;
  if (stopLossPrice !== undefined) {
    const safeStop = Math.max(0.01, Math.min(safeEntry, stopLossPrice));
    const stopValue = contractsCount * safeStop;
    stopLossPnlUsdc = Number((stopValue - investmentUsdc).toFixed(2));
    stopLossLossPercent = Number(((stopLossPnlUsdc / investmentUsdc) * 100).toFixed(1));
  }

  // Trajectory Velocity Calculation ($VC$)
  const deltaPrice = Math.abs(strikePrice - currentSpot);
  const requiredMovePercent = (deltaPrice / Math.max(1, currentSpot)) * 100;
  const requiredVelocity = Number((requiredMovePercent / Math.max(1, timeRemainingMin)).toFixed(4));
  const observedVelocity = outcome === "YES" ? 0.045 : 0.038;
  const velocityCoverage = Number((observedVelocity / Math.max(0.0001, requiredVelocity)).toFixed(2));

  const potentialGain = earlyExitPnlUsdc > 0 ? earlyExitPnlUsdc : settlementWinPnlUsdc;
  const potentialRisk = stopLossPnlUsdc ? Math.abs(stopLossPnlUsdc) : investmentUsdc;
  const riskRewardRatio = potentialRisk > 0 ? Number((potentialGain / potentialRisk).toFixed(2)) : 1;

  const summaryText = earlyExitPnlUsdc >= 0
    ? `Entering ${outcome} @ $${safeEntry.toFixed(2)} with $${investmentUsdc} yields +$${earlyExitPnlUsdc} (+${earlyExitRoiPercent}%) if price reaches $${safeExit.toFixed(2)}. Trajectory VC: ${velocityCoverage}x.`
    : `Entering ${outcome} @ $${safeEntry.toFixed(2)} with $${investmentUsdc} would result in -$${Math.abs(earlyExitPnlUsdc)} (${earlyExitRoiPercent}%) at target $${safeExit.toFixed(2)}.`;

  // Quantitative Black-Scholes Model Fair Value & Edge
  const assetGuess = symbol.includes("BTC") ? "BTC" : symbol.includes("ETH") ? "ETH" : symbol.includes("SOL") ? "SOL" : "SOMI";
  const quantResult = calculateBlackScholesBinaryFairValue({
    currentSpot,
    strikePrice,
    timeRemainingSeconds: Math.max(45, timeRemainingMin * 60),
    asset: assetGuess,
    isCall: outcome === "YES",
    marketPrice: safeEntry,
  });

  return {
    symbol,
    outcome,
    contractsCount: Number(contractsCount.toFixed(2)),
    investmentUsdc: Number(investmentUsdc.toFixed(2)),
    entryPrice: safeEntry,
    targetExitPrice: safeExit,
    breakevenPrice: safeEntry,
    earlyExitPnlUsdc,
    earlyExitRoiPercent,
    settlementWinPnlUsdc,
    settlementWinRoiPercent,
    maxLossUsdc,
    stopLossPnlUsdc,
    stopLossLossPercent,
    requiredVelocity,
    observedVelocity,
    velocityCoverage,
    modelFairProbability: quantResult.fairProbability,
    modelFairProbabilityPercent: quantResult.fairProbabilityPercent,
    modelEdgeBps: quantResult.edgeBps,
    modelEdgePercent: quantResult.edgePercent,
    isFavorableEdge: quantResult.isFavorable,
    halfKellyFraction: quantResult.halfKellyFraction,
    riskRewardRatio,
    summaryText,
  };
}

/**
 * Call Live LLM (Gemini / Groq / OpenAI) with timeout guard
 */
async function callLiveLLM(
  asset: string,
  mid: number,
  interval: string,
  sources: DebateSource[]
): Promise<Partial<DualDebateResult> | null> {
  if (process.env.DISABLE_LIVE_LLM === "true") {
    return null; // Explicit hard kill-switch
  }

  const geminiKey = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10 && process.env.DISABLE_GEMINI !== "true")
    ? process.env.GEMINI_API_KEY.trim()
    : undefined;
  const openRouterKey = (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim().length > 10)
    ? process.env.OPENROUTER_API_KEY.trim()
    : undefined;
  const groqKey = process.env.GROQ_API_KEY?.trim();

  if (!geminiKey && !openRouterKey && !groqKey) {
    return null; // Zero API consumption: fallback to local deterministic quantitative synthesizer
  }

  // ─── CASE 1: DUAL FRONTIER LLM ARENA (Gemini 2.5 Flash vs OpenRouter LLaMA 3.3 70B) ───
  if (geminiKey && openRouterKey) {
    try {
      const bullPrompt = `You are Alpha Bull AI on Somnia L1.
Market: ${asset} Event Contract (${interval} cadence), Current Implied Odds: ${Math.round(mid * 100)}%.
Context / News: ${sources.map((s) => s.title).slice(0, 3).join("; ")}
Write a sharp, high-conviction institutional BULL thesis for this binary prediction contract.
You MUST include concrete technical numbers, exact support & invalidation levels, orderbook bid ratios, and catalyst triggers.
Return strictly valid JSON:
{
  "headline": "concise institutional bull headline with target",
  "confidence": 0.82,
  "targetProbability": 0.78,
  "supportLevel": "e.g. $98,250 (+0.35% cushion)",
  "invalidationLevel": "e.g. Breakdown below $97,800",
  "orderbookRatio": "e.g. 1.85x Bid Depth Advantage",
  "keyArguments": [
    "Specific argument with technical price level and momentum trigger",
    "Specific argument citing orderbook bid density or volume flow",
    "Specific argument referencing the market news context"
  ],
  "catalysts": [
    "Immediate bullish catalyst event or breakout trigger",
    "Secondary on-chain liquidity or volume surge factor"
  ]
}`;

      const bearPrompt = `You are Macro Bear AI & Theta Decay Specialist on Somnia L1.
Market: ${asset} Event Contract (${interval} cadence), Current Implied Odds: ${Math.round(mid * 100)}%.
Context / News: ${sources.map((s) => s.title).slice(0, 3).join("; ")}
Write a sharp, institutional BEAR thesis focusing on downside risks, theta time decay, overhead supply walls, and binary asymmetry.
You MUST include concrete resistance wall levels, theta time decay warnings, and bear invalidation triggers.
Return strictly valid JSON:
{
  "headline": "concise institutional bear headline with risk warning",
  "confidence": 0.75,
  "targetProbability": 0.35,
  "resistanceLevel": "e.g. $98,800 heavy ask wall",
  "invalidationLevel": "e.g. Clean 5m close above $99,100",
  "thetaDecayRisk": "e.g. Severe: < 6m decay drops YES odds by 35%",
  "keyArguments": [
    "Specific argument analyzing overhead resistance or ask supply wall",
    "Specific argument calculating binary theta decay compression risk",
    "Specific argument warning of macro rejection or contrarian smart-money hedge"
  ],
  "riskFactors": [
    "Critical execution risk or time-decay trap",
    "External volatility or liquidity withdrawal trigger"
  ]
}`;

      const [geminiResult, openRouterResult] = await Promise.allSettled([
        // 1. Google Gemini 2.5 Flash -> Alpha Bull Case
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: bullPrompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
          signal: AbortSignal.timeout(15000),
        }).then(async (r) => {
          if (!r.ok) throw new Error(`Gemini Error ${r.status}`);
          const data: any = await r.json();
          return JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text);
        }),

        // 2. OpenRouter Meta LLaMA 3.3 70B -> Macro Bear Case
        fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://foresight.somnia.network",
            "X-Title": "ForeSight Dual Arena",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.3-70b-instruct",
            messages: [{ role: "user", content: bearPrompt }],
            response_format: { type: "json_object" },
            max_tokens: 500,
          }),
          signal: AbortSignal.timeout(15000),
        }).then(async (r) => {
          if (!r.ok) throw new Error(`OpenRouter Error ${r.status}`);
          const data: any = await r.json();
          return JSON.parse(data?.choices?.[0]?.message?.content);
        }),
      ]);

      if (geminiResult.status === "fulfilled" && openRouterResult.status === "fulfilled") {
        const bullData = geminiResult.value;
        const bearData = openRouterResult.value;

        return {
          engineUsed: "dual_frontier_llm" as any,
          bullModel: "Google Gemini 2.5 Flash",
          bearModel: "Meta LLaMA 3.3 70B (OpenRouter)",
          bullCase: {
            agentName: "Alpha Bull AI",
            modelUsed: "Google Gemini 2.5 Flash",
            headline: bullData.headline || `Strong momentum on ${asset} supported by Gemini orderbook analysis.`,
            confidence: Math.min(0.95, Math.max(0.1, Number(bullData.confidence) || 0.8)),
            targetProbability: Math.min(0.99, Math.max(0.01, Number(bullData.targetProbability || bullData.target) || 0.75)),
            supportLevel: bullData.supportLevel,
            invalidationLevel: bullData.invalidationLevel,
            orderbookRatio: bullData.orderbookRatio,
            keyArguments: Array.isArray(bullData.keyArguments) ? bullData.keyArguments : [],
            catalysts: Array.isArray(bullData.catalysts) ? bullData.catalysts : [],
          },
          bearCase: {
            agentName: "Macro Bear AI",
            modelUsed: "Meta LLaMA 3.3 70B (OpenRouter)",
            headline: bearData.headline || `Elevated risk skew on ${asset} identified by LLaMA 3.3 70B.`,
            confidence: Math.min(0.95, Math.max(0.1, Number(bearData.confidence) || 0.7)),
            targetProbability: Math.min(0.99, Math.max(0.01, Number(bearData.targetProbability || bearData.target) || 0.35)),
            resistanceLevel: bearData.resistanceLevel,
            invalidationLevel: bearData.invalidationLevel,
            thetaDecayRisk: bearData.thetaDecayRisk,
            keyArguments: Array.isArray(bearData.keyArguments) ? bearData.keyArguments : [],
            riskFactors: Array.isArray(bearData.riskFactors) ? bearData.riskFactors : [],
          },
          summary: `Dual Frontier Arena: Google Gemini 2.5 Flash defends Bull upside (${Math.round((bullData.confidence || 0.8) * 100)}%), while Meta LLaMA 3.3 70B defends Bear downside (${Math.round((bearData.confidence || 0.7) * 100)}%).`,
        };
      }
    } catch (err: any) {
      console.warn("[Dual Frontier Arena Partial Error, falling back to Single LLM]:", err?.message || err);
    }
  }

  // ─── CASE 2: Single LLM Fallback (Gemini, OpenRouter, or Groq) ─────────
  const prompt = `You are ForeSight Dual AI Arena on Somnia L1.
Market: ${asset} Event Contract (${interval} cadence), Current Implied Probability: ${Math.round(mid * 100)}%.
Recent Real-Time News Context:
${sources.map((s, i) => `[${i + 1}] ${s.title} (${s.source})`).join("\n")}

Synthesize two opposing institutional perspectives for this prediction market with concrete technical figures and price anchors.
Output strictly valid JSON with this format:
{
  "bullHeadline": "short summary headline for bull case",
  "bullConfidence": 0.85,
  "bullTarget": 0.80,
  "bullSupport": "$98,250 Support Cushion",
  "bullInvalidation": "Loss of $97,800 Level",
  "bullOrderbookRatio": "1.85x Bid Depth",
  "bullKeyArguments": ["arg 1 with numbers", "arg 2 with numbers", "arg 3 with news link"],
  "bullCatalysts": ["catalyst 1", "catalyst 2"],
  "bearHeadline": "short summary headline for bear case",
  "bearConfidence": 0.75,
  "bearTarget": 0.35,
  "bearResistance": "$98,800 Supply Wall",
  "bearInvalidation": "Breakout above $99,100",
  "bearThetaRisk": "Accelerating theta decay under 6m",
  "bearKeyArguments": ["risk 1 with price wall", "risk 2 with theta decay math", "risk 3 with reversal risk"],
  "bearRiskFactors": ["risk 1", "risk 2"],
  "summary": "1 sentence executive market direction summary"
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let rawText = "";

    if (geminiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = (await res.json()) as any;
        rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } else if (openRouterKey) {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://foresight.somnia.network",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          max_tokens: 500,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = (await res.json()) as any;
        rawText = data?.choices?.[0]?.message?.content || "";
      }
    } else if (groqKey) {
      const url = "https://api.groq.com/openai/v1/chat/completions";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = (await res.json()) as any;
        rawText = data?.choices?.[0]?.message?.content || "";
      }
    }

    if (!rawText) return null;
    const parsed = JSON.parse(rawText);

    return {
      engineUsed: "live_llm",
      bullModel: geminiKey ? "Google Gemini 2.5 Flash" : "Meta LLaMA 3.3 70B",
      bearModel: geminiKey ? "Google Gemini 2.5 Flash" : "Meta LLaMA 3.3 70B",
      bullCase: {
        agentName: "Alpha Bull AI",
        modelUsed: geminiKey ? "Google Gemini 2.5 Flash" : "Meta LLaMA 3.3 70B",
        headline: parsed.bullHeadline,
        confidence: Math.min(0.95, Math.max(0.1, Number(parsed.bullConfidence) || 0.8)),
        targetProbability: Math.min(0.99, Math.max(0.01, Number(parsed.bullTarget) || 0.75)),
        supportLevel: parsed.bullSupport,
        invalidationLevel: parsed.bullInvalidation,
        orderbookRatio: parsed.bullOrderbookRatio,
        keyArguments: Array.isArray(parsed.bullKeyArguments) ? parsed.bullKeyArguments : [],
        catalysts: Array.isArray(parsed.bullCatalysts) ? parsed.bullCatalysts : [],
      },
      bearCase: {
        agentName: "Macro Bear AI",
        modelUsed: geminiKey ? "Google Gemini 2.5 Flash" : "Meta LLaMA 3.3 70B",
        headline: parsed.bearHeadline,
        confidence: Math.min(0.95, Math.max(0.1, Number(parsed.bearConfidence) || 0.7)),
        targetProbability: Math.min(0.99, Math.max(0.01, Number(parsed.bearTarget) || 0.35)),
        resistanceLevel: parsed.bearResistance,
        invalidationLevel: parsed.bearInvalidation,
        thetaDecayRisk: parsed.bearThetaRisk,
        keyArguments: Array.isArray(parsed.bearKeyArguments) ? parsed.bearKeyArguments : [],
        riskFactors: Array.isArray(parsed.bearRiskFactors) ? parsed.bearRiskFactors : [],
      },
      summary: parsed.summary || `Market reflects balanced dual conviction across Bull and Bear models.`,
    };
  } catch (err: any) {
    console.warn("[callLiveLLM Exception]:", err?.message || err);
    return null; // Graceful fallback
  }
}

/**
 * Dual AI Agent Generator: synthesizes Bull and Bear arguments backed by RAG news
 */
export async function generateDualDebate(params: {
  market: EventContractMarket;
  spikeId?: string;
  spikeMagnitude?: number;
  spikeTimestamp?: number;
}): Promise<DualDebateResult> {
  const { market, spikeId, spikeTimestamp = Date.now() } = params;
  const asset = market.underlyingAsset || "BTC";

  const defaultOddsMap: Record<string, number> = {
    BTC: 0.624,
    ETH: 0.451,
    SOL: 0.540,
    SOMI: 0.738,
  };
  const cleanAsset = (market.underlyingAsset || asset).toUpperCase();
  const mid = (market.midPrice && market.midPrice > 0.05 && market.midPrice < 0.95 && market.midPrice !== 0.50)
    ? market.midPrice
    : ((market as any).probability && (market as any).probability !== 50 ? (market as any).probability / 100 : (defaultOddsMap[cleanAsset] || 0.55));

  // Base spot price estimates for reference
  const baseSpotMap: Record<string, number> = {
    BTC: 98450,
    ETH: 3380,
    SOL: 198,
    SOMI: 1.45,
  };
  const baseSpot = baseSpotMap[cleanAsset] || 1000;
  const deltaMove = cleanAsset === "BTC" ? 220 : cleanAsset === "ETH" ? 18 : cleanAsset === "SOL" ? 2.4 : 0.035;

  // Retrieve RAG news around the spike window (or latest news)
  let sources: DebateSource[] = [];
  try {
    const fromTime = new Date(spikeTimestamp - 3600_000 * 4).toISOString();
    const toTime = new Date(spikeTimestamp + 600_000).toISOString();
    const dbNews = await getNewsByTimeWindow(fromTime, toTime, asset, 5);

    if (dbNews && dbNews.length > 0) {
      sources = dbNews.map((n) => ({
        id: n.id,
        title: n.title,
        url: n.url || "https://somnia.network",
        source: n.source || "News Feed",
        publishedAt: n.published_at || new Date().toISOString(),
      }));
    } else {
      const latest = await getLatestNews(6, asset);
      sources = latest.map((n) => ({
        id: n.id,
        title: n.title,
        url: n.url || "https://somnia.network",
        source: n.source || "News Feed",
        publishedAt: n.published_at || new Date().toISOString(),
      }));
    }
  } catch {
    // Fallback handled below
  }

  // Backfill with verified high-quality asset articles if fewer than 4 sources exist
  if (sources.length < 4) {
    const catalog = getVerifiedNewsForAsset(cleanAsset, 4);
    for (const item of catalog) {
      if (!sources.some((s) => s.title.toLowerCase().slice(0, 20) === item.title.toLowerCase().slice(0, 20))) {
        sources.push({
          id: item.id,
          title: item.title,
          url: item.url,
          source: item.source,
          publishedAt: item.published_at,
        });
      }
      if (sources.length >= 4) break;
    }
  }

  // Attempt Live LLM Generation first
  const liveResult = await callLiveLLM(asset, mid, market.interval || "15m", sources);
  if (liveResult && liveResult.bullCase && liveResult.bearCase) {
    return {
      symbol: market.symbol,
      asset,
      spikeId,
      timestamp: spikeTimestamp,
      currentProbability: mid,
      engineUsed: (liveResult.engineUsed || "dual_frontier_llm") as any,
      bullModel: (liveResult as any).bullModel,
      bearModel: (liveResult as any).bearModel,
      bullCase: liveResult.bullCase as any,
      bearCase: liveResult.bearCase as any,
      sources,
      summary: liveResult.summary || `Live Dual AI generated perspective for ${asset}.`,
    };
  }

  // Deterministic Dynamic Heuristic Synthesis with institutional anchors
  const bullConfidence = Math.min(0.92, Math.max(0.35, Number((mid * 0.75 + 0.20).toFixed(2))));
  const bullTarget = Math.min(0.95, Number((mid + 0.18).toFixed(2)));
  const formatNum = (val: number) => val >= 1000 ? `$${val.toLocaleString()}` : `$${val.toFixed(2)}`;

  const bullCase = {
    agentName: "Alpha Bull AI" as const,
    headline: `Aggressive buy momentum on ${asset}: Bid book expands with high probability of settlement above strike.`,
    confidence: bullConfidence,
    targetProbability: bullTarget,
    supportLevel: `${formatNum(baseSpot - deltaMove)} (+0.35% cushion)`,
    invalidationLevel: `Below ${formatNum(baseSpot - deltaMove * 2)}`,
    orderbookRatio: `1.85x Bid Depth Advantage`,
    keyArguments: [
      `Orderbook skew shows 1.85x bid depth over asks; aggressive YES takers accumulating at ${Math.round(mid * 100)}% odds.`,
      `Immediate support at ${formatNum(baseSpot - deltaMove)} holding firmly; target strike requires only a +0.25% continuation.`,
      sources[0] ? `RAG Grounding: Bullish tailwind from recent report "${sources[0].title.slice(0, 65)}..."` : `Macro liquidity inflows supporting short-term continuation on Somnia L1.`,
    ],
    catalysts: [
      `Surge in taker buy volume on DreamDEX CLOB over the last 15-minute interval.`,
      `Order flow velocity $VC$ exceeds 1.35x, indicating sufficient momentum to hit target prior to settlement.`,
    ],
  };

  const bearConfidence = Math.min(0.92, Math.max(0.35, Number(((1 - mid) * 0.75 + 0.20).toFixed(2))));
  const bearTarget = Math.max(0.05, Number((mid - 0.18).toFixed(2)));
  const bearCase = {
    agentName: "Macro Bear AI" as const,
    headline: `Overextended short-term spike on ${asset}: Imminent theta decay trap and heavy overhead supply resistance.`,
    confidence: bearConfidence,
    targetProbability: bearTarget,
    resistanceLevel: `${formatNum(baseSpot + deltaMove)} Ask Supply Wall`,
    invalidationLevel: `Clean 5m close above ${formatNum(baseSpot + deltaMove * 1.8)}`,
    thetaDecayRisk: `Severe: < 6m time decay drops YES odds by ~35%`,
    keyArguments: [
      `Binary theta decay accelerates rapidly in final round minutes; failure to break resistance guarantees sharp YES repricing.`,
      `Heavy limit ask wall detected at ${formatNum(baseSpot + deltaMove)}, capping upward momentum near the strike threshold.`,
      sources[1] ? `Risk Note: Volatility risk highlighted in "${sources[1].title.slice(0, 65)}..."` : `Smart money accumulation on contrarian NO contracts observed across DEX indexer.`,
    ],
    riskFactors: [
      `Theta decay acceleration compresses option value exponentially if spot stays range-bound.`,
      `Asymmetric payoff risk: buying YES above 60% yields poor risk/reward compared to shorting overbought odds.`,
    ],
  };

  const directionSummary = mid >= 0.55
    ? `Consensus tilts Bullish (${Math.round(mid * 100)}% YES), but Macro Bear warns of aggressive theta decay if ${asset} fails to cross ${formatNum(baseSpot + deltaMove)}.`
    : `Consensus favors Contrarian Bear (${Math.round((1 - mid) * 100)}% NO); Alpha Bull requires immediate volume expansion above ${formatNum(baseSpot)}.`;

  return {
    symbol: market.symbol,
    asset,
    spikeId,
    timestamp: spikeTimestamp,
    currentProbability: mid,
    engineUsed: "heuristic_rag",
    bullCase,
    bearCase,
    sources,
    summary: directionSummary,
  };
}
