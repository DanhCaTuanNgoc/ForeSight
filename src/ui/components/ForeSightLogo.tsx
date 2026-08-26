import React from "react";

interface ForeSightLogoProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
  animated?: boolean;
}

export const ForeSightLogo: React.FC<ForeSightLogoProps> = ({
  size = 32,
  className = "",
  showGlow = true,
  animated = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Main Neon Violet Gradients */}
          <linearGradient id="foresightEyeUpper" x1="4" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
            <stop offset="25%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#E879F9" />
            <stop offset="75%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="foresightEyeLower" x1="4" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4338CA" stopOpacity="0.3" />
            <stop offset="30%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="70%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" stopOpacity="0.3" />
          </linearGradient>

          {/* Iris Radial Glow */}
          <radialGradient id="foresightIrisGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="85%" stopColor="#4C1D95" />
            <stop offset="100%" stopColor="#0B0B14" />
          </radialGradient>

          {/* Core Pupil Glow */}
          <radialGradient id="foresightPupilGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#67E8F9" />
            <stop offset="80%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </radialGradient>

          {/* Glow Filters */}
          <filter id="foresightNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Halo Glow */}
        {showGlow && (
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="#7C3AED"
            opacity="0.25"
            className={animated ? "animate-pulse" : ""}
            filter="url(#foresightNeonGlow)"
          />
        )}

        {/* ─── 1. Outer Cybernetic Eyelid Contour ───────────────────── */}
        {/* Upper Outer Eyelid Arch */}
        <path
          d="M 6 32 C 16 13, 48 13, 58 32"
          stroke="url(#foresightEyeUpper)"
          strokeWidth="2.8"
          strokeLinecap="round"
          filter={showGlow ? "url(#foresightNeonGlow)" : undefined}
        />

        {/* Lower Outer Eyelid Arch */}
        <path
          d="M 6 32 C 16 51, 48 51, 58 32"
          stroke="url(#foresightEyeLower)"
          strokeWidth="2.8"
          strokeLinecap="round"
          filter={showGlow ? "url(#foresightNeonGlow)" : undefined}
        />

        {/* Corner Cyber Precision Markers */}
        <line x1="2" y1="32" x2="8" y2="32" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="32" x2="62" y2="32" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
        
        {/* Upper Brow Accent Wings */}
        <path
          d="M 18 19 L 26 14 L 38 14 L 46 19"
          stroke="#C084FC"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeDasharray="4 3"
          opacity="0.75"
        />

        {/* ─── 2. Middle Iris & Radar Grid ─────────────────────────── */}
        {/* Outer Iris Circle */}
        <circle
          cx="32"
          cy="32"
          r="14.5"
          fill="url(#foresightIrisGrad)"
          stroke="#A855F7"
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Radar Tech Grid Arcs */}
        <circle
          cx="32"
          cy="32"
          r="11"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.7"
          className={animated ? "animate-spin" : ""}
          style={{ transformOrigin: "32px 32px", animationDuration: "12s" }}
        />

        {/* Diagonal Crosshairs / Tech Ticks */}
        <circle
          cx="32"
          cy="32"
          r="7.5"
          fill="none"
          stroke="#C084FC"
          strokeWidth="1"
          opacity="0.8"
        />

        {/* ─── 3. Core Vision Nexus (Pupil) ────────────────────────── */}
        {/* Pupil Core */}
        <circle
          cx="32"
          cy="32"
          r="5"
          fill="url(#foresightPupilGrad)"
          filter={showGlow ? "url(#foresightNeonGlow)" : undefined}
        />

        {/* Center Spark / Glint */}
        <circle cx="30" cy="30" r="1.5" fill="#FFFFFF" opacity="0.9" />

        {/* Horizontal Laser Scanning Line */}
        <line
          x1="18"
          y1="32"
          x2="46"
          y2="32"
          stroke="#67E8F9"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>
    </div>
  );
};
export default ForeSightLogo;
