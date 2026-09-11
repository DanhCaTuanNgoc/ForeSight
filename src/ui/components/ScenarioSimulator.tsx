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
    <div className="bg-[#07080D] border border-white/[0.08] rounded-none p-3 space-y-2.5 font-mono shadow-2xl relative">
      {/* ─── Top Bar: Cyber Terminal Header & Mode Switch ─── */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0E0F1A] border border-violet-500/30 text-[10px] text-violet-300 font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span>DREAMDEX // BINARY_POOL</span>
          </div>
          <span className="text-[10px] text-zinc-500 hidden sm:inline">
            CLOB_DIRECT · SOMNIA_L1
          </span>
        </div>

        {/* Market vs Limit Switch */}
        <div className="flex items-center bg-[#0B0D13] p-0.5 border border-white/[0.08] text-[10px] font-mono">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setOrderMode("MARKET");
              const target = outcome === "YES" ? yesPrice : noPrice;
              setEntryPrice(target);
              if (onEntryPriceChange) onEntryPriceChange(target);
            }}
            className={`px-2.5 py-0.5 font-bold uppercase transition-all cursor-pointer ${
              orderMode === "MARKET"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.2)]"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            [ MARKET ]
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setOrderMode("LIMIT");
            }}
            className={`px-2.5 py-0.5 font-bold uppercase transition-all cursor-pointer ${
              orderMode === "LIMIT"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.2)]"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            [ LIMIT ]
          </button>
        </div>
      </div>

      {/* ─── Main Order Entry & Summary (Cyber 2-Pane Terminal Flow) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* Left Column (7 Cols): Outcome Select & Amount Input */}
        <div className="lg:col-span-7 space-y-2">
          {/* Outcome Selection: Direct BUY // YES vs BUY // NO */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-400 font-bold uppercase tracking-wider">01 // SELECT_OUTCOME</span>
              <span className="text-[9px] text-zinc-500">PAR VALUE: $1.00 / SHARE</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* BUY YES Button */}
              <button
                type="button"
                onClick={() => handleSelectOutcome("YES")}
                className={`p-2.5 border transition-all flex flex-col justify-between gap-1.5 cursor-pointer text-left select-none relative group ${
                  outcome === "YES"
                    ? "bg-emerald-950/25 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "bg-[#0A0B10] border-white/[0.06] hover:border-emerald-500/40 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        outcome === "YES"
                          ? "bg-emerald-400"
                          : "bg-zinc-600 group-hover:bg-emerald-500/60"
                      }`}
                    />
                    <span
                      className={`text-xs font-mono font-black uppercase tracking-wider ${
                        outcome === "YES" ? "text-emerald-400" : "text-zinc-300"
                      }`}
                    >
                      BUY // YES
                    </span>
                  </div>
                  {outcome === "YES" ? (
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 py-0.2">
                      ● ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-400">
                      BULL
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between w-full pt-0.5">
                  <span
                    className={`text-xl font-mono font-black tabular-nums tracking-tight ${
                      outcome === "YES" ? "text-emerald-300" : "text-zinc-200"
                    }`}
                  >
                    {Math.round(yesPrice * 100)}<span className="text-xs font-bold text-emerald-400/80">¢</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                    {Math.round(yesPrice * 100)}% PROB
                  </span>
                </div>
              </button>

              {/* BUY NO Button */}
              <button
                type="button"
                onClick={() => handleSelectOutcome("NO")}
                className={`p-2.5 border transition-all flex flex-col justify-between gap-1.5 cursor-pointer text-left select-none relative group ${
                  outcome === "NO"
                    ? "bg-rose-950/25 border-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                    : "bg-[#0A0B10] border-white/[0.06] hover:border-rose-500/40 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        outcome === "NO"
                          ? "bg-rose-400"
                          : "bg-zinc-600 group-hover:bg-rose-500/60"
                      }`}
                    />
                    <span
                      className={`text-xs font-mono font-black uppercase tracking-wider ${
                        outcome === "NO" ? "text-rose-400" : "text-zinc-300"
                      }`}
                    >
                      BUY // NO
                    </span>
                  </div>
                  {outcome === "NO" ? (
                    <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 py-0.2">
                      ● ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-400">
                      BEAR
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between w-full pt-0.5">
                  <span
                    className={`text-xl font-mono font-black tabular-nums tracking-tight ${
                      outcome === "NO" ? "text-rose-300" : "text-zinc-200"
                    }`}
                  >
                    {Math.round(noPrice * 100)}<span className="text-xs font-bold text-rose-400/80">¢</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                    {Math.round(noPrice * 100)}% PROB
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Amount Input Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-400 font-bold uppercase tracking-wider">02 // ORDER_SIZE</span>
              <div className="flex items-center gap-1 text-zinc-400">
                <span className="text-zinc-500">AVAIL:</span>
                {wallet.isConnected ? (
                  <span className="text-zinc-200 font-bold tabular-nums">{availDisplay}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => wallet.openWalletModal()}
                    className="text-violet-400 hover:text-violet-300 underline cursor-pointer"
                  >
                    CONNECT
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#0A0B10] border border-white/[0.08] focus-within:border-violet-500/70 p-2 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-zinc-500 font-bold text-base select-none">$</span>
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
                  className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none placeholder-zinc-700 tabular-nums"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-[#0F1118] px-2 py-0.5 border border-white/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold text-zinc-300">tUSDC</span>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className="flex-1 py-0.5 text-[10px] font-bold bg-[#0A0B10] hover:bg-[#11131C] text-zinc-400 hover:text-zinc-200 border border-white/[0.06] hover:border-violet-500/40 transition-colors cursor-pointer"
                >
                  +{amt}
                </button>
              ))}
              <button
                type="button"
                onClick={handleMax}
                className="px-2.5 py-0.5 text-[10px] font-bold bg-violet-950/40 hover:bg-violet-900/60 text-violet-300 border border-violet-500/40 transition-colors cursor-pointer"
              >
                MAX
              </button>
            </div>
          </div>

          {/* 3. Limit Price Controls (Only visible in Limit Mode) */}
          {orderMode === "LIMIT" && (
            <div className="bg-[#0A0B10] border border-white/[0.08] p-1.5 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                LIMIT_PRICE // MAKER:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setEntryPrice((p) => Math.max(0.01, Number((p - 0.01).toFixed(2))));
                  }}
                  className="w-6 h-6 bg-[#11131C] hover:bg-[#181A26] border border-white/10 flex items-center justify-center text-zinc-200 font-bold cursor-pointer transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-bold text-violet-300 min-w-[70px] text-center tabular-nums text-xs">
                  ${entryPrice.toFixed(2)} ({Math.round(entryPrice * 100)}¢)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setEntryPrice((p) => Math.min(0.99, Number((p + 0.01).toFixed(2))));
                  }}
                  className="w-6 h-6 bg-[#11131C] hover:bg-[#181A26] border border-white/10 flex items-center justify-center text-zinc-200 font-bold cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 Cols): Settlement Receipt & Big Action Button */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2 bg-[#090A10] p-2.5 border border-white/[0.07]">
          {/* Order Details Table */}
          <div className="space-y-1.5 text-[10px]">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.05] text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>ORDER_RECEIPT</span>
              <span>VERIFIED_CLOB</span>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span>AVG_PRICE</span>
              <span className="text-zinc-200 font-bold tabular-nums">
                ${entryPrice.toFixed(2)} ({Math.round(entryPrice * 100)}¢)
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span>EST_CONTRACTS</span>
              <span className="text-white font-bold tabular-nums">
                {calculation.contractsCount.toLocaleString()} {outcome}
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span>MAX_PAYOUT</span>
              <span className="text-white font-bold tabular-nums">
                ${calculation.totalPayout.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06]">
              <span className="text-zinc-300 font-bold">POTENTIAL_RETURN</span>
              <span className="text-emerald-400 font-black tabular-nums text-xs">
                ${calculation.totalPayout.toFixed(2)}{" "}
                <span className="text-[10px] font-bold text-emerald-400/90">
                  (+{calculation.roi}%)
                </span>
              </span>
            </div>
          </div>

          {/* Action Execution Button & MetaMask Approval */}
          <div className="pt-0.5">
            {!wallet.isConnected ? (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  wallet.openWalletModal();
                }}
                className="w-full py-2.5 font-mono font-bold text-xs uppercase tracking-wider bg-[#131122] hover:bg-[#1C1832] text-violet-300 hover:text-violet-200 transition-all flex items-center justify-center gap-1.5 border border-violet-500/40 hover:border-violet-400 cursor-pointer shadow-[0_0_12px_rgba(139,92,246,0.15)]"
              >
                <Wallet className="w-3.5 h-3.5 text-violet-400" />
                <span>[ CONNECT WALLET // TRADE ]</span>
              </button>
            ) : isSubmitting ? (
              <button
                type="button"
                disabled
                className="w-full py-2.5 font-mono font-bold text-xs uppercase tracking-wider bg-[#0E0C1A] border border-violet-500/50 text-violet-300 transition-all flex items-center justify-center gap-2 cursor-wait"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                <span className="text-[11px]">
                  {submitStep === "approving"
                    ? "[ 1/2: APPROVING tUSDC... ]"
                    : submitStep === "signing"
                    ? "[ 2/2: SIGNING IN METAMASK... ]"
                    : "[ DISPATCHING ORDER TO SOMNIA... ]"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExecuteTrade}
                disabled={investment <= 0}
                className={`w-full py-2.5 font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border active:translate-y-px ${
                  investment <= 0
                    ? "bg-[#0E1016] text-zinc-600 border-white/[0.05] cursor-not-allowed"
                    : outcome === "YES"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>
                  {investment <= 0
                    ? "[ ENTER ORDER AMOUNT ]"
                    : `EXECUTE BUY ${outcome} · $${investment.toFixed(2)} tUSDC`}
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
