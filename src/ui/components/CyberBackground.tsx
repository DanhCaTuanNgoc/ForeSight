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
      pulseSpeed: number;
      baseAlpha: number;
    }

    interface DataPulse {
      fromIdx: number;
      toIdx: number;
      progress: number;
      speed: number;
      color: string;
    }

    interface Shockwave {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
    }

    const PARTICLE_COUNT = Math.min(55, Math.floor((width * height) / 20000));
    const particles: Particle[] = [];
    const colors = [
      "rgba(167, 139, 250, ", // Violet-400
      "rgba(192, 132, 252, ", // Purple-400
      "rgba(16, 185, 129, ",  // Emerald-500 (Somnia)
      "rgba(6, 182, 212, ",   // Cyan-500
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    // Data pulses traveling between nodes (simulating 100k TPS on Somnia)
    const pulses: DataPulse[] = [];
    const shockwaves: Shockwave[] = [];

    // Mouse coordinates for spotlight and subtle particle interaction
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate(${mouseX - 350}px, ${mouseY - 350}px)`;
      }
    };

    const handleClick = (e: MouseEvent) => {
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: 180,
        alpha: 0.9,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    let frameCount = 0;

    // Animation render loop
    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Spawn random data pulses between close nodes
      if (frameCount % 45 === 0 && particles.length > 2) {
        const from = Math.floor(Math.random() * particles.length);
        // Find a nearby neighbor
        for (let j = 0; j < particles.length; j++) {
          if (from === j) continue;
          const dist = Math.hypot(particles[from].x - particles[j].x, particles[from].y - particles[j].y);
          if (dist < 140) {
            pulses.push({
              fromIdx: from,
              toIdx: j,
              progress: 0,
              speed: 0.025 + Math.random() * 0.02,
              color: particles[from].color,
            });
            break;
          }
        }
      }

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Pulse alpha
        p.alpha = p.baseAlpha + Math.sin(frameCount * p.pulseSpeed) * 0.2;

        // Bounce on boundary
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse repulsion
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && dist > 0) {
          p.x -= (dx / dist) * 0.5;
          p.y -= (dy / dist) * 0.5;
        }

        // Draw particle dot with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.1, p.alpha)})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `${p.color}0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Connect nearby particles with glowing lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distBetween = Math.hypot(p.x - p2.x, p.y - p2.y);
          const maxLinkDist = 140;

          if (distBetween < maxLinkDist) {
            const lineAlpha = (1 - distBetween / maxLinkDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw Data Pulses (laser packets traveling along links)
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k];
        pulse.progress += pulse.speed;

        const p1 = particles[pulse.fromIdx];
        const p2 = particles[pulse.toIdx];

        if (p1 && p2 && pulse.progress <= 1) {
          const px = p1.x + (p2.x - p1.x) * pulse.progress;
          const py = p1.y + (p2.y - p1.y) * pulse.progress;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `${pulse.color}0.95)`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#A78BFA";
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          pulses.splice(k, 1);
        }
      }

      // Draw Click Shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += 5;
        sw.alpha -= 0.025;

        if (sw.alpha > 0 && sw.radius < sw.maxRadius) {
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(167, 139, 250, ${sw.alpha})`;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 15;
          ctx.shadowColor = "rgba(6, 182, 212, 0.8)";
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          shockwaves.splice(s, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ─── Layer 1: Multi-Zone High-Tech Aurora Glowing Nebulae ─── */}
      {/* Top Center: ForeSight Intelligence Core Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-violet-600/28 via-fuchsia-900/18 to-transparent rounded-full blur-[140px]" />

      {/* Right Flank: Somnia Emerald CLOB Liquidity Glow */}
      <div className="absolute top-1/4 -right-48 w-[800px] h-[800px] bg-emerald-500/15 rounded-full blur-[180px]" />

      {/* Bottom Left: Deep Cyan & Indigo Horizon Atmosphere */}
      <div className="absolute -bottom-48 -left-48 w-[850px] h-[850px] bg-gradient-to-tr from-cyan-600/18 via-indigo-900/20 to-transparent rounded-full blur-[180px]" />

      {/* ─── Layer 2: Interactive Mouse Spotlight Aura ─── */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-0 w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.18)_0%,rgba(6,182,212,0.08)_35%,transparent_70%)] blur-3xl will-change-transform opacity-85 transition-opacity duration-300 pointer-events-none"
        style={{ transform: "translate(-1000px, -1000px)" }}
      />

      {/* ─── Layer 3: Tech Grid Canvas with Radial Fade ─── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4C4C7024_1px,transparent_1px),linear-gradient(to_bottom,#4C4C7024_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_25%,#000_65%,transparent_100%)] opacity-80" />

      {/* ─── Layer 4: Micro Dot Matrix Grid ─── */}
      <div className="absolute inset-0 bg-[radial-gradient(#56568244_1px,transparent_1px)] [background-size:22px_22px] opacity-50" />

      {/* ─── Layer 5: Dynamic Particle Constellation Canvas ─── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-85" />

      {/* ─── Layer 6: Subtle Tactile Micro-Noise Texture ─── */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
export default CyberBackground;
