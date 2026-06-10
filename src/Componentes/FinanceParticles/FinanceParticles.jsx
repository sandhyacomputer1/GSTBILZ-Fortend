import React, { useEffect, useRef } from "react";

/**
 * FinanceParticles renders an interactive, high-performance canvas-based particle network
 * that visualizes data capital flows (connecting lines, upward drifts, financial nodes, and faded currency symbols).
 *
 * Props:
 * - opacityMultiplier: controls base opacity of particles (e.g. 0.3 for subtle dashboard background, 0.7 for login screen).
 * - speedMultiplier: speed factor of drifting nodes.
 */
const FinanceParticles = ({ opacityMultiplier = 0.5, speedMultiplier = 1 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Handle resize
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle class definition
    const particles = [];
    const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 22000));
    
    // Financial symbols to randomly assign to some particles
    const financialSymbols = ["₹", "▲", "$", "📈"];

    for (let i = 0; i < particleCount; i++) {
      const isSymbolNode = Math.random() < 0.25; // 25% of nodes show a symbol
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4 * speedMultiplier,
        vy: -(Math.random() * 0.6 + 0.2) * speedMultiplier, // Drifting upwards
        radius: Math.random() * 2 + 1.5,
        alpha: Math.random() * 0.5 + 0.3,
        symbol: isSymbolNode ? financialSymbols[Math.floor(Math.random() * financialSymbols.length)] : null,
        color: Math.random() < 0.4 ? "16, 185, 129" : "99, 102, 241", // Emerald green vs Indigo
      });
    }

    // Tracker for mouse interactions
    const mouse = {
      x: null,
      y: null,
      radius: 120,
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const parent = canvas.parentElement;
    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Update and draw particles
      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0 || p.x > canvas.width) {
          p.vx *= -1;
        }

        // Draw particle node
        ctx.beginPath();
        const finalAlpha = p.alpha * opacityMultiplier;
        
        if (p.symbol) {
          // Draw currency symbol or arrow
          ctx.font = `${p.radius * 5 + 6}px Outfit, Arial`;
          ctx.fillStyle = `rgba(${p.color}, ${finalAlpha})`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.symbol, p.x, p.y);
        } else {
          // Draw standard circular node
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${finalAlpha})`;
          ctx.fill();
        }
      });

      // 2. Connect neighboring particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 110;
          if (dist < maxDist) {
            // Fading connection line based on proximity
            const alpha = (1 - dist / maxDist) * 0.15 * opacityMultiplier;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Gradient lines between green and purple nodes
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, `rgba(${p1.color}, ${alpha})`);
            grad.addColorStop(1, `rgba(${p2.color}, ${alpha})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 3. Connect mouse position to nearby particles
      if (mouse.x !== null && mouse.y !== null) {
        particles.forEach((p) => {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.35 * opacityMultiplier;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(${p.color}, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Clean up events on unmount
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [opacityMultiplier, speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

export default FinanceParticles;
