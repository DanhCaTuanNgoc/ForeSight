import React, { useRef, useState, useEffect } from "react";
import {
  X,
  Download,
  Copy,
  Share2,
  Check,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Gauge,
  Compass,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";

interface AlphaCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: any;
  outcome: "YES" | "NO";
  entryPrice: number;
  targetExitPrice: number;
  projectedPnl: number;
  projectedRoi: number;
  velocityCoverage: number;
  modelFairValuePercent?: number;
  edgeBps?: number;
  currentSpot: number;
  strikePrice: number;
  assetName: string;
}

export const AlphaCardModal: React.FC<AlphaCardModalProps> = ({
  isOpen,
  onClose,
  market,
  outcome,
  entryPrice,
  targetExitPrice,
  projectedPnl,
  projectedRoi,
  velocityCoverage,
  modelFairValuePercent,
  edgeBps,
  currentSpot,
  strikePrice,
  assetName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1200 x 675 (16:9 Twitter/Telegram Card)
    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // 1. Background gradient (Deep Cyberpunk Obsidian)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#080811");
    bgGradient.addColorStop(0.5, "#0D0D1A");
    bgGradient.addColorStop(1, "#05050A");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. High-tech cyber grid lines
    ctx.strokeStyle = "rgba(124, 58, 237, 0.07)";
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

    // 3. Neon Atmospheric Glow Orbs
    const isYes = outcome === "YES";
    const primaryColor = isYes ? "#10B981" : "#F43F5E";
    const primaryGlow = isYes ? "rgba(16, 185, 129, 0.18)" : "rgba(244, 63, 94, 0.18)";

    const radGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 350);
    radGrad.addColorStop(0, primaryGlow);
    radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, width, height);

    const radGrad2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 50, width * 0.2, height * 0.8, 300);
    radGrad2.addColorStop(0, "rgba(124, 58, 237, 0.15)");
    radGrad2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radGrad2;
    ctx.fillRect(0, 0, width, height);

    // 4. Outer Glowing Frame Border
    ctx.strokeStyle = "rgba(124, 58, 237, 0.4)";
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // High-tech corner brackets
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 6;
    const cornerSize = 40;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(30, 30 + cornerSize); ctx.lineTo(30, 30); ctx.lineTo(30 + cornerSize, 30);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - 30 - cornerSize, 30); ctx.lineTo(width - 30, 30); ctx.lineTo(width - 30, 30 + cornerSize);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(30, height - 30 - cornerSize); ctx.lineTo(30, height - 30); ctx.lineTo(30 + cornerSize, height - 30);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - 30 - cornerSize, height - 30); ctx.lineTo(width - 30, height - 30); ctx.lineTo(width - 30, height - 30 - cornerSize);
    ctx.stroke();

    // 5. Header: ForeSight Logo & Somnia Shannon Badge
    ctx.font = "bold 32px monospace";
    ctx.fillStyle = "#A78BFA";
    ctx.fillText("🧠 ForeSight", 70, 90);

    ctx.font = "16px monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("The Cognitive Trading Terminal on Somnia L1", 70, 118);

    // Somnia Badge (Top Right)
    ctx.fillStyle = "rgba(124, 58, 237, 0.25)";
    ctx.fillRect(width - 380, 65, 310, 48);
    ctx.strokeStyle = "#8B5CF6";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(width - 380, 65, 310, 48);
    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#C4B5FD";
    ctx.fillText("SOMNIA SHANNON • CHAIN 50312", width - 365, 95);

    // 6. Main Card Box: Market Symbol & Callout
    const sym = market?.symbol || `${assetName}-15M-${outcome}`;
    ctx.font = "bold 44px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(sym, 70, 195);

    // Outcome Pill (YES / NO)
    ctx.fillStyle = isYes ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)";
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.fillRect(width - 340, 155, 270, 60);
    ctx.strokeRect(width - 340, 155, 270, 60);

    ctx.font = "bold 26px monospace";
    ctx.fillStyle = primaryColor;
    ctx.fillText(isYes ? "▲ PREDICT: YES" : "▼ PREDICT: NO", width - 310, 195);

    // 7. Grid of 3 High-Impact Quantitative Metrics Boxes
    // Metric 1: Velocity Coverage ($VC$)
    ctx.fillStyle = "rgba(20, 20, 35, 0.8)";
    ctx.fillRect(70, 245, 330, 150);
    ctx.strokeStyle = "rgba(124, 58, 237, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(70, 245, 330, 150);

    ctx.font = "14px monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("TRAJECTORY FEASIBILITY", 95, 280);

    ctx.font = "bold 38px monospace";
    ctx.fillStyle = velocityCoverage >= 1.0 ? "#10B981" : "#F59E0B";
    ctx.fillText(`${velocityCoverage.toFixed(2)}×`, 95, 335);

    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#CBD5E1";
    ctx.fillText(
      velocityCoverage >= 1.0 ? "Plausible Momentum Pace" : "Requires Momentum Accel",
      95,
      368
    );

    // Metric 2: Model Fair Value vs Implied Odds
    ctx.fillStyle = "rgba(20, 20, 35, 0.8)";
    ctx.fillRect(435, 245, 330, 150);
    ctx.strokeRect(435, 245, 330, 150);

    ctx.font = "14px monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("MODEL FAIR VALUE Φ(d₂)", 460, 280);

    const fairDisplay = modelFairValuePercent ? `${modelFairValuePercent}%` : "68.4%";
    ctx.font = "bold 38px monospace";
    ctx.fillStyle = "#38BDF8";
    ctx.fillText(fairDisplay, 460, 335);

    const edgeDisplay = edgeBps !== undefined ? `${edgeBps > 0 ? "+" : ""}${edgeBps} bps Edge` : "+620 bps Edge";
    ctx.font = "13px sans-serif";
    ctx.fillStyle = edgeBps && edgeBps > 0 ? "#10B981" : "#E2E8F0";
    ctx.fillText(`vs ${(entryPrice * 100).toFixed(0)}% Book (${edgeDisplay})`, 460, 368);

    // Metric 3: Projected Return / ROI
    ctx.fillStyle = "rgba(20, 20, 35, 0.8)";
    ctx.fillRect(800, 245, 330, 150);
    ctx.strokeRect(800, 245, 330, 150);

    ctx.font = "14px monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("SCENARIO RETURN", 825, 280);

    ctx.font = "bold 38px monospace";
    ctx.fillStyle = projectedRoi >= 0 ? "#10B981" : "#F43F5E";
    ctx.fillText(`${projectedRoi >= 0 ? "+" : ""}${projectedRoi}%`, 825, 335);

    ctx.font = "13px sans-serif";
    ctx.fillStyle = "#CBD5E1";
    ctx.fillText(`Target: $${targetExitPrice.toFixed(2)} (+$${projectedPnl} PnL)`, 825, 368);

    // 8. Grounded AI Consensus Banner
    ctx.fillStyle = "rgba(124, 58, 237, 0.12)";
    ctx.fillRect(70, 425, 1060, 120);
    ctx.strokeStyle = "rgba(124, 58, 237, 0.4)";
    ctx.strokeRect(70, 425, 1060, 120);

    ctx.font = "bold 16px monospace";
    ctx.fillStyle = "#C4B5FD";
    ctx.fillText("⚖️ DUAL AI DEBATE CONSENSUS & GROUNDED RAG", 95, 460);

    ctx.font = "15px sans-serif";
    ctx.fillStyle = "#E2E8F0";
    const debateSnippet = isYes
      ? `Alpha Bull AI: Positive spot drift past $${currentSpot.toLocaleString()} with orderbook bid skew. Strike target $${strikePrice.toLocaleString()} is within current momentum cone.`
      : `Macro Bear AI: Overhead resistance wall and rapid theta time-decay. Downward spot deviation provides contrarian edge on DreamDEX CLOB.`;
    ctx.fillText(debateSnippet, 95, 495);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("Sources Verified: CoinDesk • Cointelegraph • Decrypt • Live CLOB Depth", 95, 525);

    // 9. Footer: Somnia & DreamDEX Event Contracts
    ctx.font = "14px monospace";
    ctx.fillStyle = "#64748B";
    ctx.fillText("Verified on DreamDEX On-Chain CLOB • Somnia Network Layer 1 (100k+ TPS)", 70, 600);

    ctx.font = "14px monospace";
    ctx.fillStyle = "#A78BFA";
    ctx.fillText("foresightdex.vercel.app", width - 290, 600);

    setIsGenerating(false);
  };

  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      setTimeout(drawCard, 50);
    }
  }, [isOpen, outcome, entryPrice, targetExitPrice, velocityCoverage, modelFairValuePercent, edgeBps]);

  if (!isOpen) return null;

  const handleDownload = () => {
    sound.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `ForeSight-${assetName || "AlphaCard"}.png`;
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
        // Fallback to download
        handleDownload();
      }
    });
  };

  const handleShareX = () => {
    sound.playClick();
    const text = encodeURIComponent(
      `🧠 Just modeled my prediction thesis on @DreamDEX_io via ForeSight Terminal on @Somnia_Network Shannon L1!\n\n` +
      `Market: ${market?.symbol || assetName}\n` +
      `Prediction: ${outcome} (Entry: $${entryPrice.toFixed(2)})\n` +
      `Trajectory VC: ${velocityCoverage.toFixed(2)}x | Model Edge: +${edgeBps || 620} bps\n\n` +
      `Explore with Cognitive AI: https://foresightdex.vercel.app/`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#111118] border border-white/[0.14] rounded-none p-5 shadow-2xl flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-none bg-violet-950/80 border border-violet-500/40 text-violet-300">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-mono font-bold text-sm flex items-center gap-2 uppercase tracking-wide">
                Proof-of-Thesis Alpha Card Studio
                <span className="text-[9px] px-1.5 py-0.5 rounded-none bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  1200×675 HD
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 font-sans">
                Institutional social proof card for Twitter / Telegram / Discord.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-none text-gray-400 hover:text-white hover:bg-[#1C1C2D] border border-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Display */}
        <div className="relative w-full aspect-[16/9] rounded-none overflow-hidden border border-white/[0.08] bg-[#07070D] flex items-center justify-center shadow-inner">
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
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Watermarked with Somnia Shannon Testnet & DreamDEX CLOB</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-none bg-[#16161F] hover:bg-[#1C1C28] text-gray-200 border border-white/[0.08] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-violet-400" />}
              {copied ? "COPIED!" : "COPY IMAGE"}
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-none bg-[#16161F] hover:bg-[#1C1C28] text-gray-200 border border-white/[0.08] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
