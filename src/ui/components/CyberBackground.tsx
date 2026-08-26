import React, { useEffect, useRef } from "react";

export const CyberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle definition
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }

    const PARTICLE_COUNT = Math.min(45, Math.floor((width * height) / 25000));
    const particles: Particle[] = [];
    const colors = [
      "rgba(167, 139, 250, ", // Violet-400
      "rgba(124, 58, 237, ",  // Violet-600
      "rgba(16, 185, 129, ",  // Emerald-500 (Somnia)
      "rgba(6, 182, 212, ",   // Cyan-500
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.75,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.45 + 0.15,
      });
    }

    // Mouse coordinates for subtle particle interaction
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate(${mouseX - 300}px, ${mouseY - 300}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundary
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Subtle mouse repulsion
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          p.x -= (dx / dist) * 0.4;
          p.y -= (dy / dist) * 0.4;
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Connect nearby particles with glowing lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distBetween = Math.hypot(p.x - p2.x, p.y - p2.y);
          const maxLinkDist = 135;

          if (distBetween < maxLinkDist) {
            const lineAlpha = (1 - distBetween / maxLinkDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ─── Layer 1: Multi-Zone Aurora Atmospheric Glowing Blobs ─── */}
      {/* Top Center: ForeSight Violet Intelligence Core */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-violet-600/25 via-fuchsia-900/15 to-transparent rounded-full blur-[140px] animate-pulse duration-1000" />

      {/* Right Side: Somnia Emerald CLOB Liquidity Glow */}
      <div className="absolute top-1/3 -right-48 w-[650px] h-[650px] bg-emerald-600/10 rounded-full blur-[160px]" />

      {/* Bottom Left: Deep Cyan & Indigo Sub-surface Mist */}
      <div className="absolute -bottom-48 -left-48 w-[750px] h-[750px] bg-gradient-to-tr from-cyan-600/12 via-indigo-900/15 to-transparent rounded-full blur-[160px]" />

      {/* ─── Layer 2: Interactive Mouse Spotlight Aura ─── */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.14)_0%,rgba(6,182,212,0.06)_40%,transparent_70%)] blur-2xl will-change-transform opacity-75 transition-opacity duration-300 pointer-events-none"
        style={{ transform: "translate(-1000px, -1000px)" }}
      />

      {/* ─── Layer 3: Tech Dot Matrix Grid ─── */}
      <div className="absolute inset-0 bg-[radial-gradient(#2A2A3D55_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

      {/* ─── Layer 4: Scanning Radar Beam Across Screen ─── */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent animate-laserSweep opacity-40" />
      </div>

      {/* ─── Layer 5: Dynamic Particle Constellation Canvas ─── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* ─── Layer 6: Subtle Tactile Micro-Noise Texture ─── */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
export default CyberBackground;
