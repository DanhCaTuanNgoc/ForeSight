import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Coins,
  Wallet,
  Share2,
  RotateCcw,
  XCircle,
  CheckCheck,
} from "lucide-react";
import { CryptoIcon } from "./CryptoIcon.js";
import { useWallet } from "../context/WalletContext.js";
import { parseExpiryFromSymbol } from "./ActivityView.js";

interface Position {
  id: string;
  symbol: string;
  outcome: "YES" | "NO";
  amount: number;
  entryPrice: number;
  timestamp: number;
  status: "OPEN" | "RESOLVING" | "SETTLED_WIN" | "SETTLED_LOSS" | "SETTLED" | "RESOLVED" | "CLAIMED" | "CLOSED" | "REFUNDED" | "RESTING" | "PENDING" | string;
  orderId?: string;
  txHash?: string;
  isLiveOnChain?: boolean;
  exitPrice?: number;
  realizedPnl?: number;
  realizedRoiPercent?: number;
  winningOutcome?: string;
  isWinner?: boolean;
  expirationTime?: number;
}

interface PositionsTableProps {
  positions: Position[];
  onClaim: () => void;
  isClaiming: boolean;
  onEarlyExit?: (positionId: string, exitPrice?: number) => void;
  onShareAlphaCard?: (position: Position) => void;
}

