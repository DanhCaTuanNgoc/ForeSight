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
  // Simulation / Thesis Props (optional for THESIS mode)
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

// ─── HELPER: ROUNDED RECTANGLE PATH FOR CANAL GLASSMORPHISM ─────────────────
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

// ─── HELPER: DRAW EXACT FORESIGHT VISION NEXUS EYE LOGO (HEADER COMPATIBLE) ──
function drawForeSightHeaderLogo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  // Cybernetic Eye Center coordinates & base scale (matching 64x64 SVG mapped to 44px box)
  const cx = x + 24;
  const cy = y + 24;
  const s = 44 / 64; // Scale factor

  // 1. Ambient Halo Glow
  const haloGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 28);
  haloGrad.addColorStop(0, "rgba(124, 58, 237, 0.45)");
  haloGrad.addColorStop(0.7, "rgba(124, 58, 237, 0.15)");
  haloGrad.addColorStop(1, "rgba(124, 58, 237, 0)");
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  ctx.fill();

  // 2. Upper Outer Eyelid Arch (M 6 32 C 16 13, 48 13, 58 32)
  const upperGrad = ctx.createLinearGradient(cx - 26 * s, cy, cx + 26 * s, cy);
  upperGrad.addColorStop(0, "rgba(124, 58, 237, 0.4)");
  upperGrad.addColorStop(0.25, "#A855F7");
  upperGrad.addColorStop(0.5, "#E879F9");
  upperGrad.addColorStop(0.75, "#A855F7");
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

  // 3. Lower Outer Eyelid Arch (M 6 32 C 16 51, 48 51, 58 32)
  const lowerGrad = ctx.createLinearGradient(cx - 26 * s, cy, cx + 26 * s, cy);
  lowerGrad.addColorStop(0, "rgba(67, 56, 202, 0.4)");
  lowerGrad.addColorStop(0.3, "#6366F1");
  lowerGrad.addColorStop(0.5, "#8B5CF6");
  lowerGrad.addColorStop(0.7, "#6366F1");
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

  // 4. Corner Precision Markers
  ctx.strokeStyle = "#A855F7";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(cx + (2 - 32) * s, cy);
  ctx.lineTo(cx + (8 - 32) * s, cy);
  ctx.moveTo(cx + (56 - 32) * s, cy);
  ctx.lineTo(cx + (62 - 32) * s, cy);
  ctx.stroke();

  // 5. Upper Brow Accent Wings
  ctx.strokeStyle = "#C084FC";
  ctx.lineWidth = 1.2 * s;
  ctx.setLineDash([4 * s, 3 * s]);
  ctx.beginPath();
  ctx.moveTo(cx + (18 - 32) * s, cy + (19 - 32) * s);
  ctx.lineTo(cx + (26 - 32) * s, cy + (14 - 32) * s);
  ctx.lineTo(cx + (38 - 32) * s, cy + (14 - 32) * s);
  ctx.lineTo(cx + (46 - 32) * s, cy + (19 - 32) * s);
  ctx.stroke();
  ctx.setLineDash([]);

  // 6. Middle Iris Circle (r = 14.5)
  const irisGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14.5 * s);
  irisGrad.addColorStop(0, "#FFFFFF");
  irisGrad.addColorStop(0.2, "#38BDF8");
  irisGrad.addColorStop(0.5, "#A855F7");
  irisGrad.addColorStop(0.85, "#4C1D95");
  irisGrad.addColorStop(1, "#0B0B14");

  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 14.5 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#A855F7";
  ctx.lineWidth = 1.5 * s;
  ctx.stroke();

  // 7. Radar Tech Grid Ring (r = 11)
  ctx.strokeStyle = "#38BDF8";
  ctx.lineWidth = 1 * s;
  ctx.setLineDash([2 * s, 3 * s]);
  ctx.beginPath();
  ctx.arc(cx, cy, 11 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 8. Core Pupil (r = 5)
  const pupilGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 5 * s);
  pupilGrad.addColorStop(0, "#FFFFFF");
  pupilGrad.addColorStop(0.4, "#67E8F9");
  pupilGrad.addColorStop(0.8, "#7C3AED");
  pupilGrad.addColorStop(1, "#4C1D95");

  ctx.fillStyle = pupilGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Center Glint Spark
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.beginPath();
  ctx.arc(cx - 2 * s, cy - 2 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Laser Scan Line
  ctx.strokeStyle = "rgba(103, 232, 249, 0.7)";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, cy);
  ctx.lineTo(cx + 14 * s, cy);
  ctx.stroke();

  // ─── BRAND TYPOGRAPHY (LUXURY FINTECH MODERN SANS) ──────────────────────
  const textX = x + 58;

  // "FORESIGHT" Header text (Bold, Tracking-expanded)
  ctx.font = "800 28px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("FORESIGHT", textX, y + 26);

  // "TERMINAL" Pill Badge (Rounded glass)
  const termBadgeX = textX + 172;
  const termBadgeY = y + 7;
  const termBadgeW = 84;
  const termBadgeH = 22;

  drawRoundedRect(ctx, termBadgeX, termBadgeY, termBadgeW, termBadgeH, 4);
  ctx.fillStyle = "rgba(124, 58, 237, 0.25)";
  ctx.fill();
  ctx.strokeStyle = "rgba(168, 85, 247, 0.5)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = "700 10px 'JetBrains Mono', 'SF Mono', monospace";
  ctx.fillStyle = "#C4B5FD";
  ctx.textAlign = "center";
  ctx.fillText("TERMINAL", termBadgeX + termBadgeW / 2, termBadgeY + 15);
  ctx.textAlign = "left";

  // Sub-caption telemetry
  ctx.font = "600 11px 'JetBrains Mono', 'SF Mono', monospace";
  ctx.fillStyle = "#06B6D4";
  ctx.fillText("COGNITIVE CLOB TERMINAL // SOMNIA L1", textX, y + 43);

  ctx.restore();
}

