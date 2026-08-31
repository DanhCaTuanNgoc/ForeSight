import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";
import { useWallet } from "../context/WalletContext.js";

interface OnboardingGuideProps {
  onSelectStep?: (stepNumber: number) => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onSelectStep }) => {
  const wallet = useWallet();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem("foresight_onboarding_dismissed") === "true";
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const steps = [
    {
      number: 1,
      title: "Somnia Shannon L1",
      desc: "Connect MetaMask to Chain ID 50312",
      isCompleted: wallet.isConnected && wallet.isCorrectNetwork,
    },
    {
      number: 2,
      title: "DETECT & DEBATE",
      desc: "Select a Probability Spike to inspect Bull vs Bear RAG evidence",
      isCompleted: true, // Marked active
    },
    {
      number: 3,
      title: "SIMULATE ($)",
      desc: "Stress-test Velocity Coverage and 0ms PnL curves before trading",
      isCompleted: false,
    },
    {
      number: 4,
      title: "AUTO-CLAIM",
      desc: "Batch-sweep and redeem matured event contracts with 0 stranded capital",
      isCompleted: false,
    },
  ];

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (isDismissed) {
    return (
      <button
        onClick={() => {
          sound.playClick();
          setIsDismissed(false);
          localStorage.removeItem("foresight_onboarding_dismissed");
        }}
        className="text-[11px] font-mono text-violet-400 hover:text-violet-300 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131322] border border-violet-800/40 transition-all ml-auto mb-2"
      >
        <Sparkles className="w-3 h-3 text-violet-400" />
        Show Quickstart Quest
      </button>
    );
  }

  return (
    <div className="mb-3.5 rounded-xl border border-violet-700/40 bg-gradient-to-r from-[#0E0E1A] via-[#121226] to-[#0A0A14] p-3 shadow-lg relative overflow-hidden">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-violet-600/30 border border-violet-500/50 text-violet-300">
            <Compass className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h4 className="text-white text-xs font-mono font-bold flex items-center gap-2">
              ForeSight Cognitive Onboarding Quest
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-950 text-violet-300 border border-violet-700/50 font-mono">
                {completedCount}/{steps.length} Completed ({progressPercent}%)
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1C1C2E] transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setIsDismissed(true);
              localStorage.setItem("foresight_onboarding_dismissed", "true");
            }}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1C1C2E] transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#181828] h-1.5 rounded-full my-2 overflow-hidden border border-[#25253D]">
        <div
          className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 4 Interactive Quest Steps */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
          {steps.map((step) => (
            <div
              key={step.number}
              onClick={() => {
                sound.playClick();
                if (onSelectStep) onSelectStep(step.number);
              }}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                step.isCompleted
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                  : "bg-[#141424]/80 border-[#2A2A40] hover:border-violet-600/50 text-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Circle className="w-3 h-3 text-gray-500" />
                  )}
                  Step 0{step.number}
                </span>
                {step.isCompleted && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-mono">
                    Done
                  </span>
                )}
              </div>
              <div className="font-mono text-xs font-bold text-white truncate">{step.title}</div>
              <div className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-2">
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
