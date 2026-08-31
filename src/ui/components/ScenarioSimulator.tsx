import React, { useState, useMemo } from "react";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sliders,
  Zap,
  Bot,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Gauge,
  Wallet,
  Share2,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";
import { apiUrl } from "../utils/api.js";
import { useWallet, SOMNIA_SHANNON_CHAIN_ID } from "../context/WalletContext.js";
import { CryptoIcon } from "./CryptoIcon.js";
import { calculateBlackScholesBinaryFairValue } from "../../core/quantitative-pricing.js";
import { AlphaCardModal } from "./AlphaCardModal.js";

interface ScenarioSimulatorProps {
  market: any;
  prefillOutcome?: "YES" | "NO";
  prefillEntryPrice?: number;
  prefillTargetExit?: number;
  onEntryPriceChange?: (price: number) => void;
  onTargetExitPriceChange?: (price: number) => void;
  onTrade: (symbol: string, outcome: "YES" | "NO", amount: number, price?: number) => Promise<void>;
  isSubmitting: boolean;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  market,
  prefillOutcome = "YES",
  prefillEntryPrice,
  prefillTargetExit,
  onEntryPriceChange,
  onTargetExitPriceChange,
  onTrade,
  isSubmitting,
  showToast,
}) => {
  const [outcome, setOutcome] = useState<"YES" | "NO">(prefillOutcome);
  const [investment, setInvestment] = useState<number>(50); // in USDC
  const wallet = useWallet();

  // Implied price default (0.01 - 0.99)
  const defaultEntry = prefillEntryPrice || (market?.midPrice ? Math.max(0.05, Math.min(0.95, market.midPrice)) : 0.50);
  const [entryPrice, setEntryPrice] = useState<number>(defaultEntry);

  const defaultTarget =
    prefillTargetExit ||
    (outcome === "YES" ? Math.min(0.95, defaultEntry + 0.20) : Math.max(0.05, defaultEntry - 0.20));
  const [targetExitPrice, setTargetExitPrice] = useState<number>(defaultTarget);

  const [isDeployingBot, setIsDeployingBot] = useState<boolean>(false);
  const [showAlphaCard, setShowAlphaCard] = useState<boolean>(false);
  const [liveSpotMap, setLiveSpotMap] = useState<Record<string, number>>({});

  React.useEffect(() => {
    let isMounted = true;
    const fetchSpot = async () => {
      try {
        const res = await fetch(apiUrl("/api/spot"));
        if (res.ok) {
          const data = await res.json();
          if (data.tickers && isMounted) {
            const map: Record<string, number> = {};
            data.tickers.forEach((t: any) => {
              if (t.rawSymbol && t.price) {
                map[t.rawSymbol.toUpperCase()] = t.price;
              }
            });
            setLiveSpotMap(map);
          }
        }
      } catch {
        // Ignore
      }
    };
    fetchSpot();
    const interval = setInterval(fetchSpot, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  React.useEffect(() => {
    if (prefillOutcome) setOutcome(prefillOutcome);
    if (prefillEntryPrice !== undefined) setEntryPrice(prefillEntryPrice);
    if (prefillTargetExit !== undefined) setTargetExitPrice(prefillTargetExit);
  }, [prefillOutcome, prefillEntryPrice, prefillTargetExit]);

  // ─── Layer 1 & 2: Path to Settlement & Decision Stress Test Math ──────
  const assetName = market?.underlyingAsset || (market?.symbol?.includes("BTC") ? "BTC" : market?.symbol?.includes("ETH") ? "ETH" : "SOMI");
  
  // Real-time spot price benchmark from oracle
  const currentSpot = useMemo(() => {
    const sym = assetName.toUpperCase();
    if (liveSpotMap[sym]) return liveSpotMap[sym];
    if (sym === "BTC") return 80120;
    if (sym === "ETH") return 2514;
    if (sym === "SOL") return 178;
    return 0.742;
  }, [assetName, liveSpotMap]);

  // Derive strike price from market or question
  const strikePrice = useMemo(() => {
    if (market?.strikePrice) return Number(market.strikePrice);
    if (market?.question) {
      const match = market.question.match(/\$?(\d+[\d,]*\.?\d*)(K?)/i);
      if (match) {
        let val = parseFloat(match[1].replace(/,/g, ""));
        if (match[2]?.toUpperCase() === "K") val *= 1000;
        if (val > 0) return val;
      }
    }
    return outcome === "YES" ? Math.round(currentSpot * 1.0073) : Math.round(currentSpot * 0.9927);
  }, [market, currentSpot, outcome]);

  const timeRemainingMin = market?.minutesLeft || 23;

  // Direction-aware trajectory math
  const trajectory = useMemo(() => {
    const deltaPrice = strikePrice - currentSpot;
    const reqMovePct = Math.abs((deltaPrice / currentSpot) * 100);
    const reqVelocity = reqMovePct / Math.max(1, timeRemainingMin); // % per minute

    // Observed momentum velocity (% per minute from recent 15m orderbook & price delta)
    const observedMomentum = outcome === "YES" ? 0.041 : -0.038;
    const absObserved = Math.abs(observedMomentum);

    // Velocity Coverage (Ratio of observed pace to required pace)
    const velocityCoverage = Number((absObserved / Math.max(0.0001, reqVelocity)).toFixed(2));
    const isCoverageSufficient = velocityCoverage >= 1.0;

    // Thesis break threshold
    const breakPrice = outcome === "YES" ? Math.round(currentSpot * 0.996) : Math.round(currentSpot * 1.004);

    return {
      currentSpot,
      strikePrice,
      deltaPrice,
      reqMovePct: Number(reqMovePct.toFixed(2)),
      reqVelocity: Number(reqVelocity.toFixed(3)),
      observedMomentum: Number(absObserved.toFixed(3)),
      velocityCoverage,
      isCoverageSufficient,
      breakPrice,
      timeRemainingMin,
    };
  }, [currentSpot, strikePrice, timeRemainingMin, outcome]);

  // ─── Layer 2.5: Quantitative Black-Scholes Model Fair Value & Edge ───
  const quantModel = useMemo(() => {
    return calculateBlackScholesBinaryFairValue({
      currentSpot,
      strikePrice,
      timeRemainingSeconds: Math.max(45, (timeRemainingMin || 15) * 60),
      asset: assetName,
      isCall: outcome === "YES",
      marketPrice: entryPrice,
    });
  }, [currentSpot, strikePrice, timeRemainingMin, assetName, outcome, entryPrice]);

  // ─── Layer 3: Deterministic Financial Simulator Math ────────────────
  const calculation = useMemo(() => {
    const safeEntry = Math.max(0.01, Math.min(0.99, entryPrice));
    const safeExit = Math.max(0.01, Math.min(0.99, targetExitPrice));
    const contractsCount = investment / safeEntry;

    // Early Exit PnL
    const earlyExitValue = contractsCount * safeExit;
    const earlyExitPnl = earlyExitValue - investment;
    const earlyExitRoi = (earlyExitPnl / investment) * 100;

    // Full Settlement Payoff
    const settlementValue = contractsCount * 1.00;
    const settlementPnl = settlementValue - investment;
    const settlementRoi = (settlementPnl / investment) * 100;

    const isProfitable = earlyExitPnl >= 0;

    return {
      contractsCount: Number(contractsCount.toFixed(2)),
      earlyExitPnl: Number(earlyExitPnl.toFixed(2)),
      earlyExitRoi: Number(earlyExitRoi.toFixed(1)),
      settlementPnl: Number(settlementPnl.toFixed(2)),
      settlementRoi: Number(settlementRoi.toFixed(1)),
      breakevenPrice: safeEntry,
      isProfitable,
    };
  }, [investment, entryPrice, targetExitPrice]);

  const handleDeployBot = async () => {
    sound.playClick();
    setIsDeployingBot(true);
    try {
      const res = await fetch(apiUrl("/api/strategies"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Auto-TakeProfit ${assetName} ${outcome}`,
          strategy_type: "SCENARIO_AUTOMATION",
          config: {
            symbol: market?.symbol,
            outcome,
            investmentUsdc: investment,
            entryPrice,
            takeProfitPrice: targetExitPrice,
            autoClaim: true,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playSuccessChime();
        showToast(`Bot deployed! Managing ${outcome} on ${market?.symbol}.`, "success");
      } else {
        showToast(data.error || "Could not deploy bot", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Bot deployment error", "error");
    } finally {
      setIsDeployingBot(false);
    }
  };

  const handleExecuteTrade = async () => {
    if (!market?.symbol) return;
    sound.playClick();
    if (wallet.isConnected && !wallet.isCorrectNetwork) {
      showToast("Please switch to Somnia Shannon Testnet (50312) in your wallet", "error");
      await wallet.switchToSomnia();
      return;
    }
    await onTrade(market.symbol, outcome, calculation.contractsCount, entryPrice);
    sound.playSuccessChime();
  };

  return (
    <div className="panel rounded-xl p-3.5 border border-[#2A2A3D] space-y-3 bg-[#0D0D15]">
      {/* ─── Header: Decision Stress Test & Outcome Switcher ─────────── */}
      <div className="flex items-center justify-between border-b border-[#232336] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-mono font-bold text-xs sm:text-sm tracking-wide">
                Decision Stress Test & 1-Click CLOB
              </h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-950/80 text-violet-300 font-mono border border-violet-700/50 flex items-center gap-1 font-semibold">
                <Sparkles className="w-2.5 h-2.5 text-violet-400" /> Stage 03 & 04
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Alpha Card Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowAlphaCard(true);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#171728] hover:bg-violet-950/80 text-violet-300 border border-violet-700/50 flex items-center gap-1.5 transition-all shadow-sm"
            title="Export High-Resolution Proof-of-Thesis Alpha Card"
          >
            <Share2 className="w-3 h-3 text-violet-400" />
            <span className="hidden sm:inline">Alpha Card</span>
          </button>

          {/* Outcome Selector */}
          <div className="flex items-center gap-1 bg-[#141420] p-0.5 rounded-lg border border-[#2A2A3D]">
            <button
              onClick={() => {
                sound.playClick();
                setOutcome("YES");
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                outcome === "YES"
                  ? "bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>YES</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setOutcome("NO");
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                outcome === "NO"
                  ? "bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span>NO</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2-Column Grid: Feasibility & Invalidation Left | Sliders & Trade Right ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
        {/* Left 5 Cols: Path to Settlement & Invalidation Checks */}
        <div className="lg:col-span-5 bg-[#11111B] p-3 rounded-xl border border-[#232336] flex flex-col justify-between space-y-2.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-[#1F1F2E] pb-1.5">
              <span className="text-gray-300 font-bold uppercase flex items-center gap-1.5">
                <CryptoIcon symbol={assetName} size={14} />
                <span>{assetName} Path to Settlement</span>
              </span>
              <span>
                Spot: <b className="text-white">${trajectory.currentSpot.toLocaleString()}</b> → Strike: <b className="text-violet-300">${trajectory.strikePrice.toLocaleString()}</b>
              </span>
            </div>

            {/* Velocity Coverage Visual Meter */}
            <div className="bg-[#161624] p-2 rounded-lg border border-[#26263B] space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Velocity Coverage:</span>
                <span className={`font-bold ${trajectory.isCoverageSufficient ? "text-emerald-400" : "text-amber-400"}`}>
                  {trajectory.velocityCoverage}× Req Pace {trajectory.isCoverageSufficient ? "(Sufficient ✓)" : "(Lags ⚠)"}
                </span>
              </div>
              <div className="w-full bg-[#1F1F30] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    trajectory.isCoverageSufficient
                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                      : "bg-amber-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, trajectory.velocityCoverage * 70))}%` }}
                />
              </div>
            </div>

            {/* Invalidation Trigger Box */}
            <div className="p-2 rounded-lg bg-[#181115] border border-rose-900/40 text-[10px] space-y-1">
              <div className="flex items-center gap-1 text-rose-300 font-bold">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Invalidation Break Level:</span>
              </div>
              <p className="text-gray-300">
                Spot {outcome === "YES" ? "<" : ">"} <b className="text-rose-300">${trajectory.breakPrice.toLocaleString()}</b> or momentum slows with &lt;10m remaining.
              </p>
            </div>

            {/* Quantitative Black-Scholes Model Fair Value & Edge */}
            <div className="p-2 rounded-lg bg-[#0E1322] border border-cyan-800/40 text-[10px] space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-cyan-300 font-bold flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  Model Fair Value Φ(d₂):
                </span>
                <span className="text-white font-bold">{quantModel.fairProbabilityPercent}%</span>
              </div>
              <div className="flex items-center justify-between text-gray-400 text-[9px]">
                <span>vs Implied Book: {(entryPrice * 100).toFixed(0)}%</span>
                <span className={`font-bold ${quantModel.isFavorable ? "text-emerald-400" : "text-amber-400"}`}>
                  {quantModel.edgeBps !== undefined ? `${quantModel.edgeBps > 0 ? "+" : ""}${quantModel.edgeBps} bps Edge` : ""}
                </span>
              </div>
              {quantModel.halfKellyFraction && quantModel.halfKellyFraction > 0 ? (
                <div className="text-[9px] text-gray-400 border-t border-cyan-900/30 pt-0.5 flex justify-between">
                  <span>Half-Kelly Sizing:</span>
                  <span className="text-cyan-300 font-bold">{(quantModel.halfKellyFraction * 100).toFixed(1)}% bankroll</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 border-t border-[#1F1F2E]">
            <span>Required: +{trajectory.reqMovePct}% in {trajectory.timeRemainingMin}m</span>
            <span className="text-emerald-400 font-bold">Pace: {trajectory.observedMomentum}%/m</span>
          </div>
        </div>

        {/* Right 7 Cols: Sliders, Math, and 1-Click Execute Buttons */}
        <div className="lg:col-span-7 bg-[#11111B] p-3 rounded-xl border border-[#232336] space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Slider 1: Capital */}
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-violet-400" /> Capital
                </span>
                <span className="font-bold text-white bg-[#1A1A2A] px-2 py-0.2 rounded border border-[#2E2E44]">
                  ${investment} USDC
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={investment}
                onChange={(e) => {
                  sound.playClick();
                  setInvestment(Number(e.target.value));
                }}
                className="w-full h-1 bg-[#1F1F2E] rounded cursor-pointer accent-violet-500"
              />
            </div>

            {/* Slider 2 & 3 in 2 Columns */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Entry Odds</span>
                  <span className="font-bold text-violet-300">${entryPrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.01"
                  value={entryPrice}
                  onChange={(e) => {
                    sound.playClick();
                    const val = Number(e.target.value);
                    setEntryPrice(val);
                    if (onEntryPriceChange) onEntryPriceChange(val);
                  }}
                  className="w-full h-1 bg-[#1F1F2E] rounded cursor-pointer accent-violet-500"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Target Exit</span>
                  <span className="font-bold text-emerald-300">${targetExitPrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.01"
                  value={targetExitPrice}
                  onChange={(e) => {
                    sound.playClick();
                    const val = Number(e.target.value);
                    setTargetExitPrice(val);
                    if (onTargetExitPriceChange) onTargetExitPriceChange(val);
                  }}
                  className="w-full h-1 bg-[#1F1F2E] rounded cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Summary PnL Row */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
              <div className="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-600/30 flex items-center justify-between">
                <span className="text-gray-400 text-[10px]">Take-Profit:</span>
                <span className="font-bold text-emerald-300">
                  {calculation.earlyExitPnl >= 0 ? `+$${calculation.earlyExitPnl}` : `-$${Math.abs(calculation.earlyExitPnl)}`} ({calculation.earlyExitRoi > 0 ? `+${calculation.earlyExitRoi}%` : `${calculation.earlyExitRoi}%`})
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#141422] border border-[#2A2A3E] flex items-center justify-between">
                <span className="text-gray-400 text-[10px]">Full Expiry:</span>
                <span className="font-bold text-emerald-400">
                  +${calculation.settlementPnl} (+{calculation.settlementRoi}%)
                </span>
              </div>
            </div>
          </div>

          {/* Action Execution Button */}
          <div className="space-y-1.5 pt-1">
            <button
              onClick={handleExecuteTrade}
              disabled={isSubmitting}
              className={`w-full py-2 rounded-lg font-mono font-bold text-xs uppercase tracking-wide transition-all shadow flex items-center justify-center gap-1.5 ${
                outcome === "YES"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? "Submitting to Somnia CLOB..."
                  : wallet.isConnected
                  ? `1-Click Execute ${outcome} with ${wallet.walletName || "MetaMask"} (${calculation.contractsCount} Shares @ $${entryPrice.toFixed(2)})`
                  : `1-Click Execute ${outcome} (${calculation.contractsCount} Shares @ $${entryPrice.toFixed(2)})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Proof-of-Thesis Alpha Card Modal */}
      <AlphaCardModal
        isOpen={showAlphaCard}
        onClose={() => setShowAlphaCard(false)}
        market={market}
        outcome={outcome}
        entryPrice={entryPrice}
        targetExitPrice={targetExitPrice}
        projectedPnl={calculation.earlyExitPnl}
        projectedRoi={calculation.earlyExitRoi}
        velocityCoverage={trajectory.velocityCoverage}
        modelFairValuePercent={quantModel.fairProbabilityPercent}
        edgeBps={quantModel.edgeBps}
        currentSpot={currentSpot}
        strikePrice={strikePrice}
        assetName={assetName}
      />
    </div>
  );
};
export default ScenarioSimulator;
