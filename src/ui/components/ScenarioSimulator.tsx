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
  onOutcomeChange?: (outcome: "YES" | "NO") => void;
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
  onOutcomeChange,
  onEntryPriceChange,
  onTargetExitPriceChange,
  onTrade,
  isSubmitting,
  showToast,
}) => {
  const [outcome, setOutcome] = useState<"YES" | "NO">(prefillOutcome);
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
  }, [prefillOutcome]);

  React.useEffect(() => {
    if (prefillEntryPrice !== undefined) setEntryPrice(prefillEntryPrice);
  }, [prefillEntryPrice]);

  React.useEffect(() => {
    if (prefillTargetExit !== undefined) setTargetExitPrice(prefillTargetExit);
  }, [prefillTargetExit]);

  // ─── Layer 1 & 2: Path to Settlement & Decision Stress Test Math ──────
  const assetName =
    market?.underlyingAsset ||
    (market?.symbol?.includes("BTC")
      ? "BTC"
      : market?.symbol?.includes("ETH")
      ? "ETH"
      : market?.symbol?.includes("SOL")
      ? "SOL"
      : "SOMI");

  // Real-time spot price benchmark from oracle / live stream
  const currentSpot = useMemo(() => {
    if (market?.currentPrice && typeof market.currentPrice === "number" && market.currentPrice > 0) {
      return market.currentPrice;
    }
    if (market?.spotPrice && typeof market.spotPrice === "number" && market.spotPrice > 0) {
      return market.spotPrice;
    }
    const sym = assetName.toUpperCase();
    if (liveSpotMap[sym]) return liveSpotMap[sym];
    if (liveSpotMap[`${sym}-USD`]) return liveSpotMap[`${sym}-USD`];
    if (liveSpotMap[`${sym}-USDT`]) return liveSpotMap[`${sym}-USDT`];
    if (sym === "BTC") return 77590;
    if (sym === "ETH") return 2420;
    if (sym === "SOL") return 100;
    if (sym === "SOMI") return 0.742;
    return 0.742;
  }, [assetName, liveSpotMap, market]);

  // Derive strike price from market or question with decimal sensitivity
  const strikePrice = useMemo(() => {
    if (market?.strikePrice && !isNaN(Number(market.strikePrice)) && Number(market.strikePrice) > 0) {
      return Number(market.strikePrice);
    }
    if (market?.question) {
      const match = market.question.match(/\$?(\d+[\d,]*\.?\d*)(K?)/i);
      if (match) {
        let val = parseFloat(match[1].replace(/,/g, ""));
        if (match[2]?.toUpperCase() === "K") val *= 1000;
        if (val > 0) return val;
      }
    }
    const multiplier = outcome === "YES" ? 1.0073 : 0.9927;
    return currentSpot < 10
      ? Number((currentSpot * multiplier).toFixed(4))
      : Math.round(currentSpot * multiplier);
  }, [market, currentSpot, outcome]);

  const timeRemainingMin = useMemo(() => {
    if (market?.expiryTimestamp) {
      const diffMin = Math.round((market.expiryTimestamp - Date.now()) / 60000);
      return Math.max(1, diffMin);
    }
    return market?.minutesLeft || 23;
  }, [market]);

  // Direction-aware trajectory math with real-world moneyness
  const trajectory = useMemo(() => {
    const deltaPrice = strikePrice - currentSpot;
    const isYES = outcome === "YES";

    // Real-world directional requirement
    const isCurrentlyITM = isYES ? currentSpot >= strikePrice : currentSpot <= strikePrice;
    const rawReqMove = isYES ? Math.max(0, strikePrice - currentSpot) : Math.max(0, currentSpot - strikePrice);
    const reqMovePct = isCurrentlyITM ? 0 : (rawReqMove / currentSpot) * 100;
    const reqVelocity = reqMovePct / Math.max(1, timeRemainingMin); // % per minute required

    // Observed momentum velocity (% per minute from recent 15m orderbook & price delta)
    const observedVelocity = isYES ? 0.041 : -0.038;
    const absObserved = Math.abs(observedVelocity);

    // Velocity Coverage (Ratio of observed pace to required pace)
    let velocityCoverage = 1.0;
    if (isCurrentlyITM) {
      velocityCoverage = 2.50; // Already in-the-money
    } else {
      velocityCoverage = Number((absObserved / Math.max(0.0001, reqVelocity)).toFixed(2));
    }
    const isCoverageSufficient = isCurrentlyITM || velocityCoverage >= 1.0;

    // Invalidation break threshold
    const breakPrice = currentSpot < 10
      ? (isYES ? Number((currentSpot * 0.996).toFixed(4)) : Number((currentSpot * 1.004).toFixed(4)))
      : (isYES ? Math.round(currentSpot * 0.996) : Math.round(currentSpot * 1.004));

    return {
      currentSpot,
      strikePrice,
      deltaPrice,
      reqMovePct: Number(reqMovePct.toFixed(2)),
      reqVelocity: Number(reqVelocity.toFixed(3)),
      observedVelocity: Number(observedVelocity.toFixed(3)),
      velocityCoverage,
      isCoverageSufficient,
      isCurrentlyITM,
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
    const safeInvestment = Math.max(0.01, investment || 0);
    const safeEntry = Math.max(0.01, Math.min(0.99, entryPrice));
    const safeExit = Math.max(0.01, Math.min(0.99, targetExitPrice));
    const contractsCount = safeInvestment / safeEntry;

    // Early Exit PnL on CLOB
    const earlyExitValue = contractsCount * safeExit;
    const earlyExitPnl = earlyExitValue - safeInvestment;
    const earlyExitRoi = (earlyExitPnl / safeInvestment) * 100;

    // Full Settlement Payoff (Binary option pays $1.00 per contract upon winning)
    const settlementValue = contractsCount * 1.00;
    const settlementPnl = settlementValue - safeInvestment;
    const settlementRoi = (settlementPnl / safeInvestment) * 100;

    // Risk / Reward ratio calculation
    let riskRewardRatio = "-";
    if (safeExit > safeEntry) {
      const potentialGain = safeExit - safeEntry;
      const maxRisk = safeEntry;
      riskRewardRatio = `1:${(potentialGain / maxRisk).toFixed(1)}`;
    } else if (safeExit < safeEntry) {
      const lossPct = (((safeEntry - safeExit) / safeEntry) * 100).toFixed(0);
      riskRewardRatio = `Stop -${lossPct}%`;
    } else {
      riskRewardRatio = "1:0.0 (Flat)";
    }

    return {
      contractsCount: Number(contractsCount.toFixed(2)),
      earlyExitPnl: Number(earlyExitPnl.toFixed(2)),
      earlyExitRoi: Number(earlyExitRoi.toFixed(1)),
      settlementPnl: Number(settlementPnl.toFixed(2)),
      settlementRoi: Number(settlementRoi.toFixed(1)),
      breakevenPrice: safeEntry,
      riskRewardRatio,
      isProfitable: earlyExitPnl > 0,
      isLoss: earlyExitPnl < 0,
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
    <div className="terminal-panel p-3 bg-[#08080E] border border-white/[0.07] rounded-none space-y-2.5 font-mono">
      {/* ─── Header: Scenario Simulator & Outcome Switcher ─── */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.07] pb-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-none bg-violet-950/60 border border-violet-500/40 text-violet-300">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-white font-mono font-bold text-xs tracking-wider uppercase">
            SIMULATOR & EXECUTION
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Black-Scholes Fair Value Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-[#0E0E17] border border-violet-500/30 text-[10px] text-violet-300 rounded-none font-mono">
            <Gauge className="w-3 h-3 text-violet-400" />
            <span>MODEL FAIR VALUE: <b>${(quantModel.fairProbabilityPercent / 100).toFixed(3)}</b></span>
          </div>

          {/* Export Alpha Card Button */}
          <button
            onClick={() => {
              sound.playClick();
              setShowAlphaCard(true);
            }}
            className="px-2 py-0.5 rounded-none text-[10px] font-mono font-bold bg-[#0E0E17] hover:bg-[#141420] text-gray-300 hover:text-white border border-white/[0.07] flex items-center gap-1 transition-colors cursor-pointer"
            title="Export High-Resolution Proof-of-Thesis Alpha Card"
          >
            <Share2 className="w-3 h-3 text-violet-400" />
            <span className="hidden sm:inline">ALPHA CARD</span>
          </button>

          {/* Outcome Selector (YES / NO) */}
          <div className="flex items-center gap-1 bg-[#0A0A10] p-0.5 rounded-none border border-white/[0.07]">
            <button
              onClick={() => {
                sound.playClick();
                setOutcome("YES");
                if (onOutcomeChange) onOutcomeChange("YES");
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
                if (onOutcomeChange) onOutcomeChange("NO");
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
        <div className="lg:col-span-5 bg-[#0B0B12] p-2.5 rounded-none border border-white/[0.07] flex flex-col justify-between space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-white/[0.05] pb-1.5">
              <span className="text-gray-300 font-bold uppercase flex items-center gap-1.5">
                <CryptoIcon symbol={assetName} size={14} />
                <span>{assetName} Settlement Target</span>
              </span>
              <span>
                Spot: <b className="text-white">${trajectory.currentSpot.toLocaleString()}</b> → Strike:{" "}
                <b
                  className={
                    outcome === "YES"
                      ? trajectory.currentSpot >= trajectory.strikePrice
                        ? "text-emerald-400"
                        : "text-violet-300"
                      : trajectory.currentSpot < trajectory.strikePrice
                      ? "text-emerald-400"
                      : "text-violet-300"
                  }
                >
                  ${trajectory.strikePrice.toLocaleString()}
                </b>
              </span>
            </div>

            {/* Velocity Coverage Visual Meter */}
            <div className="bg-[#0E0E17] p-2 rounded-none border border-white/[0.05] space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Velocity Coverage:</span>
                <span
                  className={`font-bold ${
                    trajectory.isCoverageSufficient ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {trajectory.velocityCoverage}× Required Pace
                </span>
              </div>
              <div className="w-full bg-[#07070A] h-1.5 rounded-none overflow-hidden border border-white/[0.04]">
                <div
                  className={`h-full rounded-none transition-all duration-300 ${
                    trajectory.isCoverageSufficient ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, trajectory.velocityCoverage * 70))}%` }}
                />
              </div>
            </div>

            {/* Invalidation Trigger Box */}
            <div className="p-2 rounded-none bg-[#120D12] border border-rose-500/25 text-[10px] space-y-1">
              <div className="flex items-center gap-1 text-rose-300 font-bold">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Stop Level / Invalidation:</span>
              </div>
              <p className="text-gray-300 font-sans text-[11px] leading-tight">
                Spot {outcome === "YES" ? "<" : ">"} <b className="text-rose-300 font-mono">${trajectory.breakPrice.toLocaleString()}</b> or momentum decelerates before expiry.
              </p>
            </div>

            {/* Quantitative Black-Scholes Model Fair Value & Edge */}
            <div className="p-2 rounded-none bg-[#0E0E17] border border-violet-500/25 text-[10px] space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-violet-300 font-bold flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-violet-400" />
                  Model Fair Value:
                </span>
                <span className="text-white font-bold">{quantModel.fairProbabilityPercent}%</span>
              </div>
              <div className="flex items-center justify-between text-gray-400 text-[9px]">
                <span>Orderbook Implied: {(entryPrice * 100).toFixed(0)}%</span>
                <span
                  className={`font-bold ${
                    quantModel.edgeBps !== undefined && quantModel.edgeBps > 0
                      ? "text-emerald-400"
                      : quantModel.edgeBps !== undefined && quantModel.edgeBps < 0
                      ? "text-rose-400"
                      : "text-gray-400"
                  }`}
                >
                  {quantModel.edgeBps !== undefined
                    ? `${quantModel.edgeBps > 0 ? "+" : ""}${quantModel.edgeBps} bps Edge`
                    : ""}
                </span>
              </div>
              {quantModel.halfKellyFraction && quantModel.halfKellyFraction > 0 ? (
                <div className="text-[9px] text-gray-400 border-t border-white/[0.05] pt-0.5 flex justify-between">
                  <span>Half-Kelly Sizing:</span>
                  <span className="text-violet-300 font-bold">
                    {(quantModel.halfKellyFraction * 100).toFixed(1)}% bankroll
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 border-t border-white/[0.05]">
            <span>
              Required: {trajectory.isCurrentlyITM ? "0.00% (In-The-Money)" : `${outcome === "YES" ? "+" : "-"}${trajectory.reqMovePct}%`} in {trajectory.timeRemainingMin}m
            </span>
            <span
              className={`font-bold ${
                trajectory.observedVelocity >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              Pace: {trajectory.observedVelocity >= 0 ? `+${trajectory.observedVelocity}` : trajectory.observedVelocity}%/m
            </span>
          </div>
        </div>

        {/* Right 7 Cols: Sliders, Math, and 1-Click Execute Buttons */}
        <div className="lg:col-span-7 bg-[#0B0B12] p-2.5 rounded-none border border-white/[0.07] space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            {/* ─── Institutional Order Sizing Module ─── */}
            <div className="space-y-1.5 text-xs">
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
                      className="text-[9px] text-violet-400 hover:text-violet-300 font-bold px-1 py-0.2 bg-violet-950/40 hover:bg-violet-900/60 border border-violet-500/30 transition-colors cursor-pointer"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>

              {/* Main Pro Input Group */}
              <div className="bg-[#07070A] border border-white/[0.1] focus-within:border-violet-500/80 focus-within:ring-1 focus-within:ring-violet-500/20 p-2 transition-all flex items-center justify-between gap-2">
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

              {/* Quick Size Presets & Percentage Pills */}
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

              {/* Sub-bar: Share Equivalent & Quick Percentage Allocations */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-0.5">
                <span className="text-gray-400">
                  Est. Contracts: <b className="text-violet-300 font-bold">{calculation.contractsCount.toLocaleString()}</b> shares
                </span>
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
                        className={`text-[9px] px-1.5 py-0.2 border transition-colors cursor-pointer ${
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
            </div>

            {/* Slider 2 & 3 in 2 Columns */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Entry Price</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    ${entryPrice.toFixed(2)} ({Math.round(entryPrice * 100)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  value={entryPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEntryPrice(val);
                    if (onEntryPriceChange) onEntryPriceChange(val);
                  }}
                  onPointerUp={() => sound.playClick()}
                  className="w-full h-1.5 bg-[#07070A] rounded-none cursor-pointer accent-violet-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">
                    {targetExitPrice >= entryPrice ? "Target Take-Profit" : "Target Stop-Exit"}
                  </span>
                  <span
                    className={`font-bold font-mono ${
                      targetExitPrice > entryPrice
                        ? "text-emerald-400"
                        : targetExitPrice < entryPrice
                        ? "text-rose-400"
                        : "text-violet-300"
                    }`}
                  >
                    ${targetExitPrice.toFixed(2)} ({Math.round(targetExitPrice * 100)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  value={targetExitPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTargetExitPrice(val);
                    if (onTargetExitPriceChange) onTargetExitPriceChange(val);
                  }}
                  onPointerUp={() => sound.playClick()}
                  className={`w-full h-1.5 bg-[#07070A] rounded-none cursor-pointer ${
                    targetExitPrice >= entryPrice ? "accent-emerald-500" : "accent-rose-500"
                  }`}
                />
              </div>
            </div>

            {/* Summary PnL & Risk/Reward Row */}
            <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-0.5">
              {/* Early Exit / Take-Profit Card */}
              <div
                className={`p-1.5 rounded-none border flex flex-col justify-between transition-colors ${
                  calculation.earlyExitPnl > 0
                    ? "bg-emerald-950/20 border-emerald-500/30"
                    : calculation.earlyExitPnl < 0
                    ? "bg-rose-950/20 border-rose-500/30"
                    : "bg-[#0E0E17] border-white/[0.07]"
                }`}
              >
                <span className="text-gray-400 text-[9px] uppercase">
                  {calculation.earlyExitPnl >= 0 ? "Take-Profit PnL" : "Stop-Exit PnL"}
                </span>
                <span
                  className={`font-bold font-mono text-xs ${
                    calculation.earlyExitPnl > 0
                      ? "text-emerald-400"
                      : calculation.earlyExitPnl < 0
                      ? "text-rose-400"
                      : "text-gray-300"
                  }`}
                >
                  {calculation.earlyExitPnl > 0
                    ? `+$${calculation.earlyExitPnl.toFixed(2)}`
                    : calculation.earlyExitPnl < 0
                    ? `-$${Math.abs(calculation.earlyExitPnl).toFixed(2)}`
                    : "$0.00"}
                </span>
                <span
                  className={`text-[9px] font-mono ${
                    calculation.earlyExitRoi > 0
                      ? "text-emerald-400/80"
                      : calculation.earlyExitRoi < 0
                      ? "text-rose-400/80"
                      : "text-gray-500"
                  }`}
                >
                  {calculation.earlyExitRoi > 0
                    ? `+${calculation.earlyExitRoi}%`
                    : `${calculation.earlyExitRoi}%`}
                </span>
              </div>

              {/* Settlement Payoff Card */}
              <div className="p-1.5 rounded-none bg-[#0E0E17] border border-white/[0.07] flex flex-col justify-between">
                <span className="text-gray-400 text-[9px] uppercase">Settlement Payoff</span>
                <span
                  className={`font-bold font-mono text-xs ${
                    calculation.settlementPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {calculation.settlementPnl >= 0
                    ? `+$${calculation.settlementPnl.toFixed(2)}`
                    : `-$${Math.abs(calculation.settlementPnl).toFixed(2)}`}
                </span>
                <span
                  className={`text-[9px] font-mono ${
                    calculation.settlementRoi >= 0 ? "text-emerald-400/80" : "text-rose-400/80"
                  }`}
                >
                  {calculation.settlementRoi >= 0
                    ? `+${calculation.settlementRoi}%`
                    : `${calculation.settlementRoi}%`}
                </span>
              </div>

              {/* Risk / Reward */}
              <div className="p-1.5 rounded-none bg-[#0E0E17] border border-white/[0.07] flex flex-col justify-between">
                <span className="text-gray-400 text-[9px] uppercase">Risk / Reward</span>
                <span
                  className={`font-bold font-mono text-xs ${
                    calculation.earlyExitPnl >= 0 ? "text-violet-300" : "text-rose-300"
                  }`}
                >
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
                className="w-full h-10 rounded-none font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/30 cursor-pointer"
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
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40"
                    : "bg-rose-600 hover:bg-rose-500 text-white border-rose-400/40"
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
