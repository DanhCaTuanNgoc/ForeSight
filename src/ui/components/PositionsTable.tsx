import React from "react";
import { CheckCircle2, Clock, ExternalLink, ShieldCheck, Coins, Zap } from "lucide-react";
import { CryptoIcon } from "./CryptoIcon.js";

interface Position {
  id: string;
  symbol: string;
  outcome: "YES" | "NO";
  amount: number;
  entryPrice: number;
  timestamp: number;
  status: "OPEN" | "SETTLED" | "RESOLVED" | "CLAIMED" | "CLOSED";
  orderId?: string;
  txHash?: string;
  isLiveOnChain?: boolean;
  exitPrice?: number;
  realizedPnl?: number;
  realizedRoiPercent?: number;
}

interface PositionsTableProps {
  positions: Position[];
  onClaim: () => void;
  isClaiming: boolean;
  onEarlyExit?: (positionId: string, exitPrice?: number) => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({ positions, onClaim, isClaiming, onEarlyExit }) => {
  return (
    <div className="rounded-2xl p-5 border border-[#232338] bg-[#0E0E18] shadow-xl space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-[#202034] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-white text-sm tracking-wide">
              AUTHENTIC ON-CHAIN POSITIONS & SETTLEMENT
            </h3>
            <span className="text-[11px] text-gray-400">
              Verified Event Contracts on Somnia Shannon L1 CLOB ({positions.length} entries)
            </span>
          </div>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <p className="text-gray-400 text-xs">
            No live positions found for the connected wallet on Somnia Shannon.
          </p>
          <p className="text-gray-500 text-[11px]">
            Connect your MetaMask, claim free STT from the faucet for gas, and open a prediction contract in the Terminal!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222238] text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Event Contract</th>
                <th className="py-2.5 px-3">Prediction</th>
                <th className="py-2.5 px-3">Shares</th>
                <th className="py-2.5 px-3">Entry Price</th>
                <th className="py-2.5 px-3">Invested</th>
                <th className="py-2.5 px-3">Max Payout</th>
                <th className="py-2.5 px-3">On-Chain Audit</th>
                <th className="py-2.5 px-3 text-center">Early Exit (CLOB)</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C2C]">
              {positions.map((p) => {
                const isYes = p.outcome === "YES";
                const totalCost = (p.amount * p.entryPrice).toFixed(2);
                const maxPayout = p.amount.toFixed(2);
                const explorerLink = p.txHash
                  ? `https://shannon-explorer.somnia.network/tx/${p.txHash}`
                  : null;

                return (
                  <tr key={p.id} className="hover:bg-[#131320] transition-colors">
                    <td className="py-3 px-3 text-white font-bold flex items-center gap-1.5">
                      <CryptoIcon symbol={p.symbol} size={16} />
                      <span>{p.symbol}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isYes
                            ? "bg-emerald-950/70 text-emerald-400 border-emerald-500/40"
                            : "bg-rose-950/70 text-rose-400 border-rose-500/40"
                        }`}
                      >
                        {p.outcome}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-200">{p.amount}</td>
                    <td className="py-3 px-3 text-gray-200">${p.entryPrice.toFixed(3)}</td>
                    <td className="py-3 px-3 text-gray-300 font-medium">${totalCost} USDC</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">${maxPayout} USDC</td>
                    <td className="py-3 px-3">
                      {explorerLink ? (
                        <a
                          href={explorerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                          title="Verify transaction on Somnia Shannon Explorer"
                        >
                          <span>{p.txHash?.slice(0, 8)}...{p.txHash?.slice(-4)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-500 text-[10px]">On-Chain Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.status === "OPEN" ? (
                        <button
                          onClick={() => onEarlyExit && onEarlyExit(p.id, p.outcome === "YES" ? Math.min(0.95, p.entryPrice + 0.15) : Math.max(0.05, p.entryPrice - 0.15))}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 font-bold text-[10px] inline-flex items-center gap-1 transition shadow-sm cursor-pointer"
                          title="Sell contracts back to CLOB immediately before expiry"
                        >
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Market Exit</span>
                        </button>
                      ) : p.status === "CLOSED" ? (
                        <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                          Closed Early {p.realizedRoiPercent !== undefined ? `(${p.realizedRoiPercent > 0 ? "+" : ""}${p.realizedRoiPercent}%)` : ""}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {p.status === "OPEN" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live On-Chain
                        </span>
                      ) : p.status === "CLAIMED" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-[#161622] px-2 py-0.5 rounded-full font-bold">
                          Claimed
                        </span>
                      ) : p.status === "CLOSED" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                          Closed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Settled Win
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
