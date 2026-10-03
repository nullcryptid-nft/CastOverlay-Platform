import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  pulse: number;
}

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    const colors = ["rgba(6,182,212,", "rgba(139,92,246,", "rgba(34,211,238,", "rgba(168,85,247,"];
    const particles: Particle[] = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove);

    const drawSynthGrid = (w: number, h: number, t: number) => {
      // Subtle scrolling synthwave grid
      const gridColor = "rgba(6,182,212,0.04)";
      const spacing = 80;
      const offset = (t * 20) % spacing;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      // Horizontal lines
      for (let y = -spacing + offset; y < h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      // Vertical lines (static)
      for (let x = 0; x < w; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // Perspective flare at bottom
      const grad = ctx.createLinearGradient(0, h - 150, 0, h);
      grad.addColorStop(0, "rgba(6,182,212,0)");
      grad.addColorStop(1, "rgba(6,182,212,0.05)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, h - 150, w, 150);
    };

    const animate = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const { x: mx, y: my } = mouseRef.current;
      const w = canvas!.width;
      const h = canvas!.height;

      ctx.clearRect(0, 0, w, h);
      drawSynthGrid(w, h, t);

      // Subtle 3D tilt based on mouse
      const tiltX = (mx - 0.5) * 6;
      const tiltY = (my - 0.5) * 4;

      const pts = particlesRef.current;
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        // Wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Parallax offset by mouse
        const px = (p.x + (mx - 0.5) * p.size * 8 + (tiltX * p.size * 0.5) + w) % w;
        const py = (p.y + (my - 0.5) * p.size * 8 + (tiltY * p.size * 0.5) + h) % h;

        const glow = 0.3 + Math.sin(p.pulse) * 0.2;
        const alpha = p.alpha * glow;

        // Glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        g.addColorStop(0, `${p.color}${alpha * 0.8})`);
        g.addColorStop(1, `${p.color}0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};