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
} from "lucide-react";

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

  // Deterministic math calculation
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
          name: `Auto-TakeProfit ${market?.underlyingAsset || "BTC"} ${outcome}`,
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
    await onTrade(market.symbol, outcome, calculation.contractsCount, entryPrice);
  };

  return (
    <div className="panel rounded-[4px] p-5 border border-[#2A2A3D] space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A3D] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-mono font-bold text-sm">
                Deterministic Scenario Simulator
              </h3>
              <span className="text-[10px] px-2 py-0.2 rounded bg-violet-950/60 text-violet-300 font-mono border border-violet-700/40 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> What If?
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Interactive PnL & ROI modeling on Somnia DreamDEX CLOB
            </p>
          </div>
        </div>

        {/* Outcome Selector */}
        <div className="flex items-center gap-1 bg-[#111118] p-1 rounded border border-[#2A2A3D]">
          <button
            onClick={() => setOutcome("YES")}
            className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              outcome === "YES"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>YES</span>
          </button>
          <button
            onClick={() => setOutcome("NO")}
            className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              outcome === "NO"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingDown className="w-3 h-3" />
            <span>NO</span>
          </button>
        </div>
      </div>

      {/* Grid: Sliders Left | Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Sliders */}
        <div className="lg:col-span-7 space-y-4 bg-[#111118] p-4 rounded border border-[#2A2A3D]/70">
          {/* 1. Capital Allocation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-300 font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-violet-400" /> Capital Allocation
              </span>
              <span className="font-bold text-white bg-[#1A1A26] px-2 py-0.5 rounded border border-[#2A2A3D]">
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
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>$5</span>
              <span>$100</span>
              <span>$250</span>
              <span>$500 USDC</span>
            </div>
          </div>

          {/* 2. Entry Price */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-300 font-medium flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-violet-400" /> Entry Price / Odds
              </span>
              <span className="font-bold text-violet-300 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-800/40">
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
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>$0.05</span>
              <span>$0.50</span>
              <span>$0.95</span>
            </div>
          </div>

          {/* 3. Target Exit */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-300 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Target Take-Profit Odds
              </span>
              <span className="font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
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
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>$0.05</span>
              <span>$0.50</span>
              <span>$0.95</span>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Results & Live Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="p-4 rounded border border-[#2A2A3D] bg-[#111118] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Contracts Purchased:</span>
              <span className="font-bold text-white">
                {calculation.contractsCount} {outcome}
              </span>
            </div>

            {/* Early Exit PnL Box */}
            <div
              className={`p-3 rounded border font-mono ${
                calculation.isProfitable
                  ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/20 border-rose-500/40 text-rose-300"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Take-Profit PnL:</span>
                <span className="font-bold text-sm">
                  {calculation.earlyExitPnl >= 0 ? `+$${calculation.earlyExitPnl}` : `-$${Math.abs(calculation.earlyExitPnl)}`} USDC
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Expected ROI:</span>
                <span className="font-bold">
                  {calculation.earlyExitRoi >= 0 ? `+${calculation.earlyExitRoi}%` : `${calculation.earlyExitRoi}%`}
                </span>
              </div>
            </div>

            {/* Expiry Settlement */}
            <div className="p-2.5 rounded bg-[#0D0D14] border border-[#2A2A3D] space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-gray-300">
                <span>If Held to Expiry ($1.00):</span>
                <span className="font-bold text-emerald-400">
                  +${calculation.settlementPnl} (+{calculation.settlementRoi}%)
                </span>
              </div>
            </div>
          </div>

          {/* Action Execution Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleExecuteTrade}
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded font-mono font-bold text-xs uppercase tracking-wide transition-all shadow flex items-center justify-center gap-1.5 ${
                outcome === "YES"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-rose-600 hover:bg-rose-500 text-white"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? "Submitting..."
                  : `1-Click Execute ${outcome} ($${investment} USDC)`}
              </span>
            </button>

            <button
              onClick={handleDeployBot}
              disabled={isDeployingBot}
              className="w-full py-2 rounded bg-[#161624] hover:bg-[#1C1C2E] text-violet-300 font-mono font-medium text-xs transition-all border border-violet-800/40 flex items-center justify-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-violet-400" />
              <span>{isDeployingBot ? "Deploying..." : "Deploy Scenario as Automated Bot"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ScenarioSimulator;