function formatMarketInfo(symbol?: string) {
  if (!symbol) return { asset: "MARKET", subtitle: "Prediction Contract" };
  const clean = symbol.replace("/tUSDC", "").replace("/USDso", "");
  const parts = clean.split("-");
  const asset = parts[0] || "MARKET";

  if (parts.length >= 4) {
    const rawStrike = Number(parts[1]);
    const strikeText =
      rawStrike > 0
        ? `Strike $${(rawStrike > 10000 ? (rawStrike / 100).toFixed(2) : rawStrike).toLocaleString()}`
        : "Close ≥ Open";
    const timePart = parts[parts.length - 1];
    const formattedTime = timePart.length === 4 ? `${timePart.slice(0, 2)}:${timePart.slice(2)} UTC` : `${timePart} UTC`;
    return { asset, subtitle: `${strikeText} · ${formattedTime}` };
  }
  if (parts.length === 3) {
    return { asset, subtitle: `${parts[1]} · ${parts[2]}` };
  }
  return { asset, subtitle: clean };
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  positions,
  onClaim,
  isClaiming,
  onShareAlphaCard,
}) => {
  const wallet = useWallet();
  const [nowSec, setNowSec] = useState<number>(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-none p-4 border border-white/[0.08] bg-[#0A0A12] space-y-3 font-mono">
      {/* Header with Market Rule Badge */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-none bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-xs tracking-wider uppercase">
              POSITIONS & SETTLEMENT RECORD
            </h3>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 hidden sm:flex items-center gap-1.5">
          <span>Settlement Payout:</span>
          <span className="text-emerald-400 font-bold">$1.00 USDC / winning share</span>
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
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] text-gray-400 uppercase text-[9px] tracking-wider bg-[#0E0E17]">
                <th className="py-2.5 px-3">Market / Outcome</th>
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3 text-right">Avg Price</th>
                <th className="py-2.5 px-3 text-right">Est. Payout</th>
                <th className="py-2.5 px-3 text-right">PnL / Return</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {positions.map((p) => {
                const isYes = p.outcome === "YES";
                const costNum = p.amount * p.entryPrice;
                const totalCost = costNum.toFixed(2);
                const maxPayoutNum = p.amount;
                const maxPayout = maxPayoutNum.toFixed(2);
                const profitNum = maxPayoutNum - costNum;
                const profit = profitNum.toFixed(2);
                const roiPercent = p.entryPrice > 0 ? (((1 - p.entryPrice) / p.entryPrice) * 100).toFixed(1) : "0.0";

                const isSettledWin = p.status === "SETTLED_WIN" || (p.status === "SETTLED" && p.isWinner === true);
                const isSettledLoss = p.status === "SETTLED_LOSS" || (p.status === "SETTLED" && p.isWinner === false);

                const explorerLink = p.txHash
                  ? `https://shannon-explorer.somnia.network/tx/${p.txHash}`
                  : null;

                const d = new Date(p.timestamp || Date.now());
                const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(
                  d.getMinutes()
                ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

                const marketInfo = formatMarketInfo(p.symbol);

                const targetExpirySec =
                  p.expirationTime && p.expirationTime > 0
                    ? p.expirationTime
                    : parseExpiryFromSymbol(p.symbol, p.timestamp) || Math.floor(p.timestamp / 1000) + 900;

                const isOpenStatus = p.status === "OPEN" || p.status === "RESTING" || p.status === "PENDING";
                let rowTimeText = "--";
                let isRowUrgent = false;

                if (targetExpirySec && isOpenStatus) {
                  const diffSec = targetExpirySec - nowSec;
                  if (diffSec > 0) {
                    const hours = Math.floor(diffSec / 3600);
                    const mins = Math.floor((diffSec % 3600) / 60);
                    const secs = diffSec % 60;
                    if (hours > 0) {
                      rowTimeText = `${hours}h ${mins}m`;
                    } else if (mins > 0) {
                      rowTimeText = `${mins}m ${secs.toString().padStart(2, "0")}s`;
                    } else {
                      rowTimeText = `${secs}s`;
                    }
                    if (diffSec <= 180) {
                      isRowUrgent = true;
                    }
                  } else {
                    rowTimeText = "0s";
                    isRowUrgent = true;
                  }
                }

                return (
                  <tr key={p.id} className="hover:bg-[#12121C] transition-colors">
                    {/* 1. Market & Outcome */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#12121C] border border-white/[0.07] rounded-none shrink-0">
                          <CryptoIcon symbol={p.symbol} size={18} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">{marketInfo.asset}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-none border shrink-0 ${
                                isYes
                                  ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/50"
                                  : "bg-rose-950/80 text-rose-400 border-rose-500/50"
                              }`}
                            >
                              {p.outcome}
                            </span>
                            <span className="text-[10px] text-gray-500 font-normal">{timeStr}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[220px]">
                            {marketInfo.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Position Size & Capital */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-white font-bold text-xs">
                        {p.amount.toLocaleString()}{" "}
                        <span className="text-[10px] text-gray-400 font-normal">Shares</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        ${totalCost} USDC
                      </div>
                    </td>

                    {/* 3. Avg Price */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="text-gray-200 font-bold text-xs">
                        ${p.entryPrice.toFixed(3)}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {(p.entryPrice * 100).toFixed(1)}¢ / share
                      </div>
                    </td>

                    {/* 4. Est. Payout */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="text-white font-bold text-xs">
                        ${maxPayout}{" "}
                        <span className="text-[10px] text-gray-400 font-normal">USDC</span>
                      </div>
                    </td>

                    {/* 5. PnL / Return */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {p.status === "REFUNDED" ? (
                        <div>
                          <div className="text-blue-300 font-bold text-xs font-mono">$0.00 USDC</div>
                        </div>
                      ) : isSettledLoss ? (
                        <div>
                          <div className="text-rose-400 font-bold text-xs font-mono">-${totalCost} USDC</div>
                        </div>
                      ) : isSettledWin ? (
                        <div>
                          <div className="text-emerald-400 font-bold text-xs font-mono">+${profit} USDC</div>
                          <div className="text-emerald-300 text-[10px] font-medium">+{roiPercent}%</div>
                        </div>
                      ) : p.status === "CLAIMED" ? (
                        <div>
                          <div className="text-emerald-300 font-bold text-xs font-mono">+${profit} USDC</div>
                          <div className="text-gray-400 text-[10px]">Claimed (+{roiPercent}%)</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-emerald-400 font-bold text-xs font-mono">+${profit} USDC</div>
                          <div className="text-gray-400 text-[10px]">Max (+{roiPercent}%)</div>
                        </div>
                      )}
                    </td>

                    {/* 6. Status Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {p.status === "RESTING" || p.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-none font-bold">
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>RESTING</span>
                        </span>
                      ) : p.status === "OPEN" ? (
                        <span className="inline-flex items-center gap-1.5 text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-none font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <span>IN FLIGHT</span>
                        </span>
                      ) : p.status === "REFUNDED" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-blue-300 bg-blue-950/70 border border-blue-500/40 px-2 py-0.5 rounded-none font-bold">
                          <RotateCcw className="w-3 h-3 text-blue-400 shrink-0" />
                          <span>REFUNDED</span>
                        </span>
                      ) : p.status === "RESOLVING" ? (
                        <span className="inline-flex items-center gap-1.5 text-[9px] text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-none font-bold">
                          <span>RESOLVING</span>
                        </span>
                      ) : p.status === "CLAIMED" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-gray-300 bg-[#12121C] px-2 py-0.5 rounded-none border border-white/[0.1] font-bold">
                          <CheckCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>CLAIMED</span>
                        </span>
                      ) : isSettledLoss ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-rose-300 bg-rose-950/70 border border-rose-500/40 px-2 py-0.5 rounded-none font-bold">
                          <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                          <span>LOST</span>
                        </span>
                      ) : isSettledWin ? (
                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-none font-bold shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>WIN</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] text-gray-400 bg-[#12121C] border border-white/[0.08] px-2 py-0.5 rounded-none font-bold">
                          <span>{p.status}</span>
                        </span>
                      )}

                      {/* Dynamic Real-time Expiry Countdown per contract */}
                      {isOpenStatus && (
                        <div className="mt-1 flex items-center justify-center">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                              isRowUrgent
                                ? "bg-amber-950/80 text-amber-300 border border-amber-500/50 animate-pulse"
                                : "bg-[#12121C] text-violet-300 border border-white/[0.08]"
                            }`}
                            title="Time remaining until contract settlement"
                          >
                            <Clock className={`w-2.5 h-2.5 ${isRowUrgent ? "text-amber-400" : "text-violet-400"}`} />
                            <span>{rowTimeText}</span>
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 7. Compact Actions (Tx Audit & Alpha Card) */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">

                        {explorerLink ? (
                          <a
                            href={explorerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-none bg-[#12121C] hover:bg-[#1A1A28] border border-white/[0.08] hover:border-cyan-500/50 text-gray-400 hover:text-cyan-300 transition-colors inline-flex items-center"
                            title={`Verify on Somnia Explorer (${p.txHash?.slice(0, 6)}...${p.txHash?.slice(-4)})`}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-600 text-[10px]">—</span>
                        )}

                        <button
                          onClick={() => onShareAlphaCard && onShareAlphaCard(p)}
                          className="p-1 rounded-none bg-[#12121C] hover:bg-violet-950/70 border border-white/[0.08] hover:border-violet-500/50 text-gray-400 hover:text-violet-300 transition-colors cursor-pointer inline-flex items-center"
                          title="Share Verifiable Alpha Card"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
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
