import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock, Activity, ArrowUpRight, ArrowDownRight, CheckCircle2 } from "lucide-react";

interface HeroMarketCardProps {
  market: any;
  onTrade: (symbol: string, outcome: "YES" | "NO", amount: number, price?: number) => Promise<void>;
  isSubmitting: boolean;
}

export const HeroMarketCard: React.FC<HeroMarketCardProps> = ({ market, onTrade, isSubmitting }) => {
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO">("YES");
  const [betSize, setBetSize] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(market?.timeRemainingSec || 0);

  useEffect(() => {
    setTimeLeft(market?.timeRemainingSec || 0);
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [market]);

  if (!market) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-gray-400">
        <Activity className="w-8 h-8 mx-auto mb-2 animate-spin text-orange-400" />
        <p>Loading active prediction round...</p>
      </div>
    );
  }

  const upOdds = market.impliedUpProbability ? Math.round(market.impliedUpProbability * 100) : 50;
  const downOdds = 100 - upOdds;

  const formatSeconds = (sec: number) => {
    if (sec <= 0) return "Settling...";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const handleExecute = async () => {
    await onTrade(market.symbol, selectedOutcome, betSize, selectedOutcome === "YES" ? upOdds / 100 : downOdds / 100);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-brand-border/80 shadow-2xl relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Details & Round Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 font-mono font-bold text-sm border border-orange-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            LIVE ROUND
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-300 text-xs font-semibold">
            {market.interval || "15m"} Cadence
          </span>
          <span className="text-gray-400 font-mono text-xs hidden sm:inline">
            Symbol: {market.symbol}
          </span>
        </div>

        {/* Expiry Countdown */}
        <div className="flex items-center gap-2 bg-[#0A0E17] border border-brand-border px-4 py-2 rounded-xl">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs text-gray-400">Expires in:</span>
          <span className="font-mono font-bold text-white text-sm">
            {formatSeconds(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Question & Asset */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <span className="font-semibold text-white">{market.underlyingAsset || "BTC"}</span>
          <span>•</span>
          <span>Event Contract CLOB</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {market.question}
        </h2>
      </div>

      {/* Live Probability Meter */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-center text-sm font-semibold mb-2">
          <span className="text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> YES / UP ({upOdds}%)
          </span>
          <span className="text-rose-400 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" /> NO / DOWN ({downOdds}%)
          </span>
        </div>
        <div className="w-full h-3 bg-[#0A0E17] rounded-full overflow-hidden flex border border-brand-border">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm"
            style={{ width: `${upOdds}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500 shadow-sm"
            style={{ width: `${downOdds}%` }}
          />
        </div>
      </div>

      {/* Interactive Action Terminal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10">
        {/* BUY UP (YES) Button */}
        <button
          onClick={() => setSelectedOutcome("YES")}
          className={`p-5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
            selectedOutcome === "YES"
              ? "bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 scale-[1.02]"
              : "bg-[#0E1422] border-brand-border text-gray-300 hover:border-gray-600"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-lg text-emerald-400">
            <ArrowUpRight className="w-6 h-6" />
            <span>PREDICT UP (YES)</span>
          </div>
          <span className="text-xs text-gray-400">
            Estimated Entry: ${(upOdds / 100).toFixed(2)} USDC | Payout: $1.00
          </span>
        </button>

        {/* BUY DOWN (NO) Button */}
        <button
          onClick={() => setSelectedOutcome("NO")}
          className={`p-5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
            selectedOutcome === "NO"
              ? "bg-rose-500/20 border-rose-500 text-white shadow-lg shadow-rose-500/10 scale-[1.02]"
              : "bg-[#0E1422] border-brand-border text-gray-300 hover:border-gray-600"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-lg text-rose-400">
            <ArrowDownRight className="w-6 h-6" />
            <span>PREDICT DOWN (NO)</span>
          </div>
          <span className="text-xs text-gray-400">
            Estimated Entry: ${(downOdds / 100).toFixed(2)} USDC | Payout: $1.00
          </span>
        </button>
      </div>

      {/* Bet Size Quick Selector & Submit Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#090D15] border border-brand-border relative z-10">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400">Contracts:</span>
          {[5, 10, 25, 50].map((size) => (
            <button
              key={size}
              onClick={() => setBetSize(size)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition ${
                betSize === size
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-[#141A28] text-gray-400 hover:text-white border border-brand-border"
              }`}
            >
              {size}
            </button>
          ))}
          <input
            type="number"
            value={betSize}
            onChange={(e) => setBetSize(Math.max(1, Number(e.target.value)))}
            className="w-16 bg-[#141A28] border border-brand-border rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-orange-500"
            min={1}
          />
        </div>

        <button
          onClick={handleExecute}
          disabled={isSubmitting}
          className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
            selectedOutcome === "YES"
              ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/20"
              : "bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-500/20"
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>
            {isSubmitting
              ? "Placing Order..."
              : `Submit ${selectedOutcome} (${(
                  betSize * (selectedOutcome === "YES" ? upOdds / 100 : downOdds / 100)
                ).toFixed(2)} USDC)`}
          </span>
        </button>
      </div>
    </div>
  );
};
