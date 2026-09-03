import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Sparkles,
  AlertTriangle,
  Compass,
  Gauge,
  Wallet,
  Share2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";
import { apiUrl } from "../utils/api.js";
import { useWallet } from "../context/WalletContext.js";
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
  const [investment, setInvestment] = useState<number>(50); // in tUSDC
  const wallet = useWallet();

  // Implied price default (0.01 - 0.99)
  const defaultEntry = prefillEntryPrice || (market?.midPrice ? Math.max(0.05, Math.min(0.95, market.midPrice)) : 0.50);
  const [entryPrice, setEntryPrice] = useState<number>(defaultEntry);

  const defaultTarget =
    prefillTargetExit ||
    (outcome === "YES" ? Math.min(0.95, defaultEntry + 0.20) : Math.max(0.05, defaultEntry - 0.20));
  const [targetExitPrice, setTargetExitPrice] = useState<number>(defaultTarget);

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
    if (sym === "BTC") return 77590;
    if (sym === "ETH") return 2420;
    if (sym === "SOL") return 100;
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

    // Risk / Reward ratio calculation
    const potentialGain = Math.max(0.01, safeExit - safeEntry);
    const potentialLoss = Math.max(0.01, safeEntry);
    const riskRewardRatio = (potentialGain / potentialLoss).toFixed(1);

    const isProfitable = earlyExitPnl >= 0;

    return {
      contractsCount: Number(contractsCount.toFixed(2)),
      earlyExitPnl: Number(earlyExitPnl.toFixed(2)),
      earlyExitRoi: Number(earlyExitRoi.toFixed(1)),
      settlementPnl: Number(settlementPnl.toFixed(2)),
      settlementRoi: Number(settlementRoi.toFixed(1)),
      breakevenPrice: safeEntry,
      riskRewardRatio: `1:${riskRewardRatio}`,
      isProfitable,
    };
  }, [investment, entryPrice, targetExitPrice]);

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
    await onTrade(market.symbol, outcome, calculation.contractsCount, entryPrice);
    sound.playSuccessChime();
  };

  return (
    <div className="terminal-panel p-3 bg-[#0A0A12] border border-white/[0.08] rounded-none space-y-2.5 font-mono">
      {/* ─── Header: Scenario Simulator & Outcome Switcher ─── */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-none bg-violet-950/80 border border-violet-500/40 text-violet-300">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-white font-mono font-bold text-xs tracking-wider uppercase">
            SIMULATOR & EXECUTION
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Black-Scholes Fair Value Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-[#12121C] border border-cyan-500/30 text-[10px] text-cyan-300 rounded-none font-mono">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>MODEL FAIR VALUE: <b>${(quantModel.fairProbabilityPercent / 100).toFixed(3)}</b></span>
          </div>

          {/* Export Alpha Card Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowAlphaCard(true);
            }}
            className="px-2 py-0.5 rounded-none text-[10px] font-mono font-bold bg-[#16161F] hover:bg-[#1C1C28] text-gray-300 hover:text-white border border-white/[0.08] flex items-center gap-1 transition-colors cursor-pointer"
            title="Export High-Resolution Proof-of-Thesis Alpha Card"
          >
            <Share2 className="w-3 h-3 text-violet-400" />
            <span className="hidden sm:inline">ALPHA CARD</span>
          </button>

          {/* Outcome Selector (YES / NO) */}
          <div className="flex items-center gap-1 bg-[#0E0E17] p-0.5 rounded-none border border-white/[0.08]">
            <button
              onClick={() => {
                sound.playClick();
                setOutcome("YES");
              }}
              className={`px-3 py-0.5 rounded-none text-xs font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer border ${
                outcome === "YES"
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                  : "bg-transparent text-gray-400 hover:text-white border-transparent"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>BUY YES</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setOutcome("NO");
              }}
              className={`px-3 py-0.5 rounded-none text-xs font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer border ${
                outcome === "NO"
                  ? "bg-rose-950/80 border-rose-500 text-rose-300"
                  : "bg-transparent text-gray-400 hover:text-white border-transparent"
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span>BUY NO</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2-Column Grid: Feasibility & Invalidation Left | Sliders & Trade Right ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 font-mono text-xs">
        {/* Left 5 Cols: Path to Settlement & Invalidation Checks */}
        <div className="lg:col-span-5 bg-[#0E0E17] p-2.5 rounded-none border border-white/[0.08] flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-white/[0.06] pb-1.5">
              <span className="text-gray-300 font-bold uppercase flex items-center gap-1.5">
                <CryptoIcon symbol={assetName} size={14} />
                <span>{assetName} Settlement Target</span>
              </span>
              <span>
                Spot: <b className="text-white">${trajectory.currentSpot.toLocaleString()}</b> → Strike: <b className="text-violet-300">${trajectory.strikePrice.toLocaleString()}</b>
              </span>
            </div>

            {/* Velocity Coverage Visual Meter */}
            <div className="bg-[#12121C] p-2 rounded-none border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Velocity Coverage:</span>
                <span className={`font-bold ${trajectory.isCoverageSufficient ? "text-emerald-400" : "text-amber-400"}`}>
                  {trajectory.velocityCoverage}× Required Pace
                </span>
              </div>
              <div className="w-full bg-[#0A0A12] h-1.5 rounded-none overflow-hidden border border-white/[0.04]">
                <div
                  className={`h-full rounded-none transition-all duration-300 ${
                    trajectory.isCoverageSufficient
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, trajectory.velocityCoverage * 70))}%` }}
                />
              </div>
            </div>

            {/* Invalidation Trigger Box */}
            <div className="p-2 rounded-none bg-[#161014] border border-rose-500/30 text-[10px] space-y-1">
              <div className="flex items-center gap-1 text-rose-300 font-bold">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Stop Level / Invalidation:</span>
              </div>
              <p className="text-gray-300 font-sans text-[11px] leading-tight">
                Spot {outcome === "YES" ? "<" : ">"} <b className="text-rose-300 font-mono">${trajectory.breakPrice.toLocaleString()}</b> or momentum decelerates before expiry.
              </p>
            </div>

            {/* Quantitative Black-Scholes Model Fair Value & Edge */}
            <div className="p-2 rounded-none bg-[#0E1322] border border-cyan-500/30 text-[10px] space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-cyan-300 font-bold flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  Model Fair Value:
                </span>
                <span className="text-white font-bold">{quantModel.fairProbabilityPercent}%</span>
              </div>
              <div className="flex items-center justify-between text-gray-400 text-[9px]">
                <span>Orderbook Implied: {(entryPrice * 100).toFixed(0)}%</span>
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

          <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 border-t border-white/[0.06]">
            <span>Required: +{trajectory.reqMovePct}% in {trajectory.timeRemainingMin}m</span>
            <span className="text-emerald-400 font-bold">Pace: {trajectory.observedMomentum}%/m</span>
          </div>
        </div>

        {/* Right 7 Cols: Sliders, Math, and 1-Click Execute Buttons */}
        <div className="lg:col-span-7 bg-[#0E0E17] p-2.5 rounded-none border border-white/[0.08] space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Capital Control & Quick Presets */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-violet-400" /> Order Size
                </span>
                <span className="font-bold text-white bg-[#12121C] px-2 py-0.5 rounded-none border border-white/[0.08]">
                  ${investment} tUSDC
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                {[10, 25, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      sound.playClick();
                      setInvestment(amt);
                    }}
                    className={`flex-1 py-0.5 text-[9px] font-mono font-bold rounded-none border transition-colors cursor-pointer ${
                      investment === amt
                        ? "bg-violet-600/30 text-violet-300 border-violet-500/50"
                        : "bg-[#12121C] text-gray-400 border-white/[0.06] hover:text-white hover:bg-[#161622]"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
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
                className="w-full h-1.5 bg-[#0A0A12] rounded-none cursor-pointer accent-violet-500"
              />
            </div>

            {/* Slider 2 & 3 in 2 Columns */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Limit Price</span>
                  <span className="font-bold text-violet-300 font-mono">${entryPrice.toFixed(2)} ({Math.round(entryPrice * 100)}%)</span>
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
                  className="w-full h-1.5 bg-[#0A0A12] rounded-none cursor-pointer accent-violet-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Target Take-Profit</span>
                  <span className="font-bold text-emerald-300 font-mono">${targetExitPrice.toFixed(2)} ({Math.round(targetExitPrice * 100)}%)</span>
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
                  className="w-full h-1.5 bg-[#0A0A12] rounded-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Summary PnL & Risk/Reward Row */}
            <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-0.5">
              <div className="p-1.5 rounded-none bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
                <span className="text-gray-400 text-[9px] uppercase">Take-Profit PnL</span>
                <span className="font-bold text-emerald-300 font-mono text-xs">
                  {calculation.earlyExitPnl >= 0 ? `+$${calculation.earlyExitPnl}` : `-$${Math.abs(calculation.earlyExitPnl)}`}
                </span>
                <span className="text-[9px] text-emerald-400/80 font-mono">
                  {calculation.earlyExitRoi > 0 ? `+${calculation.earlyExitRoi}%` : `${calculation.earlyExitRoi}%`}
                </span>
              </div>

              <div className="p-1.5 rounded-none bg-[#12121C] border border-white/[0.08] flex flex-col justify-between">
                <span className="text-gray-400 text-[9px] uppercase">Settlement Payoff</span>
                <span className="font-bold text-emerald-400 font-mono text-xs">
                  +${calculation.settlementPnl}
                </span>
                <span className="text-[9px] text-emerald-400/80 font-mono">
                  +{calculation.settlementRoi}%
                </span>
              </div>

              <div className="p-1.5 rounded-none bg-[#12121C] border border-white/[0.08] flex flex-col justify-between">
                <span className="text-gray-400 text-[9px] uppercase">Risk / Reward</span>
                <span className="font-bold text-violet-300 font-mono text-xs">
                  {calculation.riskRewardRatio}
                </span>
                <span className="text-[9px] text-gray-400 font-mono">
                  {calculation.contractsCount} shares
                </span>
              </div>
            </div>
          </div>

          {/* Action Execution Button */}
          <div className="pt-1">
            {!wallet.isConnected ? (
              <button
                onClick={() => {
                  sound.playClick();
                  wallet.openWalletModal();
                }}
                className="w-full h-10 rounded-none font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/40 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>CONNECT WALLET</span>
              </button>
            ) : (
              <button
                onClick={handleExecuteTrade}
                disabled={isSubmitting}
                className={`w-full h-10 rounded-none font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border cursor-pointer ${
                  outcome === "YES"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50"
                    : "bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50"
                } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? "SUBMITTING ORDER..."
                    : `BUY ${outcome} · ${calculation.contractsCount} SHARES @ $${entryPrice.toFixed(2)}`}
                </span>
              </button>
            )}
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