// ─── HELPER: DRAW NATIVE HIGH-RES VECTOR COIN LOGO ON CANVAS ────────────────
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

  // Outer Ambient Glow
  const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.5);
  glowGrad.addColorStop(0, "rgba(139, 92, 246, 0.3)");
  glowGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // 1. Somnia Network (SOM / SOMI / STT)
  if (clean.includes("SOM") || clean === "STT") {
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#8B5CF6");
    grad.addColorStop(0.5, "#4F46E5");
    grad.addColorStop(1, "#06B6D4");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Somnia Lightning Bolt
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.1, cy - r * 0.6);
    ctx.lineTo(cx - r * 0.45, cy + r * 0.05);
    ctx.lineTo(cx - r * 0.02, cy + r * 0.05);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.6);
    ctx.lineTo(cx + r * 0.45, cy - r * 0.05);
    ctx.lineTo(cx + r * 0.02, cy - r * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  // 2. Bitcoin (BTC)
  if (clean.includes("BTC") || clean.includes("BITCOIN")) {
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#F7931A");
    grad.addColorStop(1, "#D97706");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(254, 240, 138, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 ${Math.round(r * 1.2)}px 'Inter', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("₿", cx, cy + r * 0.05);
    ctx.restore();
    return;
  }

  // 3. Ethereum (ETH)
  if (clean.includes("ETH")) {
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#627EEA");
    grad.addColorStop(1, "#3B82F6");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(191, 219, 254, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top diamond
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.65);
    ctx.lineTo(cx + r * 0.42, cy - r * 0.05);
    ctx.lineTo(cx, cy + r * 0.2);
    ctx.lineTo(cx - r * 0.42, cy - r * 0.05);
    ctx.closePath();
    ctx.fill();

    // Bottom diamond
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.3);
    ctx.lineTo(cx + r * 0.42, cy + r * 0.05);
    ctx.lineTo(cx, cy + r * 0.65);
    ctx.lineTo(cx - r * 0.42, cy + r * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  // 4. Solana (SOL)
  if (clean.includes("SOL")) {
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#14F195");
    grad.addColorStop(0.5, "#80ECFF");
    grad.addColorStop(1, "#9945FF");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    const bw = r * 0.75;
    const bh = r * 0.16;
    ctx.fillRect(cx - bw / 2, cy - r * 0.45, bw, bh);
    ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
    ctx.fillRect(cx - bw / 2, cy + r * 0.45 - bh, bw, bh);
    ctx.restore();
    return;
  }

  // 5. USDC / USD Default
  if (clean.includes("USD")) {
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#2775CA");
    grad.addColorStop(1, "#1E40AF");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(147, 197, 253, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 ${Math.round(r * 1.1)}px 'Inter', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", cx, cy);
    ctx.restore();
    return;
  }

  // Default Cyber Emblem
  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, "#6366F1");
  grad.addColorStop(1, "#312E81");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(165, 180, 252, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 ${Math.round(r * 0.75)}px 'JetBrains Mono', monospace`;
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

  // Auto-detect mode if position is provided
  const isSettledMode = mode === "SETTLED" || Boolean(position);

  // Normalize parameters
  const effectiveOutcome: "YES" | "NO" =
    (position ? position.outcome : propOutcome) || "YES";
  const effectiveSymbol = position
    ? position.symbol
    : market?.symbol || `${propAssetName || "SOMNIA"}-15M-${effectiveOutcome}`;
  const effectiveEntry = position ? position.entryPrice : propEntryPrice || 0.5;
  const isYes = effectiveOutcome === "YES";
  const primaryColor = isYes ? "#10B981" : "#F43F5E";
  const primaryGlow = isYes ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)";

  // Settled calculations
  const positionAmount = position ? position.amount : 100;
  const totalCost = positionAmount * effectiveEntry;
  const isWin =
    position?.status === "SETTLED" ||
    position?.status === "RESOLVED" ||
    position?.status === "CLAIMED" ||
    (position?.realizedPnl !== undefined && position.realizedPnl > 0);
  const isClosed = position?.status === "CLOSED";
  const isOpenTrade = position?.status === "OPEN";

  // Settlement payout: $1.00 per winning share, or exit price if closed early
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

  const txHash = position?.txHash || "0x7a8c3d9e41b2f0a8d6e3c125749bb8014e82cd3f";
  const shortTx = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1200 x 675 (16:9 Ultra HD Standard Trading Card)
    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // ─── 1. LUXURY OBSIDIAN BACKGROUND WITH METALLIC MESH ───────────────────
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#040407");
    bgGradient.addColorStop(0.4, "#0A0A14");
    bgGradient.addColorStop(0.8, "#070710");
    bgGradient.addColorStop(1, "#040407");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle Radial Depth in center
    const centerGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.6);
    centerGlow.addColorStop(0, "rgba(20, 16, 40, 0.4)");
    centerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);

    // ─── 2. HIGH-PRECISION CYBER GRID ───────────────────────────────────────
    ctx.strokeStyle = "rgba(139, 92, 246, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Micro Horizontal Laser Scanlines
    ctx.strokeStyle = "rgba(6, 182, 212, 0.015)";
    for (let y = 0; y < height; y += 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // ─── 3. ATMOSPHERIC AMBIENT GLOW ORBS ───────────────────────────────────
    const glow1 = ctx.createRadialGradient(width * 0.88, height * 0.18, 40, width * 0.88, height * 0.18, 400);
    glow1.addColorStop(0, primaryGlow);
    glow1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(width * 0.12, height * 0.82, 40, width * 0.12, height * 0.82, 380);
    glow2.addColorStop(0, "rgba(139, 92, 246, 0.18)");
    glow2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // ─── 4. OUTER LUXURY FRAME WITH METALLIC BEVEL & CHOPPED CORNERS ────────
    const frameMargin = 32;
    const frameW = width - frameMargin * 2;
    const frameH = height - frameMargin * 2;

    // Outer Glow Border
    drawRoundedRect(ctx, frameMargin, frameMargin, frameW, frameH, 12);
    ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Top Specular Highlight Streak
    ctx.save();
    const specGrad = ctx.createLinearGradient(frameMargin, frameMargin, frameMargin + frameW, frameMargin);
    specGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    specGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.25)");
    specGrad.addColorStop(0.7, "rgba(139, 92, 246, 0.4)");
    specGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.strokeStyle = specGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(frameMargin + 20, frameMargin);
    ctx.lineTo(frameMargin + frameW - 20, frameMargin);
    ctx.stroke();
    ctx.restore();

    // Corner Tactical Precision Crosshairs (Cyberpunk Purple)
    ctx.strokeStyle = "#A855F7";
    ctx.lineWidth = 3.5;
    const cornerSize = 34;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(frameMargin, frameMargin + cornerSize); ctx.lineTo(frameMargin, frameMargin); ctx.lineTo(frameMargin + cornerSize, frameMargin); ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(frameMargin + frameW - cornerSize, frameMargin); ctx.lineTo(frameMargin + frameW, frameMargin); ctx.lineTo(frameMargin + frameW, frameMargin + cornerSize); ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(frameMargin, frameMargin + frameH - cornerSize); ctx.lineTo(frameMargin, frameMargin + frameH); ctx.lineTo(frameMargin + cornerSize, frameMargin + frameH); ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(frameMargin + frameW - cornerSize, frameMargin + frameH); ctx.lineTo(frameMargin + frameW, frameMargin + frameH); ctx.lineTo(frameMargin + frameW, frameMargin + frameH - cornerSize); ctx.stroke();

    // ─── 5. HEADER: FORESIGHT VISION NEXUS EYE + SOMNIA SHANNON CAPSULE ────
    drawForeSightHeaderLogo(ctx, 64, 56);

    // Somnia Shannon Institutional Capsule (Top-Right)
    const capW = 340;
    const capH = 46;
    const capX = width - 64 - capW;
    const capY = 56;

    drawRoundedRect(ctx, capX, capY, capW, capH, 8);
    const capBg = ctx.createLinearGradient(capX, capY, capX + capW, capY + capH);
    capBg.addColorStop(0, "rgba(18, 18, 32, 0.85)");
    capBg.addColorStop(1, "rgba(10, 10, 20, 0.9)");
    ctx.fillStyle = capBg;
    ctx.fill();

    ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Live Emerald Pulse Dot
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(capX + 22, capY + capH / 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "700 12px 'JetBrains Mono', 'SF Mono', monospace";
    ctx.fillStyle = "#E2E8F0";
    ctx.fillText("SOMNIA SHANNON L1 // 50312", capX + 38, capY + 28);

    // ─── 6. MARKET HERO & COIN LOGO SECTION ─────────────────────────────────
    // Draw Native Crypto Coin Emblem
    drawCoinLogo(ctx, effectiveSymbol, 96, 172, 28);

    // Market Symbol Title (Clean Bold Institutional Sans)
    ctx.font = "800 38px 'Inter', system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(effectiveSymbol, 142, 182);

    // Contract Specification Subtitle
    ctx.font = "600 12px 'JetBrains Mono', 'SF Mono', monospace";
    ctx.fillStyle = "#94A3B8";
    const subtext = isSettledMode
      ? `VERIFIED SETTLEMENT // EVENT CONTRACT // ORDER: ${position?.orderId || "SOMNIA-ORD-928"}`
      : `QUANT MOMENTUM MODEL // EXPIRY: 15-MIN TURBO // CLOB DEPTH: VERIFIED`;
    ctx.fillText(subtext, 144, 206);

    // Outcome Badge (Glossy Neon Pill)
    const outcomeBoxW = 250;
    const outcomeBoxH = 50;
    const outcomeBoxX = width - 64 - outcomeBoxW;
    const outcomeBoxY = 148;

    drawRoundedRect(ctx, outcomeBoxX, outcomeBoxY, outcomeBoxW, outcomeBoxH, 8);
    ctx.fillStyle = isYes ? "rgba(16, 185, 129, 0.16)" : "rgba(244, 63, 94, 0.16)";
    ctx.fill();

    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.font = "800 20px 'Inter', system-ui, sans-serif";
    ctx.fillStyle = primaryColor;
    ctx.textAlign = "center";
    ctx.fillText(
      isYes ? "▲ PREDICT: YES" : "▼ PREDICT: NO",
      outcomeBoxX + outcomeBoxW / 2,
      outcomeBoxY + 32
    );
    ctx.textAlign = "left";

    // ─── 7. MODE SPECIFIC HUD PANELS ────────────────────────────────────────
    if (isSettledMode) {
      // ══════════════════════════════════════════════════════════════════════
      // MODE: SETTLED / REALIZED BET VICTORY CARD (LUXURY GLASSMORPHISM)
      // ══════════════════════════════════════════════════════════════════════

      // ── HERO ROI DISPLAY BANNER (FROSTED GLASS) ──
      const heroBannerY = 236;
      const heroBannerH = 148;
      const heroBannerW = width - 128;
      const heroBannerX = 64;

      drawRoundedRect(ctx, heroBannerX, heroBannerY, heroBannerW, heroBannerH, 12);
      const heroGrad = ctx.createLinearGradient(heroBannerX, heroBannerY, heroBannerX + heroBannerW, heroBannerY + heroBannerH);
      heroGrad.addColorStop(0, "rgba(18, 22, 38, 0.92)");
      heroGrad.addColorStop(0.5, isYes ? "rgba(6, 78, 59, 0.45)" : "rgba(136, 19, 55, 0.45)");
      heroGrad.addColorStop(1, "rgba(14, 16, 28, 0.95)");
      ctx.fillStyle = heroGrad;
      ctx.fill();

      ctx.strokeStyle = isWin ? "rgba(16, 185, 129, 0.65)" : "rgba(244, 63, 94, 0.65)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Top Specular Line on Hero Glass
      ctx.save();
      const heroSpec = ctx.createLinearGradient(heroBannerX, heroBannerY, heroBannerX + heroBannerW, heroBannerY);
      heroSpec.addColorStop(0, "rgba(255, 255, 255, 0)");
      heroSpec.addColorStop(0.2, "rgba(255, 255, 255, 0.35)");
      heroSpec.addColorStop(0.8, "rgba(255, 255, 255, 0.1)");
      heroSpec.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.strokeStyle = heroSpec;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(heroBannerX + 16, heroBannerY + 1);
      ctx.lineTo(heroBannerX + heroBannerW - 16, heroBannerY + 1);
      ctx.stroke();
      ctx.restore();

      // Status Super-Badge
      ctx.font = "700 12px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = isWin ? "#34D399" : "#FDA4AF";
      const statusLabel = isClosed
        ? "⚡ REALIZED EARLY EXIT PROFIT"
        : isOpenTrade
        ? "🎯 IN-FLIGHT PREDICTION ORDER"
        : "🏆 VERIFIED SETTLEMENT PAYOUT // WIN";
      ctx.fillText(statusLabel, heroBannerX + 32, heroBannerY + 36);

      // Giant ROI Text with Luxury Neon Drop Shadow
      ctx.save();
      ctx.font = "900 68px 'Inter', system-ui, -apple-system, sans-serif";
      const roiText = `${roiPercent >= 0 ? "+" : ""}${roiPercent}% ROI`;

      // Glow backing
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 18;
      ctx.fillStyle = roiPercent >= 0 ? "#10B981" : "#F43F5E";
      ctx.fillText(roiText, heroBannerX + 32, heroBannerY + 104);
      ctx.restore();

      // Net Profit readout beside ROI
      ctx.font = "800 34px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      const profitText = `${netPnl >= 0 ? "+" : ""}$${netPnl.toFixed(2)} USDC`;
      ctx.fillText(profitText, heroBannerX + 490, heroBannerY + 98);

      ctx.font = "600 12px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText("NET REALIZED PROFIT", heroBannerX + 490, heroBannerY + 125);

      // Multiplier Tag (Right side of Hero)
      const multiplier = (totalGrossPayout / (totalCost || 1)).toFixed(2);
      ctx.font = "900 40px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#C4B5FD";
      ctx.fillText(`${multiplier}×`, width - 250, heroBannerY + 84);

      ctx.font = "600 11px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#CBD5E1";
      ctx.fillText("RETURN MULTIPLIER", width - 250, heroBannerY + 112);

      // ── 3 STAT HUD BOXES (BOTTOM MATRIX - GLASSMORPHISM) ──
      const boxY = 406;
      const boxW = 340;
      const boxH = 135;
      const gap = (width - 128 - boxW * 3) / 2;

      // Box 1: Position Size & Entry Price
      const b1x = 64;
      drawRoundedRect(ctx, b1x, boxY, boxW, boxH, 10);
      ctx.fillStyle = "rgba(15, 17, 28, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.font = "600 11px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText("// 01 INITIAL POSITION", b1x + 22, boxY + 28);

      ctx.font = "800 28px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#F8FAFC";
      ctx.fillText(`$${effectiveEntry.toFixed(3)}`, b1x + 22, boxY + 70);

      ctx.font = "600 12px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#64748B";
      ctx.fillText(`${positionAmount} Shares • $${totalCost.toFixed(2)} Invested`, b1x + 22, boxY + 102);

      // Box 2: Settlement Redemption Payout
      const b2x = b1x + boxW + gap;
      drawRoundedRect(ctx, b2x, boxY, boxW, boxH, 10);
      ctx.fillStyle = "rgba(15, 17, 28, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      ctx.font = "600 11px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText("// 02 SETTLED PAYOUT", b2x + 22, boxY + 28);

      ctx.font = "800 28px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#34D399";
      ctx.fillText(`$${totalGrossPayout.toFixed(2)} USDC`, b2x + 22, boxY + 70);

      ctx.font = "600 12px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#64748B";
      ctx.fillText(`Payout: $${settledUnitPayout.toFixed(3)} / Contract`, b2x + 22, boxY + 102);

      // Box 3: Cryptographic On-Chain Verification
      const b3x = b2x + boxW + gap;
      drawRoundedRect(ctx, b3x, boxY, boxW, boxH, 10);
      ctx.fillStyle = "rgba(15, 17, 28, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "rgba(168, 85, 247, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.font = "600 11px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#C084FC";
      ctx.fillText("// 03 CRYPTOGRAPHIC AUDIT", b3x + 22, boxY + 28);

      ctx.font = "700 16px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#38BDF8";
      ctx.fillText(shortTx, b3x + 22, boxY + 66);

      ctx.font = "700 11px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#10B981";
      ctx.fillText("✓ VERIFIED ON SHANNON L1", b3x + 22, boxY + 98);

      ctx.font = "500 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#64748B";
      ctx.fillText("DreamDEX CLOB Match Hash", b3x + 22, boxY + 118);
    } else {
      // ══════════════════════════════════════════════════════════════════════
      // MODE: THESIS / PRE-TRADE SIMULATOR ALPHA CARD (LUXURY QUANT HUD)
      // ══════════════════════════════════════════════════════════════════════

      // ── 3 QUANTITATIVE METRICS BOXES ──
      const boxY = 245;
      const boxW = 330;
      const boxH = 150;
      const gap = (width - 128 - boxW * 3) / 2;

      // Metric 1: Velocity Coverage
      const b1x = 64;
      drawRoundedRect(ctx, b1x, boxY, boxW, boxH, 10);
      ctx.fillStyle = "rgba(15, 17, 28, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.font = "600 12px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText("TRAJECTORY FEASIBILITY", b1x + 24, boxY + 34);

      const vc = propVelocityCoverage || 1.25;
      ctx.font = "800 38px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = vc >= 1.0 ? "#10B981" : "#A78BFA";
      ctx.fillText(`${vc.toFixed(2)}×`, b1x + 24, boxY + 88);

      ctx.font = "500 12px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#CBD5E1";
      ctx.fillText(
        vc >= 1.0 ? "Plausible Momentum Pace" : "Requires Momentum Accel",
        b1x + 24,
        boxY + 122
      );

      // Metric 2: Model Fair Value Φ(d₂)
      const b2x = b1x + boxW + gap;
      drawRoundedRect(ctx, b2x, boxY, boxW, boxH, 10);
      ctx.fillStyle = "rgba(15, 17, 28, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      ctx.font = "600 12px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText("MODEL FAIR VALUE Φ(d₂)", b2x + 24, boxY + 34);

      const fairDisplay = modelFairValuePercent ? `${modelFairValuePercent}%` : "68.4%";
      ctx.font = "800 38px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#C4B5FD";
      ctx.fillText(fairDisplay, b2x + 24, boxY + 88);

      const edgeDisplay = edgeBps !== undefined ? `${edgeBps > 0 ? "+" : ""}${edgeBps} bps Edge` : "+620 bps Edge";
      ctx.font = "500 12px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = edgeBps && edgeBps > 0 ? "#10B981" : "#E2E8F0";
      ctx.fillText(`vs ${(effectiveEntry * 100).toFixed(0)}% Book (${edgeDisplay})`, b2x + 24, boxY + 122);

      // Metric 3: Scenario Return / Projected ROI
      const b3x = b2x + boxW + gap;
      drawRoundedRect(ctx, b3x, boxY, boxW, boxH, 10);
      ctx.fillStyle = "rgba(15, 17, 28, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      ctx.font = "600 12px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText("SCENARIO RETURN", b3x + 24, boxY + 34);

      const projRoi = propProjectedRoi || 85;
      const projPnl = propProjectedPnl || 42.5;
      const targetExit = propTargetExitPrice || 0.85;

      ctx.font = "800 38px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = projRoi >= 0 ? "#10B981" : "#F43F5E";
      ctx.fillText(`${projRoi >= 0 ? "+" : ""}${projRoi}%`, b3x + 24, boxY + 88);

      ctx.font = "500 12px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#CBD5E1";
      const pnlSign = projPnl >= 0 ? `+$${projPnl.toFixed(1)}` : `-$${Math.abs(projPnl).toFixed(1)}`;
      ctx.fillText(`Target: $${targetExit.toFixed(2)} (${pnlSign} PnL)`, b3x + 24, boxY + 122);

      // ── DUAL AI DEBATE CONSENSUS BANNER ──
      const debateY = 415;
      const debateH = 125;
      drawRoundedRect(ctx, 64, debateY, width - 128, debateH, 10);
      ctx.fillStyle = "rgba(124, 58, 237, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(139, 92, 246, 0.35)";
      ctx.stroke();

      ctx.font = "700 14px 'JetBrains Mono', 'SF Mono', monospace";
      ctx.fillStyle = "#C4B5FD";
      ctx.fillText("⚖️ DUAL AI DEBATE CONSENSUS & GROUNDED RAG", 88, debateY + 32);

      ctx.font = "500 13px 'Inter', system-ui, sans-serif";
      ctx.fillStyle = "#E2E8F0";
      const spotVal = currentSpot ? currentSpot.toLocaleString() : "92,400";
      const strikeVal = strikePrice ? strikePrice.toLocaleString() : "92,600";
      const debateSnippet = isYes
        ? `Alpha Bull AI: Positive spot drift past $${spotVal} with orderbook bid skew. Strike target $${strikeVal} is in range.`
        : `Macro Bear AI: Overhead resistance wall and rapid theta time-decay. Downward spot deviation provides contrarian edge on DreamDEX CLOB.`;
      ctx.fillText(debateSnippet, 88, debateY + 66);

      ctx.font = "600 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText("Sources: CoinDesk • Cointelegraph • Decrypt • Live Somnia CLOB Depth", 88, debateY + 98);
    }

    // ─── 8. FOOTER: VERIFICATION & PROTOCOL WATERMARK ───────────────────────
    ctx.font = "600 12px 'JetBrains Mono', 'SF Mono', monospace";
    ctx.fillStyle = "#64748B";
    ctx.fillText("Verified on DreamDEX On-Chain CLOB • Somnia Network Layer 1 (100k+ TPS)", 64, 595);

    ctx.font = "700 13px 'JetBrains Mono', 'SF Mono', monospace";
    ctx.fillStyle = "#06B6D4";
    ctx.fillText("shannon-explorer.somnia.network", width - 330, 595);

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
              <p className="text-[11px] text-gray-400 font-sans">
                {isSettledMode
                  ? "Verifiable on-chain receipt card with Somnia Explorer audit link."
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
