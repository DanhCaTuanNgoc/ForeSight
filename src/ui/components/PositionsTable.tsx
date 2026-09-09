import React from "react";
import { CheckCircle2, Clock, ExternalLink, ShieldCheck, Coins, Wallet, Share2 } from "lucide-react";
import { CryptoIcon } from "./CryptoIcon.js";
import { useWallet } from "../context/WalletContext.js";

interface Position {
  id: string;
  symbol: string;
  outcome: "YES" | "NO";
  amount: number;
  entryPrice: number;
  timestamp: number;
  status: "OPEN" | "RESOLVING" | "SETTLED_WIN" | "SETTLED_LOSS" | "SETTLED" | "RESOLVED" | "CLAIMED" | "CLOSED" | "REFUNDED" | string;
  orderId?: string;
  txHash?: string;
  isLiveOnChain?: boolean;
  exitPrice?: number;
  realizedPnl?: number;
  realizedRoiPercent?: number;
  winningOutcome?: string;
  isWinner?: boolean;
}

interface PositionsTableProps {
  positions: Position[];
  onClaim: () => void;
  isClaiming: boolean;
  onEarlyExit?: (positionId: string, exitPrice?: number) => void;
  onShareAlphaCard?: (position: Position) => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  positions,
  onClaim,
  isClaiming,
  onShareAlphaCard,
}) => {
  const wallet = useWallet();

  return (
    <div className="rounded-none p-4 border border-white/[0.08] bg-[#0A0A12] space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-none bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs tracking-wider uppercase">
              POSITIONS & SETTLEMENT RECORD
            </h3>
          </div>
        </div>
      </div>

      {positions.length === 0 ? (
        !wallet.isConnected ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-8 h-8 rounded-none bg-[#12121C] border border-white/[0.08] flex items-center justify-center mx-auto text-violet-300">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">No Web3 Wallet Connected</h4>
              <p className="text-gray-400 text-[11px] max-w-md mx-auto">
                Connect your Web3 wallet on Somnia Shannon Testnet to view active on-chain positions and claim payouts.
              </p>
            </div>
            <button
              onClick={wallet.openWalletModal}
              className="px-3.5 py-1.5 rounded-none bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-violet-400/40 cursor-pointer font-mono"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>CONNECT WALLET</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-1 font-mono">
            <p className="text-gray-400 text-xs">
              No live positions found for {wallet.shortAddress || "your connected wallet"} on Somnia Shannon.
            </p>
            <p className="text-gray-500 text-[10px]">
              Open your first prediction contract in the Terminal!
            </p>
          </div>
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] text-gray-400 uppercase text-[9px] tracking-wider bg-[#0E0E17]">
                <th className="py-2 px-2.5">Time</th>
                <th className="py-2 px-2.5">Contract</th>
                <th className="py-2 px-2.5">Side</th>
                <th className="py-2 px-2.5">Shares</th>
                <th className="py-2 px-2.5">Entry Price</th>
                <th className="py-2 px-2.5">Invested</th>
                <th className="py-2 px-2.5">Max Payout</th>
                <th className="py-2 px-2.5">Tx Audit</th>
                <th className="py-2 px-2.5 text-center">Alpha Card</th>
                <th className="py-2 px-2.5 text-right whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {positions.map((p) => {
                const isYes = p.outcome === "YES";
                const totalCost = (p.amount * p.entryPrice).toFixed(2);
                const maxPayout = p.amount.toFixed(2);
                const explorerLink = p.txHash
                  ? `https://shannon-explorer.somnia.network/tx/${p.txHash}`
                  : null;

                const d = new Date(p.timestamp || Date.now());
                const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(
                  d.getMinutes()
                ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

                return (
                  <tr key={p.id} className="hover:bg-[#12121C] transition-colors">
                    <td className="py-2.5 px-2.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                      {timeStr}
                    </td>
                    <td className="py-2.5 px-2.5 text-white font-bold flex items-center gap-1.5 whitespace-nowrap">
                      <CryptoIcon symbol={p.symbol} size={15} />
                      <span>{p.symbol}</span>
                    </td>
                    <td className="py-2.5 px-2.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-none border whitespace-nowrap ${
                          isYes
                            ? "bg-emerald-950/70 text-emerald-400 border-emerald-500/40"
                            : "bg-rose-950/70 text-rose-400 border-rose-500/40"
                        }`}
                      >
                        {p.outcome}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-gray-200 whitespace-nowrap">{p.amount}</td>
                    <td className="py-2.5 px-2.5 text-gray-200 whitespace-nowrap">${p.entryPrice.toFixed(3)}</td>
                    <td className="py-2.5 px-2.5 text-gray-300 whitespace-nowrap">${totalCost} USDC</td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      {p.status === "REFUNDED" ? (
                        <span className="text-blue-300 text-[11px] font-mono font-bold">${totalCost} (Refunded)</span>
                      ) : p.status === "SETTLED_LOSS" || (p.status === "SETTLED" && p.isWinner === false) ? (
                        <span className="text-gray-500 line-through text-[11px]">$0.00 USDC</span>
                      ) : p.status === "SETTLED_WIN" || (p.status === "SETTLED" && p.isWinner === true) ? (
                        <span className="text-emerald-400 font-bold text-[11px]">${maxPayout} USDC</span>
                      ) : (
                        <span className="text-gray-300 text-[11px]">${maxPayout} USDC</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      {explorerLink ? (
                        <a
                          href={explorerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                          title="Verify transaction on Somnia Shannon Explorer"
                        >
                          <span>{p.txHash?.slice(0, 6)}...{p.txHash?.slice(-4)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-500 text-[10px]">Pending</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => onShareAlphaCard && onShareAlphaCard(p)}
                        className="px-2 py-0.5 rounded-none bg-[#12121C] hover:bg-violet-950/90 text-violet-300 hover:text-violet-100 border border-violet-500/30 hover:border-violet-400 font-bold text-[9px] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                        title="Export High-Resolution Verifiable Alpha Card"
                      >
                        <Share2 className="w-2.5 h-2.5 text-violet-400" />
                        <span>CARD</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                      {p.status === "OPEN" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.2 rounded-none font-bold whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> In Flight
                        </span>
                      ) : p.status === "REFUNDED" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-blue-400 bg-blue-950/70 border border-blue-500/30 px-1.5 py-0.2 rounded-none font-bold whitespace-nowrap" title="Unfilled limit order: 100% collateral was automatically refunded back to your wallet.">
                          Refunded (Unfilled)
                        </span>
                      ) : p.status === "RESOLVING" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-amber-400 bg-amber-950/70 border border-amber-500/30 px-1.5 py-0.2 rounded-none font-bold whitespace-nowrap" title="Round expired. Awaiting Oracle keeper finalization on DreamDEX.">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Resolving
                        </span>
                      ) : p.status === "CLAIMED" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-gray-400 bg-[#12121C] px-1.5 py-0.2 rounded-none border border-white/[0.06] font-bold whitespace-nowrap">
                          Claimed
                        </span>
                      ) : p.status === "CLOSED" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-amber-400 bg-amber-950/70 border border-amber-500/30 px-1.5 py-0.2 rounded-none font-bold whitespace-nowrap">
                          Closed
                        </span>
                      ) : p.status === "SETTLED_LOSS" || (p.status === "SETTLED" && p.isWinner === false) ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-rose-400 bg-rose-950/70 border border-rose-500/30 px-1.5 py-0.2 rounded-none font-bold whitespace-nowrap" title="Round finalized. Result did not match your predicted outcome.">
                          Expired (Loss)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-1.5 py-0.2 rounded-none font-bold whitespace-nowrap">
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
