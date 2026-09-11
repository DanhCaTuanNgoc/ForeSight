import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Wallet,
  Loader2,
  CheckCircle2,
  Plus,
  Minus,
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
  onOutcomeChange,
  onEntryPriceChange,
  onTrade,
  isSubmitting,
  submitStep = "idle",
  showToast,
}) => {
  const [outcome, setOutcome] = useState<"YES" | "NO">(prefillOutcome);
  const [orderMode, setOrderMode] = useState<"MARKET" | "LIMIT">("MARKET");
  const [investment, setInvestment] = useState<number>(50); // in tUSDC
  const wallet = useWallet();

  // Balance
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

  // Live Prices in Cents (Polymarket format)
  const yesPrice = useMemo(() => {
    const p = market?.bestAsk ?? market?.midPrice ?? 0.50;
    return Math.max(0.01, Math.min(0.99, Number(p.toFixed(2))));
  }, [market]);

  const noPrice = useMemo(() => {
    const p = 1 - (market?.bestBid ?? market?.midPrice ?? 0.50);
    return Math.max(0.01, Math.min(0.99, Number(p.toFixed(2))));
  }, [market]);

  const defaultEntry = outcome === "YES" ? yesPrice : noPrice;
  const [entryPrice, setEntryPrice] = useState<number>(prefillEntryPrice || defaultEntry);

  // Sync outcome
  useEffect(() => {
    if (prefillOutcome) {
      setOutcome(prefillOutcome);
      if (orderMode === "MARKET") {
        setEntryPrice(prefillOutcome === "YES" ? yesPrice : noPrice);
      }
    }
  }, [prefillOutcome, yesPrice, noPrice, orderMode]);

  // Sync prefill price
  useEffect(() => {
    if (prefillEntryPrice !== undefined) {
      setEntryPrice(prefillEntryPrice);
    }
  }, [prefillEntryPrice]);

  // Update entry price when outcome or mode changes
  const handleSelectOutcome = (side: "YES" | "NO") => {
    sound.playClick();
    setOutcome(side);
    if (onOutcomeChange) onOutcomeChange(side);
    const targetPrice = side === "YES" ? yesPrice : noPrice;
    if (orderMode === "MARKET") {
      setEntryPrice(targetPrice);
      if (onEntryPriceChange) onEntryPriceChange(targetPrice);
    }
  };

  // ─── Polymarket Deterministic Binary Payoff Calculation ───────────
  const calculation = useMemo(() => {
    const safeInvestment = Math.max(0.01, investment || 0);
    const safeEntry = Math.max(0.01, Math.min(0.99, entryPrice));
    const contractsCount = safeInvestment / safeEntry;

    // Full Polymarket & DreamDEX Settlement: Pays $1.00 per winning contract
    const totalPayout = contractsCount * 1.00;
    const netProfit = totalPayout - safeInvestment;
    const roi = safeInvestment > 0 ? (netProfit / safeInvestment) * 100 : 0;

    return {
      contractsCount: Number(contractsCount.toFixed(2)),
      totalPayout: Number(totalPayout.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      roi: Number(roi.toFixed(1)),
      maxLoss: Number(safeInvestment.toFixed(2)),
    };
  }, [investment, entryPrice]);

  // Execute trade
  const handleExecuteTrade = async () => {
    if (!market?.symbol) return;
    sound.playClick();
    if (!wallet.isConnected || !wallet.address) {
      showToast("Please connect MetaMask to trade on Somnia L1", "error");
      wallet.openWalletModal();
      return;
    }
    if (!wallet.isCorrectNetwork) {
      showToast("Please switch network to Somnia Shannon Testnet (50312)", "error");
      await wallet.switchToSomnia();
      return;
    }
    if (wallet.tusdcBalance !== null && investment > realBalanceNum) {
      showToast(`Insufficient balance: you have ${realBalanceNum.toFixed(2)} tUSDC, but order requires ${investment.toFixed(2)} tUSDC.`, "error");
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

  const handleQuickAdd = (amount: number) => {
    sound.playClick();
    setInvestment((prev) => prev + amount);
  };

  const handleMax = () => {
    sound.playClick();
    if (!wallet.isConnected) {
      wallet.openWalletModal();
      return;
    }
    setInvestment(realBalanceNum > 0 ? Number(realBalanceNum.toFixed(2)) : 50);
  };

  return (
    <div className="bg-[#0A0A10] border border-white/[0.08] rounded-none p-3.5 space-y-3 font-sans shadow-xl">
      {/* ─── Top Bar: Title, Live Status & Market/Limit Mode (Polymarket Header) ─── */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">DreamDEX BinaryPool</span>
        </div>

        {/* Market vs Limit Switch */}
        <div className="flex items-center bg-[#0E0E17] p-0.5 rounded-none border border-white/[0.08] text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setOrderMode("MARKET");
              const target = outcome === "YES" ? yesPrice : noPrice;
              setEntryPrice(target);
              if (onEntryPriceChange) onEntryPriceChange(target);
            }}
            className={`px-3 py-1 rounded-none font-bold transition-all cursor-pointer ${
              orderMode === "MARKET"
                ? "bg-violet-600 text-white border border-violet-400/60"
                : "text-gray-400 hover:text-white border border-transparent"
            }`}
          >
            Market
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setOrderMode("LIMIT");
            }}
            className={`px-3 py-1 rounded-none font-bold transition-all cursor-pointer ${
              orderMode === "LIMIT"
                ? "bg-violet-600 text-white border border-violet-400/60"
                : "text-gray-400 hover:text-white border border-transparent"
            }`}
          >
            Limit
          </button>
        </div>
      </div>

      {/* ─── Main Order Entry & Summary (Polymarket Clean 2-Pane Flow) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column (7 Cols): Outcome Select & Amount Input */}
        <div className="lg:col-span-7 space-y-2.5">
          {/* Outcome Selection: Direct, Intuitive 1-Click BUY YES | BUY NO */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-gray-400 font-bold uppercase tracking-wider">Select Outcome</span>
              <span className="text-[10px] text-gray-500 font-mono">Pays $1.00 per share</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* BUY YES Button */}
              <button
                type="button"
                onClick={() => handleSelectOutcome("YES")}
                className={`p-3 rounded-none border transition-all flex flex-col justify-between gap-1.5 cursor-pointer text-left select-none relative overflow-hidden group ${
                  outcome === "YES"
                    ? "bg-emerald-950/50 border-emerald-500 text-white"
                    : "bg-[#0E0E17] border-white/[0.08] hover:border-emerald-500/40 text-gray-400 hover:text-gray-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-none transition-all ${
                        outcome === "YES"
                          ? "bg-emerald-400"
                          : "bg-gray-600 group-hover:bg-emerald-500/60"
                      }`}
                    />
                    <span
                      className={`text-xs font-mono font-extrabold uppercase tracking-wide ${
                        outcome === "YES" ? "text-emerald-400" : "text-gray-300"
                      }`}
                    >
                      BUY YES
                    </span>
                  </div>
                  {outcome === "YES" && (
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-none">
                      SELECTED
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between w-full pt-0.5">
                  <span
                    className={`text-xl font-mono font-black tracking-tight ${
                      outcome === "YES" ? "text-emerald-300" : "text-gray-300"
                    }`}
                  >
                    {Math.round(yesPrice * 100)}¢
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    {Math.round(yesPrice * 100)}% chance
                  </span>
                </div>
              </button>

              {/* BUY NO Button */}
              <button
                type="button"
                onClick={() => handleSelectOutcome("NO")}
                className={`p-3 rounded-none border transition-all flex flex-col justify-between gap-1.5 cursor-pointer text-left select-none relative overflow-hidden group ${
                  outcome === "NO"
                    ? "bg-rose-950/50 border-rose-500 text-white"
                    : "bg-[#0E0E17] border-white/[0.08] hover:border-rose-500/40 text-gray-400 hover:text-gray-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-none transition-all ${
                        outcome === "NO"
                          ? "bg-rose-400"
                          : "bg-gray-600 group-hover:bg-rose-500/60"
                      }`}
                    />
                    <span
                      className={`text-xs font-mono font-extrabold uppercase tracking-wide ${
                        outcome === "NO" ? "text-rose-400" : "text-gray-300"
                      }`}
                    >
                      BUY NO
                    </span>
                  </div>
                  {outcome === "NO" && (
                    <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-none">
                      SELECTED
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between w-full pt-0.5">
                  <span
                    className={`text-xl font-mono font-black tracking-tight ${
                      outcome === "NO" ? "text-rose-300" : "text-gray-300"
                    }`}
                  >
                    {Math.round(noPrice * 100)}¢
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    {Math.round(noPrice * 100)}% chance
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Amount Input Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-gray-400 font-bold uppercase">Order Amount</span>
              <div className="flex items-center gap-1 text-gray-400">
                <span>Avail:</span>
                {wallet.isConnected ? (
                  <span className="text-white font-bold">{availDisplay}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => wallet.openWalletModal()}
                    className="text-violet-400 hover:underline cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#0E0E17] border border-white/[0.09] focus-within:border-violet-500/80 rounded-none p-2.5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-gray-500 font-mono font-bold text-lg select-none">$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={investment === 0 ? "" : investment}
                  placeholder="50"
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    setInvestment(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-full bg-transparent text-white font-mono font-bold text-lg focus:outline-none placeholder-gray-600"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-[#13131F] px-2.5 py-1 rounded-none border border-white/[0.07]">
                <span className="w-1.5 h-1.5 rounded-none bg-emerald-400" />
                <span className="text-xs font-mono font-bold text-gray-200">tUSDC</span>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className="flex-1 py-1 rounded-none text-xs font-mono font-bold bg-[#0E0E17] hover:bg-[#141422] text-gray-300 border border-white/[0.06] hover:border-violet-500/40 transition-colors cursor-pointer"
                >
                  +${amt}
                </button>
              ))}
              <button
                type="button"
                onClick={handleMax}
                className="px-3 py-1 rounded-none text-xs font-mono font-bold bg-violet-950/70 hover:bg-violet-900 text-violet-300 border border-violet-500/50 transition-colors cursor-pointer"
              >
                MAX
              </button>
            </div>
          </div>

          {/* 3. Limit Price Controls (Only visible in Limit Mode) */}
          {orderMode === "LIMIT" && (
            <div className="bg-[#0E0E17] border border-white/[0.07] rounded-none p-2 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400 font-bold">Limit Price:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setEntryPrice((p) => Math.max(0.01, Number((p - 0.01).toFixed(2))));
                  }}
                  className="w-7 h-7 rounded-none bg-[#13131F] hover:bg-[#1A1A2C] border border-white/10 flex items-center justify-center text-gray-200 font-bold cursor-pointer transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-cyan-300 min-w-[70px] text-center text-sm">
                  ${entryPrice.toFixed(2)} ({Math.round(entryPrice * 100)}¢)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setEntryPrice((p) => Math.min(0.99, Number((p + 0.01).toFixed(2))));
                  }}
                  className="w-7 h-7 rounded-none bg-[#13131F] hover:bg-[#1A1A2C] border border-white/10 flex items-center justify-center text-gray-200 font-bold cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 Cols): Polymarket Settlement Summary & Big Action Button */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2.5 bg-[#0E0E17] p-3 rounded-none border border-white/[0.07]">
          {/* Polymarket Settlement Details Table */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-gray-400">
              <span>Avg Price</span>
              <span className="text-gray-200 font-bold">${entryPrice.toFixed(2)} ({Math.round(entryPrice * 100)}¢)</span>
            </div>

            <div className="flex items-center justify-between text-gray-400">
              <span>Shares / Contracts</span>
              <span className="text-white font-bold">{calculation.contractsCount.toLocaleString()} {outcome}</span>
            </div>

            <div className="flex items-center justify-between text-gray-400">
              <span>Payout if Win</span>
              <span className="text-white font-bold">${calculation.totalPayout.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <span className="text-gray-300 font-bold">Potential Return</span>
              <span className="text-emerald-400 font-black text-sm">
                ${calculation.totalPayout.toFixed(2)}{" "}
                <span className="text-xs font-bold text-emerald-400/90">
                  (+{calculation.roi}%)
                </span>
              </span>
            </div>
          </div>

          {/* Action Execution Button & MetaMask Approval */}
          <div className="space-y-1.5 pt-1">
            {!wallet.isConnected ? (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  wallet.openWalletModal();
                }}
                className="w-full py-3 rounded-none font-mono font-bold text-xs uppercase tracking-wider bg-violet-600 hover:bg-violet-500 text-white transition-all flex items-center justify-center gap-2 border border-violet-400/40 cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.3)]"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet to Trade</span>
              </button>
            ) : isSubmitting ? (
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-none font-mono font-bold text-xs uppercase tracking-wider bg-violet-950/80 border border-violet-500/50 text-white transition-all flex items-center justify-center gap-2 cursor-wait"
              >
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>
                  {submitStep === "approving"
                    ? "1/2: Approving tUSDC..."
                    : submitStep === "signing"
                    ? "2/2: Confirm in MetaMask..."
                    : "Submitting Order to Somnia..."}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExecuteTrade}
                disabled={investment <= 0}
                className={`w-full py-3 rounded-none font-mono font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  investment <= 0
                    ? "bg-[#12121C] text-gray-500 border-white/[0.05] cursor-not-allowed"
                    : outcome === "YES"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                    : "bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.35)]"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {investment <= 0
                    ? "Enter an Amount"
                    : `Buy ${outcome} · $${investment.toFixed(2)}`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
