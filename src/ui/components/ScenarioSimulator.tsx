import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Wallet,
  ArrowRight,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";
import { useWallet } from "../context/WalletContext.js";

export interface ScenarioSimulatorProps {
  market: any;
  prefillOutcome?: "YES" | "NO";
  prefillEntryPrice?: number;
  prefillTargetExit?: number;
  onOutcomeChange?: (outcome: "YES" | "NO") => void;
  onEntryPriceChange?: (price: number) => void;
  onTargetExitPriceChange?: (price: number) => void;
  onTrade: (
    symbol: string,
    outcome: "YES" | "NO",
    amount: number,
    price?: number,
    poolAddress?: string,
    expirationTime?: number
  ) => Promise<void>;
  isSubmitting: boolean;
  submitStep?: "idle" | "approving" | "signing";
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  market,
  prefillOutcome = "YES",
  prefillEntryPrice,
  prefillTargetExit,
  onOutcomeChange,
  onEntryPriceChange,
  onTargetExitPriceChange,
  onTrade,
  isSubmitting,
  submitStep = "idle",
  showToast,
}) => {
  const [outcome, setOutcome] = useState<"YES" | "NO">(prefillOutcome);
  const [orderMode, setOrderMode] = useState<"MARKET" | "LIMIT">("LIMIT");
  const [investment, setInvestment] = useState<number>(50); // in tUSDC
  const wallet = useWallet();

  const realBalanceNum = useMemo(() => {
    if (wallet.isConnected && wallet.tusdcBalance !== null) {
      const parsed = parseFloat(wallet.tusdcBalance);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }, [wallet.isConnected, wallet.tusdcBalance]);

  const availDisplay = useMemo(() => {
    if (!wallet.isConnected) return "—";
    if (wallet.tusdcBalance === null) return "Loading...";
    const num = parseFloat(wallet.tusdcBalance);
    return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tUSDC`;
  }, [wallet.isConnected, wallet.tusdcBalance]);

  // Best available odds from CLOB
  const bestMarketOdds = useMemo(() => {
    if (outcome === "YES") {
      const ask = market?.bestAsk ?? market?.midPrice ?? 0.50;
      return Math.max(0.05, Math.min(0.95, ask));
    } else {
      const yesBid = market?.bestBid ?? market?.midPrice ?? 0.50;
      return Math.max(0.05, Math.min(0.95, 1 - yesBid));
    }
  }, [outcome, market]);

  // Implied price default (0.01 - 0.99)
  const defaultEntry = prefillEntryPrice || (market?.midPrice ? Math.max(0.05, Math.min(0.95, market.midPrice)) : 0.50);
  const [entryPrice, setEntryPrice] = useState<number>(defaultEntry);

  React.useEffect(() => {
    if (prefillOutcome) setOutcome(prefillOutcome);
  }, [prefillOutcome]);

  React.useEffect(() => {
    if (prefillEntryPrice !== undefined) {
      setEntryPrice(prefillEntryPrice);
    }
  }, [prefillEntryPrice]);

  // When switching to MARKET order mode, automatically snap to best available odds
  useEffect(() => {
    if (orderMode === "MARKET") {
      const targetOdds = Number(bestMarketOdds.toFixed(2));
      setEntryPrice(targetOdds);
      if (onEntryPriceChange) onEntryPriceChange(targetOdds);
    }
  }, [orderMode, bestMarketOdds, onEntryPriceChange]);

  // ─── Layer 3: Deterministic Binary Settlement Math ────────────────
  const calculation = useMemo(() => {
    const safeInvestment = Math.max(0.01, investment || 0);
    const safeEntry = Math.max(0.01, Math.min(0.99, entryPrice));
    const contractsCount = safeInvestment / safeEntry;

    // Full Settlement Payoff: Binary prediction market pays $1.00 per share on winning
    const totalPayout = contractsCount * 1.00;
    const netProfit = totalPayout - safeInvestment;
    const roi = safeInvestment > 0 ? (netProfit / safeInvestment) * 100 : 0;

    return {
      contractsCount: Number(contractsCount.toFixed(2)),
      totalPayout: Number(totalPayout.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      roi: Number(roi.toFixed(1)),
      maxLoss: Number(safeInvestment.toFixed(2)),
      oddsPrice: safeEntry,
    };
  }, [investment, entryPrice]);

  const handleExecuteTrade = async () => {
    if (!market?.symbol) return;
    sound.playClick();
    if (!wallet.isConnected || !wallet.address) {
      showToast("Please connect your Web3 wallet (MetaMask) to trade on Somnia L1", "error");
      wallet.openWalletModal();
      return;
    }
    if (!wallet.isCorrectNetwork) {
      showToast("Please switch to Somnia Shannon Testnet (50312) in your wallet", "error");
      await wallet.switchToSomnia();
      return;
    }
    await onTrade(
      market.symbol,
      outcome,
      calculation.contractsCount,
      entryPrice,
      market.poolAddress,
      market.expirationTime
    );
    sound.playSuccessChime();
  };

  const handleSnapBestOdds = () => {
    sound.playClick();
    const best = Number(bestMarketOdds.toFixed(2));
    setEntryPrice(best);
    if (onEntryPriceChange) onEntryPriceChange(best);
    showToast(`Snapped to Best CLOB Odds: $${best.toFixed(2)} (${Math.round(best * 100)}% Implied)`, "info");
  };

  const actionButtonStyles = useMemo(() => {
    if (isSubmitting) {
      return "bg-violet-950/80 border-violet-500/50 text-white cursor-wait";
    }
    if (outcome === "YES") {
      return "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.35)]";
    }
    return "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white border-rose-400/80 shadow-[0_0_15px_rgba(244,63,94,0.35)]";
  }, [outcome, isSubmitting]);

  const renderSubmitLabel = () => {
    if (isSubmitting) {
      if (submitStep === "approving") {
        return (
          <span className="flex items-center gap-2 text-amber-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
            1/2: APPROVING tUSDC IN METAMASK...
          </span>
        );
      }
      if (submitStep === "signing") {
        return (
          <span className="flex items-center gap-2 text-cyan-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
            2/2: SIGNING IN METAMASK...
          </span>
        );
      }
      return (
        <span className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          SUBMITTING ORDER TO SOMNIA L1...
        </span>
      );
    }

    return (
      <span className="flex items-center gap-2">
        <Zap className="w-3.5 h-3.5" />
        BUY {outcome} · {calculation.contractsCount.toLocaleString()} SHARES @ ${entryPrice.toFixed(2)}
      </span>
    );
  };

  return (
    <div className="terminal-panel p-3 bg-[#08080E] border border-white/[0.07] rounded-none space-y-2.5 font-mono">
      {/* ─── Header: Execution Panel Title & Outcome Selector ─── */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.07] pb-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-none bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-mono font-bold text-xs tracking-wider uppercase">
              ORDER TICKET
            </h3>
            <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SOMNIA L1 LIVE
            </span>
          </div>
        </div>

        {/* Outcome Selector (YES / NO) */}
        <div className="flex items-center gap-1 bg-[#0A0A10] p-0.5 rounded-none border border-white/[0.07]">
          <button
            onClick={() => {
              sound.playClick();
              setOutcome("YES");
              if (onOutcomeChange) onOutcomeChange("YES");
            }}
            className={`px-4 py-1 rounded-none text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              outcome === "YES"
                ? "bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "bg-transparent text-gray-400 hover:text-white border-transparent"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>BUY YES</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setOutcome("NO");
              if (onOutcomeChange) onOutcomeChange("NO");
            }}
            className={`px-4 py-1 rounded-none text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              outcome === "NO"
                ? "bg-rose-950/90 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                : "bg-transparent text-gray-400 hover:text-white border-transparent"
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>BUY NO</span>
          </button>
        </div>
      </div>

      {/* ─── Main Order Entry & Payoff Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 font-mono text-xs">
        {/* Left Column (lg:col-span-7): 1. ORDER CONFIGURATION */}
        <div className="lg:col-span-7 bg-[#0B0B12] p-2.5 rounded-none border border-white/[0.07] space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Sub-header & Order Mode Switcher */}
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-1.5">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                <span>1. ORDER CONFIGURATION</span>
              </span>

              {/* Market vs Limit Toggle */}
              <div className="flex items-center gap-1 bg-[#07070B] p-0.5 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setOrderMode("MARKET");
                  }}
                  className={`px-2 py-0.5 text-[9px] font-bold transition-colors cursor-pointer ${
                    orderMode === "MARKET"
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50"
                      : "text-gray-500 hover:text-gray-300 border border-transparent"
                  }`}
                >
                  MARKET
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setOrderMode("LIMIT");
                  }}
                  className={`px-2 py-0.5 text-[9px] font-bold transition-colors cursor-pointer ${
                    orderMode === "LIMIT"
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50"
                      : "text-gray-500 hover:text-gray-300 border border-transparent"
                  }`}
                >
                  LIMIT
                </button>
              </div>
            </div>

            {/* Header: Label + Available Balance */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-mono font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-violet-400" />
                <span>ORDER SIZE</span>
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="text-gray-500">Avail:</span>
                {wallet.isConnected ? (
                  <span className="text-gray-200 font-bold">{availDisplay}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => wallet.openWalletModal()}
                    className="text-violet-400 hover:text-violet-300 font-bold underline cursor-pointer"
                  >
                    Connect Wallet
                  </button>
                )}
                {wallet.isConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setInvestment(realBalanceNum > 0 ? Number(realBalanceNum.toFixed(2)) : 0);
                    }}
                    className="text-[9px] text-violet-400 hover:text-violet-300 font-bold px-1.5 py-0.5 bg-violet-950/40 hover:bg-violet-900/60 border border-violet-500/30 transition-colors cursor-pointer"
                  >
                    MAX
                  </button>
                )}
              </div>
            </div>

            {/* Main Input Group */}
            <div className="bg-[#07070A] border border-white/[0.1] focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/20 p-2 transition-all flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-gray-500 font-mono font-bold text-sm select-none">$</span>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  step="any"
                  value={investment === 0 ? "" : investment}
                  placeholder="50"
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    setInvestment(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-full bg-transparent text-white font-mono font-bold text-sm focus:outline-none placeholder-gray-600"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-[#12121C] px-2 py-0.5 border border-white/[0.08] text-[10px] font-mono text-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-bold">tUSDC</span>
                </div>
              </div>
            </div>

            {/* Quick Size Presets */}
            <div className="grid grid-cols-6 gap-1">
              {[10, 25, 50, 100, 250, 500].map((amt) => {
                const isSelected = investment === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setInvestment(amt);
                    }}
                    className={`py-1 text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-violet-600 text-white border-violet-400/60 shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                        : "bg-[#0E0E17] text-gray-400 border-white/[0.05] hover:text-white hover:bg-[#141422] hover:border-white/[0.1]"
                    }`}
                  >
                    ${amt}
                  </button>
                );
              })}
            </div>

            {/* Percentage Allocations */}
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-0.5">
              <span className="text-gray-400">Quick Alloc:</span>
              <div className="flex items-center gap-1">
                {[25, 50, 75, 100].map((pct) => {
                  const targetVal =
                    realBalanceNum > 0
                      ? Number(((realBalanceNum * pct) / 100).toFixed(2))
                      : pct * 10;
                  const isSelected = investment === targetVal && targetVal > 0;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        if (!wallet.isConnected) {
                          wallet.openWalletModal();
                          return;
                        }
                        setInvestment(targetVal);
                      }}
                      className={`text-[9px] px-2 py-0.5 border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-violet-950 text-violet-300 border-violet-500/50"
                          : "bg-[#0A0A10] text-gray-500 border-white/[0.04] hover:text-gray-300 hover:border-white/[0.1]"
                      }`}
                    >
                      {pct}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Two-Way Conversion Clarity Box (Point 4) ─── */}
            <div className="bg-[#07070E] border border-white/[0.08] px-2.5 py-1.5 text-[10.5px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-gray-500">You Pay:</span>
                <span className="text-white font-bold">${(investment || 0).toFixed(2)} tUSDC</span>
              </div>
              <ArrowRight className="w-3 h-3 text-gray-500 shrink-0" />
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-gray-500">You Receive:</span>
                <span className={`font-bold ${outcome === "YES" ? "text-emerald-300" : "text-rose-300"}`}>
                  {calculation.contractsCount.toFixed(2)} {outcome} Shares
                </span>
                <span className="text-gray-500 text-[9.5px]">(@ ${entryPrice.toFixed(2)})</span>
              </div>
            </div>

            {/* Order Odds / Limit Price Slider & Quick Snap */}
            <div className="space-y-1.5 text-xs pt-1 border-t border-white/[0.05]">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-mono uppercase font-bold">
                    {orderMode === "MARKET" ? "MARKET PRICE / ODDS" : "LIMIT PRICE / ODDS"}
                  </span>
                  {orderMode === "MARKET" && (
                    <span className="text-[9px] px-1 py-0.2 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                      CLOB TAKER
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSnapBestOdds}
                    className="text-[9px] px-1.5 py-0.5 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 border border-cyan-500/30 font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Snap to Best CLOB Odds"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    BEST ODDS
                  </button>
                  <span className="font-bold text-cyan-300 font-mono">
                    ${entryPrice.toFixed(2)} ({Math.round(entryPrice * 100)}% Implied)
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={entryPrice}
                disabled={orderMode === "MARKET"}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setEntryPrice(val);
                  if (onEntryPriceChange) onEntryPriceChange(val);
                }}
                onPointerUp={() => sound.playClick()}
                className={`w-full h-1.5 bg-[#07070A] rounded-none cursor-pointer accent-cyan-400 ${
                  orderMode === "MARKET" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              {orderMode === "MARKET" && (
                <div className="text-[9.5px] text-gray-500 italic">
                  Market order matches best resting orders instantly on Somnia CLOB. Switch to LIMIT to set custom odds.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-5): 2. SETTLEMENT PAYOFF & EXECUTION */}
        <div className="lg:col-span-5 bg-[#0B0B12] p-2.5 rounded-none border border-white/[0.07] flex flex-col justify-between space-y-2.5">
          <div className="space-y-2">
            {/* Sub-header & Contract summary */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-white/[0.05] pb-1.5">
              <span className="font-bold uppercase tracking-wider text-gray-300">
                2. SETTLEMENT PAYOFF & EXECUTION
              </span>
              <span>
                Shares: <b className="text-violet-300 font-bold">{calculation.contractsCount.toLocaleString()}</b>
              </span>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center justify-between text-[10px] bg-[#07070E] px-2 py-1 border border-white/[0.04]">
              <span className="text-gray-400">Contracts: <b className="text-gray-200">{calculation.contractsCount} Shares</b></span>
              <span className="text-gray-400">Avg Price: <b className="text-cyan-300">${entryPrice.toFixed(2)} ({Math.round(entryPrice * 100)}% Implied)</b></span>
            </div>

            {/* Summary Binary Payoff Cards */}
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {/* Potential Payout Card */}
              <div className="p-2 rounded-none bg-[#0E0E17] border border-emerald-500/30 flex flex-col justify-between">
                <span className="text-gray-400 text-[9px] uppercase font-bold">Est. Payout</span>
                <span className="font-bold font-mono text-xs text-emerald-400">
                  ${calculation.totalPayout.toFixed(2)}
                </span>
                <span className="text-[9px] font-mono text-emerald-400/80">
                  +{calculation.roi}% ROI
                </span>
              </div>

              {/* Net Profit Card */}
              <div className="p-2 rounded-none bg-[#0E0E17] border border-white/[0.07] flex flex-col justify-between">
                <span className="text-gray-400 text-[9px] uppercase font-bold">Net Profit</span>
                <span className="font-bold font-mono text-xs text-emerald-300">
                  +${calculation.netProfit.toFixed(2)}
                </span>
                <span className="text-[9px] font-mono text-gray-400">
                  Payout - Cost
                </span>
              </div>

              {/* Max Risk Card */}
              <div className="p-2 rounded-none bg-[#0E0E17] border border-rose-500/20 flex flex-col justify-between">
                <span className="text-gray-400 text-[9px] uppercase font-bold">Max Risk</span>
                <span className="font-bold font-mono text-xs text-rose-400">
                  -${calculation.maxLoss.toFixed(2)}
                </span>
                <span className="text-[9px] text-gray-500 font-mono">
                  -100%
                </span>
              </div>
            </div>

            {/* Contract Specification Note */}
            <div className="text-[10px] text-gray-400 bg-[#0E0E17] p-2 border border-white/[0.04] space-y-0.5">
              <div className="flex justify-between">
                <span>Settlement Rule:</span>
                <span className="text-white font-bold">Binary $1.00 Payout per Share</span>
              </div>
              <div className="flex justify-between">
                <span>Execution Mode:</span>
                <span className="text-cyan-300 font-bold">{orderMode} Order · DreamDEX CLOB</span>
              </div>
            </div>
          </div>

          {/* Action Execution Button & Multi-step Indicator */}
          <div className="space-y-1.5 pt-1">
            {/* 2-Step Approval Progress Tracker (Point 3) */}
            {isSubmitting && (
              <div className="flex items-center justify-between text-[9px] px-2 py-1 bg-[#090914] border border-cyan-500/30 font-mono">
                <span
                  className={
                    submitStep === "approving"
                      ? "text-amber-300 font-bold flex items-center gap-1"
                      : "text-gray-500 flex items-center gap-1"
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      submitStep === "approving" ? "bg-amber-400 animate-pulse" : "bg-gray-600"
                    }`}
                  />
                  1. Approve tUSDC
                </span>
                <ArrowRight className="w-2.5 h-2.5 text-gray-600" />
                <span
                  className={
                    submitStep === "signing"
                      ? "text-cyan-300 font-bold flex items-center gap-1"
                      : "text-gray-500 flex items-center gap-1"
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      submitStep === "signing" ? "bg-cyan-400 animate-pulse" : "bg-gray-600"
                    }`}
                  />
                  2. Somnia Order Sign
                </span>
              </div>
            )}

            {!wallet.isConnected ? (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  wallet.openWalletModal();
                }}
                className="w-full h-10 rounded-none font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/30 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>CONNECT WALLET</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExecuteTrade}
                disabled={isSubmitting}
                className={`w-full h-10 rounded-none font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border cursor-pointer ${actionButtonStyles}`}
              >
                {renderSubmitLabel()}
              </button>
            )}

            <div className="text-center text-[9px] text-gray-500 font-mono">
              ⚡ Gas: &lt;0.001 STT · Instant CLOB on Somnia Shannon Testnet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
