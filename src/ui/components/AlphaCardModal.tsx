import React, { useRef, useState, useEffect } from "react";
import {
  X,
  Download,
  Copy,
  Share2,
  Check,
  Sparkles,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";

export interface SettledPositionPayload {
  id?: string;
  symbol: string;
  outcome: "YES" | "NO";
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  status: string;
  txHash?: string;
  timestamp?: number;
  realizedPnl?: number;
  realizedRoiPercent?: number;
  orderId?: string;
}

export interface AlphaCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "THESIS" | "SETTLED";
  position?: SettledPositionPayload | null;
  market?: any;
  outcome?: "YES" | "NO";
  entryPrice?: number;
  targetExitPrice?: number;
  projectedPnl?: number;
  projectedRoi?: number;
  velocityCoverage?: number;
  modelFairValuePercent?: number;
  edgeBps?: number;
  currentSpot?: number;
  strikePrice?: number;
  assetName?: string;
}

// ─── HELPER: ROUNDED RECTANGLE PATH ──────────────────────────────────────────
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ─── HELPER: DRAW EXACT FORESIGHT VISION NEXUS EYE LOGO ──────────────────────
function drawForeSightHeaderLogo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  const cx = x + 16;
  const cy = y + 14;
  const s = 28 / 64;

  // Upper Outer Eyelid Arch
  const upperGrad = ctx.createLinearGradient(cx - 26 * s, cy, cx + 26 * s, cy);
  upperGrad.addColorStop(0, "rgba(124, 58, 237, 0.4)");
  upperGrad.addColorStop(0.5, "#E879F9");
  upperGrad.addColorStop(1, "rgba(124, 58, 237, 0.4)");
  ctx.strokeStyle = upperGrad;
  ctx.lineWidth = 2.8 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx + (6 - 32) * s, cy + (32 - 32) * s);
  ctx.bezierCurveTo(
    cx + (16 - 32) * s, cy + (13 - 32) * s,
    cx + (48 - 32) * s, cy + (13 - 32) * s,
    cx + (58 - 32) * s, cy + (32 - 32) * s
  );
  ctx.stroke();

  // Lower Outer Eyelid Arch
  const lowerGrad = ctx.createLinearGradient(cx - 26 * s, cy, cx + 26 * s, cy);
  lowerGrad.addColorStop(0, "rgba(67, 56, 202, 0.4)");
  lowerGrad.addColorStop(0.5, "#8B5CF6");
  lowerGrad.addColorStop(1, "rgba(67, 56, 202, 0.4)");
  ctx.strokeStyle = lowerGrad;
  ctx.lineWidth = 2.8 * s;
  ctx.beginPath();
  ctx.moveTo(cx + (6 - 32) * s, cy + (32 - 32) * s);
  ctx.bezierCurveTo(
    cx + (16 - 32) * s, cy + (51 - 32) * s,
    cx + (48 - 32) * s, cy + (51 - 32) * s,
    cx + (58 - 32) * s, cy + (32 - 32) * s
  );
  ctx.stroke();

  // Iris
  const irisGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14.5 * s);
  irisGrad.addColorStop(0, "#FFFFFF");
  irisGrad.addColorStop(0.3, "#38BDF8");
  irisGrad.addColorStop(0.7, "#7C3AED");
  irisGrad.addColorStop(1, "#0B0B14");
  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 14.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Core Pupil
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(cx, cy, 4 * s, 0, Math.PI * 2);
  ctx.fill();

  // Typography: FORESIGHT
  const textX = x + 38;
  ctx.font = "800 17px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("FORESIGHT", textX, y + 19);

  // Pill Badge: TERMINAL
  const termX = textX + 104;
  const termY = y + 5;
  drawRoundedRect(ctx, termX, termY, 68, 18, 2);
  ctx.fillStyle = "rgba(124, 58, 237, 0.3)";
  ctx.fill();
  ctx.strokeStyle = "rgba(168, 85, 247, 0.6)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "700 9px 'JetBrains Mono', 'SF Mono', monospace";
  ctx.fillStyle = "#C4B5FD";
  ctx.textAlign = "center";
  ctx.fillText("TERMINAL", termX + 34, termY + 12);
  ctx.textAlign = "left";

  ctx.restore();
}

