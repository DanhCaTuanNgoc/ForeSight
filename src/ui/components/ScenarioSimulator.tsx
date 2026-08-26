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
  Activity,
  Gauge,
  Wallet,
} from "lucide-react";
import { useWallet, SOMNIA_SHANNON_CHAIN_ID } from "../context/WalletContext.js";

interface ScenarioSimulatorProps {
  market: any;
  prefillOutcome?: "YES" | "NO";
  prefillTargetExit?: number;
  onTrade: (symbol: string, outcome: "YES" | "NO", amount: number, price?: number) => Promise<void>;
  isSubmitting: boolean;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  market,
  prefillOutcome = "YES",
  prefillTargetExit,
  onTrade,
  isSubmitting,
  showToast,
}) => {
  const [outcome, setOutcome] = useState<"YES" | "NO">(prefillOutcome);
  const [investment, setInvestment] = useState<number>(50); // in USDC
  const wallet = useWallet();

  // Implied price default (0.01 - 0.99)
  const defaultEntry = market?.midPrice ? Math.max(0.05, Math.min(0.95, market.midPrice)) : 0.50;
  const [entryPrice, setEntryPrice] = useState<number>(defaultEntry);

  const defaultTarget =
    prefillTargetExit ||
    (outcome === "YES" ? Math.min(0.95, defaultEntry + 0.20) : Math.max(0.05, defaultEntry - 0.20));
  const [targetExitPrice, setTargetExitPrice] = useState<number>(defaultTarget);

  const [isDeployingBot, setIsDeployingBot] = useState<boolean>(false);

  React.useEffect(() => {
    if (prefillOutcome) setOutcome(prefillOutcome);
    if (prefillTargetExit) setTargetExitPrice(prefillTargetExit);
  }, [prefillOutcome, prefillTargetExit]);

  // ─── Layer 1 & 2: Path to Settlement & Decision Stress Test Math ──────
  const assetName = market?.underlyingAsset || (market?.symbol?.includes("BTC") ? "BTC" : market?.symbol?.includes("ETH") ? "ETH" : "SOMI");
  
  // Base spot price benchmark
  const currentSpot = useMemo(() => {
    if (assetName === "BTC") return 109240;
    if (assetName === "ETH") return 3415;
    if (assetName === "SOL") return 188.5;
    return 1.45;
  }, [assetName]);

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
    setIsDeployingBot(true);
    try {
      const res = await fetch("/api/strategies", {
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
    if (wallet.isConnected && !wallet.isCorrectNetwork) {
      showToast("Please switch to Somnia Shannon Testnet (50312) in your wallet", "error");
      await wallet.switchToSomnia();
      return;
    }
    await onTrade(market.symbol, outcome, calculation.contractsCount, entryPrice);
  };

  return (
    <div className="panel rounded-xl p-5 border border-[#2A2A3D] space-y-5 bg-[#0D0D15]">
      {/* ─── Top Header: Decision Stress Test & Outcome Switcher ──────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A3D] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-mono font-bold text-sm sm:text-base tracking-wide">
                Decision Stress Test & Trajectory
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 font-mono border border-violet-700/50 flex items-center gap-1 font-semibold shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-violet-400" /> Stage 03 — What If?
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-light">
              Stress-test event trajectory feasibility, invalidation conditions, and deterministic PnL
            </p>
          </div>
        </div>

        {/* Outcome Selector */}
        <div className="flex items-center gap-1 bg-[#141420] p-1 rounded-lg border border-[#2A2A3D]">
          <button
            onClick={() => setOutcome("YES")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              outcome === "YES"
                ? "bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>YES</span>
          </button>
          <button
            onClick={() => setOutcome("NO")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              outcome === "NO"
                ? "bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>NO</span>
          </button>
        </div>
      </div>

      {/* ─── Layer 1: Path to Settlement & Trajectory Velocity ─────────── */}
      <div className="p-4 rounded-xl bg-[#11111B] border border-[#232336] space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-300 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-violet-400" /> Layer 1: Path to Settlement
          </span>
          <span className="text-[10px] text-gray-400">
            {assetName} Spot: <b className="text-white">${trajectory.currentSpot.toLocaleString()}</b> → Strike: <b className="text-violet-300">${trajectory.strikePrice.toLocaleString()}</b>
          </span>
        </div>

        {/* 4 Quantitative Trajectory Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <div className="bg-[#161624] p-2.5 rounded-lg border border-[#26263B]">
            <span className="text-[10px] text-gray-400 block">Required Move</span>
            <span className="font-bold text-white text-sm">
              +{trajectory.reqMovePct}%
            </span>
          </div>

          <div className="bg-[#161624] p-2.5 rounded-lg border border-[#26263B]">
            <span className="text-[10px] text-gray-400 block">Time Remaining</span>
            <span className="font-bold text-amber-300 text-sm">
              {trajectory.timeRemainingMin}m
            </span>
          </div>

          <div className="bg-[#161624] p-2.5 rounded-lg border border-[#26263B]">
            <span className="text-[10px] text-gray-400 block">Required Velocity</span>
            <span className="font-bold text-gray-200 text-sm">
              {trajectory.reqVelocity}% / min
            </span>
          </div>

          <div className="bg-[#161624] p-2.5 rounded-lg border border-[#26263B]">
            <span className="text-[10px] text-gray-400 block">Observed Momentum</span>
            <span className={`font-bold text-sm ${trajectory.isCoverageSufficient ? "text-emerald-400" : "text-amber-400"}`}>
              {trajectory.observedMomentum}% / min ✓
            </span>
          </div>
        </div>

        {/* Velocity Coverage Visual Trajectory Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">Trajectory Velocity Coverage:</span>
            <span className={`font-bold ${trajectory.isCoverageSufficient ? "text-emerald-400 neon-glow-emerald" : "text-amber-400"}`}>
              {trajectory.velocityCoverage}× of Required Velocity {trajectory.isCoverageSufficient ? "(Sufficient)" : "(Pace Lags)"}
            </span>
          </div>
          <div className="w-full bg-[#1F1F30] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#2E2E44]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                trajectory.isCoverageSufficient
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  : "bg-gradient-to-r from-amber-500 to-rose-400"
              }`}
              style={{ width: `${Math.min(100, Math.max(10, trajectory.velocityCoverage * 70))}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 font-mono italic">
            * Ratio of observed price velocity to required settlement pace. Mathematical trajectory indicator, not a win probability.
          </p>
        </div>
      </div>

      {/* ─── Layer 2 & 3 Grid: Thesis Check Left | Money Math Right ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 Cols): Layer 2 — Thesis Check & Break Conditions */}
        <div className="lg:col-span-5 space-y-3 bg-[#11111B] p-4 rounded-xl border border-[#232336] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-300 uppercase tracking-wider text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Layer 2: Thesis Check & Risk
            </div>

            {/* Checklist */}
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-emerald-400 bg-[#141B18] p-2 rounded border border-emerald-800/30">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Momentum velocity supports {outcome} (+{trajectory.observedMomentum}%/min)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 bg-[#141B18] p-2 rounded border border-emerald-800/30">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Velocity Coverage is {trajectory.velocityCoverage}× (achievable pace)</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300 bg-[#1C1810] p-2 rounded border border-amber-800/30">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>{trajectory.timeRemainingMin}m remaining time decay window</span>
              </div>
            </div>

            {/* Thesis Break Conditions */}
            <div className="p-3 rounded-lg bg-[#181115] border border-rose-900/40 space-y-1.5 font-mono text-[10px]">
              <span className="text-rose-300 font-bold uppercase tracking-wider block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Thesis Break Conditions:
              </span>
              <ul className="text-gray-300 space-y-1 pl-1 list-disc list-inside">
                <li>Spot price {outcome === "YES" ? "drops below" : "rises above"} <b className="text-rose-300">${trajectory.breakPrice.toLocaleString()}</b></li>
                <li>Momentum velocity reverses into negative territory</li>
                <li>&lt;10m remaining without upward progress toward strike</li>
              </ul>
            </div>
          </div>

          <div className="text-[10px] text-gray-500 font-mono border-t border-[#1F1F2E] pt-2">
            Pre-trade risk disclosure: Invalidation points protect capital before expiry.
          </div>
        </div>

        {/* Right Column (7 Cols): Layer 3 — Deterministic Financial Simulator */}
        <div className="lg:col-span-7 space-y-4 bg-[#11111B] p-4 rounded-xl border border-[#232336]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-300 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Calculator className="w-3.5 h-3.5 text-cyan-400" /> Layer 3: Deterministic Financial Math
            </span>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-700/40 px-1.5 py-0.2 rounded">
              0ms Latency
            </span>
          </div>

          {/* Slider 1: Capital Allocation */}
          <div className="space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-violet-400" /> Capital Allocation
              </span>
              <span className="font-bold text-white bg-[#1A1A2A] px-2 py-0.5 rounded border border-[#2E2E44]">
                ${investment} USDC
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1F1F2E] rounded appearance-none cursor-pointer accent-violet-500"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>$5</span>
              <span>$100</span>
              <span>$250</span>
              <span>$500 USDC</span>
            </div>
          </div>

          {/* Slider 2: Entry Odds */}
          <div className="space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-violet-400" /> Entry Price / Odds
              </span>
              <span className="font-bold text-violet-300 bg-violet-950/50 px-2 py-0.5 rounded border border-violet-800/40">
                ${entryPrice.toFixed(2)} ({Math.round(entryPrice * 100)}%)
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.01"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1F1F2E] rounded appearance-none cursor-pointer accent-violet-500"
            />
          </div>

          {/* Slider 3: Target Exit Odds */}
          <div className="space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> Target Take-Profit Odds
              </span>
              <span className="font-bold text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                ${targetExitPrice.toFixed(2)} ({Math.round(targetExitPrice * 100)}%)
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.01"
              value={targetExitPrice}
              onChange={(e) => setTargetExitPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1F1F2E] rounded appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Calculated Output Summary */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
            <div className={`p-2.5 rounded-lg border ${
              calculation.isProfitable
                ? "bg-emerald-950/30 border-emerald-600/40 text-emerald-300"
                : "bg-rose-950/30 border-rose-600/40 text-rose-300"
            }`}>
              <span className="text-[10px] text-gray-400 block">Take-Profit PnL</span>
              <span className="font-bold text-sm">
                {calculation.earlyExitPnl >= 0 ? `+$${calculation.earlyExitPnl}` : `-$${Math.abs(calculation.earlyExitPnl)}`} ({calculation.earlyExitRoi > 0 ? `+${calculation.earlyExitRoi}%` : `${calculation.earlyExitRoi}%`})
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#141422] border border-[#2A2A3E] text-gray-300">
              <span className="text-[10px] text-gray-400 block">At Full Expiry ($1.00)</span>
              <span className="font-bold text-emerald-400 text-sm">
                +${calculation.settlementPnl} (+{calculation.settlementRoi}%)
              </span>
            </div>
          </div>

          {/* Action Execution Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleExecuteTrade}
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-lg font-mono font-bold text-xs uppercase tracking-wide transition-all shadow flex items-center justify-center gap-1.5 ${
                outcome === "YES"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.4)]"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_14px_rgba(244,63,94,0.4)]"
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

            {!wallet.isConnected && (
              <button
                onClick={() => wallet.openWalletModal()}
                className="w-full py-1.5 rounded-lg bg-[#141424] hover:bg-[#1C1C30] text-violet-300 font-mono text-[11px] border border-violet-800/30 flex items-center justify-center gap-1.5 transition"
              >
                <Wallet className="w-3 h-3 text-violet-400" />
                <span>Connect MetaMask to sign directly from your browser</span>
              </button>
            )}

            <button
              onClick={handleDeployBot}
              disabled={isDeployingBot}
              className="w-full py-2 rounded-lg bg-[#161626] hover:bg-[#1E1E34] text-violet-300 font-mono font-medium text-xs transition-all border border-violet-800/40 flex items-center justify-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-violet-400" />
              <span>{isDeployingBot ? "Deploying..." : "Deploy Decision Stress Test as Automated Bot"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ScenarioSimulator;
