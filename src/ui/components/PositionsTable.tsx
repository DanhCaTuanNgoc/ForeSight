import React from "react";
import { Award, CheckCircle2, Clock } from "lucide-react";
import { CryptoIcon } from "./CryptoIcon.js";

interface Position {
  id: string;
  symbol: string;
  outcome: "YES" | "NO";
  amount: number;
  entryPrice: number;
  timestamp: number;
  status: "OPEN" | "SETTLED";
  orderId?: string;
  txHash?: string;
  isLiveOnChain?: boolean;
}

interface PositionsTableProps {
  positions: Position[];
  onClaim: () => void;
  isClaiming: boolean;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({ positions, onClaim, isClaiming }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-brand-border/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          <h3 className="font-bold text-white text-base">Your Active Positions & Winnings</h3>
          <span className="text-xs text-gray-400 font-mono">({positions.length} entries)</span>
        </div>

        <button
          onClick={onClaim}
          disabled={isClaiming || positions.length === 0}
          className="text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
        >
          {isClaiming ? "Redeeming..." : "Redeem Settled Winnings"}
        </button>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-xs">
          No open prediction positions yet. Place a prediction on the live terminal above!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-gray-400 uppercase font-mono text-[11px]">
                <th className="py-2.5 px-3">Market Symbol</th>
                <th className="py-2.5 px-3">Prediction</th>
                <th className="py-2.5 px-3">Contracts</th>
                <th className="py-2.5 px-3">Entry Price</th>
                <th className="py-2.5 px-3">Total Invested</th>
                <th className="py-2.5 px-3">Potential Payout</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 font-mono">
              {positions.map((p) => {
                const isYes = p.outcome === "YES";
                const totalCost = (p.amount * p.entryPrice).toFixed(2);
                const maxPayout = p.amount.toFixed(2);

                return (
                  <tr key={p.id} className="hover:bg-[#131B2C]">
                    <td className="py-3 px-3 text-white font-semibold flex items-center gap-1.5">
                      <CryptoIcon symbol={p.symbol} size={16} />
                      <span>{p.symbol}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isYes ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {p.outcome}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-200">{p.amount}</td>
                    <td className="py-3 px-3 text-gray-200">${p.entryPrice.toFixed(2)}</td>
                    <td className="py-3 px-3 text-gray-200">${totalCost} USDC</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">${maxPayout} USDC</td>
                    <td className="py-3 px-3 text-right">
                      {p.status === "OPEN" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 animate-spin" /> {p.isLiveOnChain ? "Live On-Chain" : "Open Position"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