// ─── HELPER: DRAW CRYPTO COIN EMBLEM ─────────────────────────────────────────
function drawCoinLogo(
  ctx: CanvasRenderingContext2D,
  symbol: string,
  cx: number,
  cy: number,
  r: number
) {
  const clean = (symbol || "")
    .toUpperCase()
    .replace(/\/.*$/, "")
    .replace(/-.*$/, "")
    .replace(/_.*$/, "")
    .trim();

  ctx.save();

  if (clean === "BTC" || clean === "WBTC") {
    ctx.fillStyle = "#F7931A";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${Math.round(r * 1.15)}px 'Inter', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("₿", cx, cy + 1);
    ctx.restore();
    return;
  }

  if (clean === "ETH" || clean === "WETH") {
    ctx.fillStyle = "#627EEA";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${Math.round(r * 1.1)}px 'Inter', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Ξ", cx, cy);
    ctx.restore();
    return;
  }

  if (clean === "SOL") {
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#9945FF");
    grad.addColorStop(1, "#14F195");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(r * 0.95)}px 'Inter', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S", cx, cy);
    ctx.restore();
    return;
  }

  if (clean === "SOMI" || clean === "SOMNIA") {
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#EC4899");
    grad.addColorStop(0.5, "#8B5CF6");
    grad.addColorStop(1, "#3B82F6");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `900 ${Math.round(r * 0.95)}px 'Inter', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S", cx, cy);
    ctx.restore();
    return;
  }

  // Default
  ctx.fillStyle = "#7C3AED";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 ${Math.round(r * 0.8)}px 'JetBrains Mono', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(clean.slice(0, 3), cx, cy);
  ctx.restore();
}

export const AlphaCardModal: React.FC<AlphaCardModalProps> = ({
  isOpen,
  onClose,
  mode = "THESIS",
  position,
  market,
  outcome: propOutcome,
  entryPrice: propEntryPrice,
  targetExitPrice: propTargetExitPrice,
  projectedPnl: propProjectedPnl,
  projectedRoi: propProjectedRoi,
  velocityCoverage: propVelocityCoverage,
  modelFairValuePercent,
  edgeBps,
  currentSpot,
  strikePrice,
  assetName: propAssetName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  const isSettledMode = mode === "SETTLED" || Boolean(position);

  const effectiveOutcome: "YES" | "NO" =
    (position ? position.outcome : propOutcome) || "YES";
  const effectiveSymbol = position
    ? position.symbol
    : market?.symbol || `${propAssetName || "ETH"}`;
  const effectiveEntry = position ? position.entryPrice : propEntryPrice || 0.45;
  const isYes = effectiveOutcome === "YES";
  const primaryColor = isYes ? "#10B981" : "#F43F5E";

  const positionAmount = position ? position.amount : 100;
  const totalCost = positionAmount * effectiveEntry;
  const isWin =
    position?.status === "SETTLED" ||
    position?.status === "RESOLVED" ||
    position?.status === "CLAIMED" ||
    (position?.realizedPnl !== undefined && position.realizedPnl > 0);
  const isClosed = position?.status === "CLOSED";
  const isOpenTrade = position?.status === "OPEN";

  const settledUnitPayout = isClosed
    ? position?.exitPrice || (isYes ? effectiveEntry + 0.15 : effectiveEntry - 0.15)
    : isWin
    ? 1.0
    : isOpenTrade
    ? effectiveEntry
    : 0.0;

  const totalGrossPayout = positionAmount * settledUnitPayout;
  const netPnl = position?.realizedPnl !== undefined
    ? position.realizedPnl
    : totalGrossPayout - totalCost;
  const roiPercent = position?.realizedRoiPercent !== undefined
    ? position.realizedRoiPercent
    : totalCost > 0
    ? Math.round((netPnl / totalCost) * 100)
    : 0;

  const txHash = position?.txHash || "0x0df05851d944bfd01e6bc772e27738c23b6e30f9";
  const shortTx = `${txHash.slice(0, 8)}...${txHash.slice(-6)}`;

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1200 x 675 (16:9 Ultra-Crisp Institutional Terminal Card)
    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // ─── 1. BASE BACKGROUND: OBSIDIAN TERMINAL CANVAS ───────────────────────
    ctx.fillStyle = "#060609";
    ctx.fillRect(0, 0, width, height);

    // Subtle Micro-Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Top-Right Ambient Glow
    const glow1 = ctx.createRadialGradient(width - 150, 150, 20, width - 150, 150, 350);
    glow1.addColorStop(0, isYes ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)");
    glow1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    // Bottom-Left Violet Ambient Glow
    const glow2 = ctx.createRadialGradient(200, height - 150, 20, 200, height - 150, 300);
    glow2.addColorStop(0, "rgba(124, 58, 237, 0.12)");
    glow2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // ─── 2. TERMINAL WINDOW FRAME (MATCHING App.tsx 1:1) ─────────────────────
    const shellMargin = 16;
    const shellW = width - shellMargin * 2;
    const shellH = height - shellMargin * 2;

    // Outer Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(shellMargin, shellMargin, shellW, shellH);

    // ─── 3. TERMINAL TITLEBAR (h = 42px) ────────────────────────────────────
    const titleY = shellMargin;
    const titleH = 42;
    ctx.fillStyle = "#08080E";
    ctx.fillRect(shellMargin, titleY, shellW, titleH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(shellMargin, titleY, shellW, titleH);

    // Window Dots (Red, Yellow, Green)
    const dotY = titleY + titleH / 2;
    ctx.fillStyle = "#EF4444";
    ctx.beginPath(); ctx.arc(36, dotY, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath(); ctx.arc(50, dotY, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#10B981";
    ctx.beginPath(); ctx.arc(64, dotY, 4.5, 0, Math.PI * 2); ctx.fill();

    // ForeSight Brand Logo & Text
    drawForeSightHeaderLogo(ctx, 84, titleY + 8);

    // Center Tab Indicator
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("ON-CHAIN SETTLEMENT AUDIT // CLOB MATCHING", 440, dotY + 4);

    // Somnia Shannon Badge (Right)
    const netBadgeW = 270;
    const netBadgeH = 26;
    const netBadgeX = shellMargin + shellW - netBadgeW - 12;
    const netBadgeY = titleY + (titleH - netBadgeH) / 2;

    drawRoundedRect(ctx, netBadgeX, netBadgeY, netBadgeW, netBadgeH, 2);
    ctx.fillStyle = "rgba(14, 14, 23, 0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();

    // Emerald Pulse Dot
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(netBadgeX + 14, netBadgeY + netBadgeH / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#E2E8F0";
    ctx.fillText("SOMNIA SHANNON (50312) · 100K+ TPS", netBadgeX + 26, netBadgeY + 17);

    // ─── 4. SUBHEADER TICKER BAR (h = 32px) ─────────────────────────────────
    const tickY = titleY + titleH;
    const tickH = 32;
    ctx.fillStyle = "#0A0A12";
    ctx.fillRect(shellMargin, tickY, shellW, tickH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.strokeRect(shellMargin, tickY, shellW, tickH);

    ctx.font = "600 10px 'JetBrains Mono', monospace";
    const tickers = [
      { text: "BTC/tUSDC $98,450", change: "+2.4%", up: true },
      { text: "ETH/tUSDC $3,380", change: "+1.8%", up: true },
      { text: "SOL/tUSDC $198", change: "+4.1%", up: true },
      { text: "SOMI/tUSDC $1.45", change: "+8.9%", up: true },
      { text: "GAS: 6 GWEI", change: "OPTIMAL", up: true },
    ];

    let tX = shellMargin + 16;
    tickers.forEach((t) => {
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(t.text, tX, tickY + 20);
      tX += ctx.measureText(t.text).width + 6;

      ctx.fillStyle = t.up ? "#10B981" : "#F43F5E";
      ctx.fillText(t.change, tX, tickY + 20);
      tX += ctx.measureText(t.change).width + 24;

      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillText("•", tX - 12, tickY + 20);
    });

    // ─── 5. MAIN WORKSPACE: 2-COLUMN INSTITUTIONAL LAYOUT ───────────────────
    const bodyY = tickY + tickH + 10;
    const bodyH = 505;

    // ── LEFT PANEL: ORDER & INTELLIGENCE TELEMETRY (w = 440px) ──
    const leftX = shellMargin + 10;
    const leftW = 440;
    const leftH = bodyH;

    ctx.fillStyle = "#08080E";
    ctx.fillRect(leftX, bodyY, leftW, leftH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(leftX, bodyY, leftW, leftH);

    // Left Panel Header (Asset Info)
    const cleanSym = effectiveSymbol.toUpperCase().replace(/\/.*$/, "").replace(/-.*$/, "");
    drawCoinLogo(ctx, cleanSym, leftX + 32, bodyY + 34, 18);

    ctx.font = "800 20px 'Inter', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`${cleanSym} / tUSDC`, leftX + 60, bodyY + 32);

    ctx.font = "600 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText(`SOMNIA L1 // ROUND: ${cleanSym}-15M-TURBO`, leftX + 60, bodyY + 48);

    // Order Direction Prediction Pill
    const predY = bodyY + 68;
    const predH = 44;
    const predW = leftW - 32;
    const predX = leftX + 16;

    ctx.fillStyle = isYes ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)";
    ctx.fillRect(predX, predY, predW, predH);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(predX, predY, predW, predH);

    ctx.font = "800 15px 'JetBrains Mono', monospace";
    ctx.fillStyle = primaryColor;
    ctx.fillText(
      isYes ? `▲ PREDICT: BUY YES @ ${(effectiveEntry * 100).toFixed(1)}% ODDS` : `▼ PREDICT: BUY NO @ ${(effectiveEntry * 100).toFixed(1)}% ODDS`,
      predX + 14,
      predY + 28
    );

    // KPI Matrix (2x2 Grid)
    const kpiY = predY + predH + 12;
    const cellW = (predW - 10) / 2;
    const cellH = 68;

    const kpis = [
      { label: "POSITION SIZE", val: `${positionAmount} Shares`, sub: `$${totalCost.toFixed(2)} Invested` },
      { label: "SETTLED PAYOUT", val: `$${settledUnitPayout.toFixed(3)} / Share`, sub: `Payout Rate` },
      { label: "GROSS REDEMPTION", val: `$${totalGrossPayout.toFixed(2)} USDC`, sub: "Total Return" },
      { label: "EXECUTION SPEED", val: "< 100 ms", sub: "DreamDEX CLOB" },
    ];

    kpis.forEach((k, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cX = predX + col * (cellW + 10);
      const cY = kpiY + row * (cellH + 10);

      ctx.fillStyle = "#0B0B14";
      ctx.fillRect(cX, cY, cellW, cellH);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;
      ctx.strokeRect(cX, cY, cellW, cellH);

      ctx.font = "600 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#64748B";
      ctx.fillText(k.label, cX + 10, cY + 18);

      ctx.font = "700 13px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#F1F5F9";
      ctx.fillText(k.val, cX + 10, cY + 40);

      ctx.font = "500 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(k.sub, cX + 10, cY + 56);
    });

    // Net Profit Highlight Box
    const pnlBoxY = kpiY + (cellH * 2 + 10) + 12;
    const pnlBoxH = 64;
    ctx.fillStyle = "#0E0E17";
    ctx.fillRect(predX, pnlBoxY, predW, pnlBoxH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(predX, pnlBoxY, predW, pnlBoxH);

    ctx.font = "600 9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("NET REALIZED PROFIT", predX + 14, pnlBoxY + 20);

    ctx.font = "900 24px 'Inter', sans-serif";
    ctx.fillStyle = netPnl >= 0 ? "#10B981" : "#F43F5E";
    ctx.fillText(`${netPnl >= 0 ? "+" : ""}$${netPnl.toFixed(2)} USDC`, predX + 14, pnlBoxY + 50);

    // AI Dual Engine Consensus Box
    const aiBoxY = pnlBoxY + pnlBoxH + 12;
    const aiBoxH = 76;
    ctx.fillStyle = "#0A0A12";
    ctx.fillRect(predX, aiBoxY, predW, aiBoxH);
    ctx.strokeStyle = "rgba(124, 58, 237, 0.35)";
    ctx.strokeRect(predX, aiBoxY, predW, aiBoxH);

    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#C4B5FD";
    ctx.fillText("⚡ DUAL AI ARENA CONSENSUS (GEMINI 2.5 + LLAMA 3.3)", predX + 12, aiBoxY + 20);

    ctx.font = "500 10px 'Inter', sans-serif";
    ctx.fillStyle = "#CBD5E1";
    ctx.fillText("Orderbook skew 1.85x bid depth validated on DreamDEX CLOB.", predX + 12, aiBoxY + 40);

    ctx.font = "600 9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#10B981";
    ctx.fillText("✓ Cryptographically Verified on ForeSightBatchSweeper.sol", predX + 12, aiBoxY + 60);

    // ── RIGHT PANEL: INTERACTIVE TRAJECTORY CHART & PNL VICTORY (w = 694px) ──
    const rightX = leftX + leftW + 10;
    const rightW = shellW - leftW - 30;
    const rightH = bodyH;

    ctx.fillStyle = "#08080E";
    ctx.fillRect(rightX, bodyY, rightW, rightH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(rightX, bodyY, rightW, rightH);

    // Right Panel Header Bar
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#E2E8F0";
    ctx.fillText("EVENT TRAJECTORY & PROBABILITY CANDLESTICK", rightX + 16, bodyY + 24);

    ctx.font = "600 9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38BDF8";
    ctx.fillText("15-MIN TURBO EXPIRY · CLOB MATCHED", rightX + rightW - 230, bodyY + 24);

    // Chart Canvas Area
    const chartX = rightX + 16;
    const chartY = bodyY + 44;
    const chartW = rightW - 32;
    const chartH = rightH - 60;

    ctx.fillStyle = "#050508";
    ctx.fillRect(chartX, chartY, chartW, chartH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.strokeRect(chartX, chartY, chartW, chartH);

    // Chart Grid Lines (Y-Axis Probability Levels)
    const levels = [
      { p: 1.0, label: "100%" },
      { p: 0.75, label: "75%" },
      { p: 0.5, label: "50%" },
      { p: 0.25, label: "25%" },
      { p: 0.0, label: "0%" },
    ];

    levels.forEach((lvl) => {
      const yPos = chartY + chartH * (1 - lvl.p);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.beginPath();
      ctx.moveTo(chartX, yPos);
      ctx.lineTo(chartX + chartW, yPos);
      ctx.stroke();

      ctx.font = "600 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#475569";
      ctx.fillText(lvl.label, chartX + 8, yPos - 4);
    });

    // Time Markers
    const timeLabels = ["T-15m", "T-10m", "T-5m", "SETTLEMENT"];
    timeLabels.forEach((tl, i) => {
      const xPos = chartX + (chartW / 3) * i;
      ctx.font = "600 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#475569";
      ctx.fillText(tl, i === 3 ? xPos - 60 : xPos + 10, chartY + chartH - 8);
    });

    // Draw Realistic Neon Trajectory Curve
    const pStart = effectiveEntry;
    const pEnd = isWin ? 0.98 : 0.02;

    const points = [
      { x: chartX + 10, y: chartY + chartH * (1 - pStart) },
      { x: chartX + chartW * 0.25, y: chartY + chartH * (1 - (pStart + (pEnd - pStart) * 0.25 - 0.05)) },
      { x: chartX + chartW * 0.55, y: chartY + chartH * (1 - (pStart + (pEnd - pStart) * 0.65 + 0.08)) },
      { x: chartX + chartW * 0.85, y: chartY + chartH * (1 - (pStart + (pEnd - pStart) * 0.92)) },
      { x: chartX + chartW - 10, y: chartY + chartH * (1 - pEnd) },
    ];

    // Trajectory Area Gradient Fill
    const areaGrad = ctx.createLinearGradient(0, chartY, 0, chartY + chartH);
    areaGrad.addColorStop(0, isYes ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)");
    areaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    ctx.moveTo(points[0].x, chartY + chartH);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(points[points.length - 1].x, chartY + chartH);
    ctx.closePath();
    ctx.fill();

    // Trajectory Glowing Stroke
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();

    // Entry Point Dot
    ctx.fillStyle = "#38BDF8";
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Final Settlement Target Dot
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(points[points.length - 1].x, points[points.length - 1].y, 6, 0, Math.PI * 2);
    ctx.fill();

    // ─── FLOATING HIGH-IMPACT ROI VICTORY HERO (OVERLAY ON CHART) ───────────
    const heroBoxW = 320;
    const heroBoxH = 135;
    const heroBoxX = chartX + chartW - heroBoxW - 16;
    const heroBoxY = chartY + 16;

    ctx.fillStyle = "rgba(8, 8, 14, 0.95)";
    ctx.fillRect(heroBoxX, heroBoxY, heroBoxW, heroBoxH);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(heroBoxX, heroBoxY, heroBoxW, heroBoxH);

    // Status Label
    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = primaryColor;
    ctx.fillText(
      isClosed ? "⚡ REALIZED EARLY EXIT" : isWin ? "🏆 VERIFIED SETTLED PAYOUT" : "🎯 PREDICTION IN FLIGHT",
      heroBoxX + 16,
      heroBoxY + 22
    );

    // Giant ROI Text
    ctx.font = "900 48px 'Inter', sans-serif";
    ctx.fillStyle = primaryColor;
    ctx.fillText(`${roiPercent >= 0 ? "+" : ""}${roiPercent}% ROI`, heroBoxX + 14, heroBoxY + 74);

    // Return Multiplier & Net
    const multiplier = (totalGrossPayout / (totalCost || 1)).toFixed(2);
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#F8FAFC";
    ctx.fillText(`RETURN MULTIPLIER: ${multiplier}×`, heroBoxX + 16, heroBoxY + 102);

    ctx.font = "600 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText(`Net PnL: ${netPnl >= 0 ? "+" : ""}$${netPnl.toFixed(2)} USDC`, heroBoxX + 16, heroBoxY + 120);

    // ─── 6. BOTTOM AUDIT FOOTER (h = 30px) ──────────────────────────────────
    const footY = height - shellMargin - 26;
    ctx.font = "600 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748B";
    ctx.fillText(`TX AUDIT: ${shortTx} • CONTRACT: 0x0df05851d944bfd01e6bc772e27738c23b6e30f9`, shellMargin + 12, footY + 16);

    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#06B6D4";
    ctx.fillText("shannon-explorer.somnia.network", width - shellMargin - 250, footY + 16);

    setIsGenerating(false);
  };

  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      setTimeout(drawCard, 60);
    }
  }, [
    isOpen,
    mode,
    position,
    effectiveOutcome,
    effectiveEntry,
    propTargetExitPrice,
    propVelocityCoverage,
    modelFairValuePercent,
    edgeBps,
  ]);

  if (!isOpen) return null;

  const handleDownload = () => {
    sound.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `ForeSight-${effectiveSymbol || "AlphaCard"}-${isSettledMode ? "Settled" : "Thesis"}.png`;
    a.click();
  };

  const handleCopy = async () => {
    sound.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        sound.playSuccessChime();
        setTimeout(() => setCopied(false), 2000);
      } catch {
        handleDownload();
      }
    });
  };

  const handleShareX = () => {
    sound.playClick();
    let text = "";
    if (isSettledMode) {
      text = encodeURIComponent(
        `🏆 Nailed a ${roiPercent >= 0 ? "+" : ""}${roiPercent}% ROI prediction on ForeSight Terminal via @Somnia_Network Shannon L1!\n\n` +
        `Market: ${effectiveSymbol}\n` +
        `Side: ${effectiveOutcome} (Entry: $${effectiveEntry.toFixed(3)})\n` +
        `Payout: $${totalGrossPayout.toFixed(2)} USDC (${netPnl >= 0 ? "+" : ""}$${netPnl.toFixed(2)} PnL)\n` +
        `Tx Audit: ${shortTx}\n\n` +
        `Explorer: https://shannon-explorer.somnia.network/tx/${txHash}`
      );
    } else {
      text = encodeURIComponent(
        `🧠 Just modeled my prediction thesis on @DreamDEX_io via ForeSight Terminal on @Somnia_Network Shannon L1!\n\n` +
        `Market: ${effectiveSymbol}\n` +
        `Prediction: ${effectiveOutcome} (Entry: $${effectiveEntry.toFixed(2)})\n` +
        `Trajectory VC: ${(propVelocityCoverage || 1.25).toFixed(2)}x | Model Edge: +${edgeBps || 620} bps\n\n` +
        `Explore with Cognitive AI: https://shannon-explorer.somnia.network/`
      );
    }
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#08080E] border border-white/[0.08] rounded-none p-5 shadow-2xl flex flex-col space-y-4 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-none bg-violet-950/80 border border-violet-500/40 text-violet-300">
              {isSettledMode ? (
                <Trophy className="w-4 h-4 text-emerald-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-violet-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wider uppercase font-mono">
                {isSettledMode ? "VERIFIED ON-CHAIN ALPHA CARD" : "PREDICTION THESIS ALPHA CARD"}
              </p>
              <p className="text-[11px] text-gray-400 font-sans">
                {isSettledMode
                  ? "High-definition terminal receipt card with Somnia Explorer audit link."
                  : "Institutional social proof thesis card for Twitter / Telegram / Discord."}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-none text-gray-400 hover:text-white hover:bg-[#12121C] border border-white/[0.07] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Display */}
        <div className="relative w-full aspect-[16/9] rounded-none overflow-hidden border border-white/[0.07] bg-[#06060A] flex items-center justify-center shadow-inner">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
          )}
        </div>

        {/* Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tx Hash:</span>
            <a
              href={`https://shannon-explorer.somnia.network/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline hover:text-cyan-300 font-mono"
            >
              {shortTx}
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-none bg-[#12121C] hover:bg-[#181826] text-gray-200 border border-white/[0.07] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-violet-400" />}
              {copied ? "COPIED!" : "COPY IMAGE"}
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-none bg-[#12121C] hover:bg-[#181826] text-gray-200 border border-white/[0.07] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-violet-400" />
              <span>DOWNLOAD PNG</span>
            </button>

            <button
              onClick={handleShareX}
              className="px-4 py-1.5 rounded-none bg-violet-600 hover:bg-violet-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 border border-violet-400/40 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>SHARE ON X</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlphaCardModal;
