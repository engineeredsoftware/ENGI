"use client";

import React, { useEffect, useRef } from 'react';

interface Props { className?: string }

export default function QuantumEffect({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const canvasElement = canvas;
    const context = ctx;
    const isLoginEffect = className.includes('login-quantum-effect');

    let width = 0, height = 0;
    const resizeCanvas = () => {
      const parent = canvasElement.parentElement; if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const cssWidth = rect.width; const cssHeight = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasElement.width = cssWidth * dpr; canvasElement.height = cssHeight * dpr;
      canvasElement.style.width = `${cssWidth}px`; canvasElement.style.height = `${cssHeight}px`;
      context.resetTransform(); context.scale(dpr, dpr);
      width = cssWidth; height = cssHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      x = Math.random() * width; y = Math.random() * height;
      size = Math.random() * 3 + 1;
      speedX = (Math.random() - 0.5) * 0.5; speedY = (Math.random() - 0.5) * 0.5;
      color = `rgba(103, 254, 183, ${Math.random() * 0.5 + 0.2})`;
      update(){ this.x += this.speedX; this.y += this.speedY; if (this.x < 0 || this.x > width) this.speedX *= -1; if (this.y < 0 || this.y > height) this.speedY *= -1; }
      draw(){ context.save(); context.fillStyle = this.color; if (isLoginEffect) { context.shadowBlur = 3; context.shadowColor = this.color; } context.beginPath(); context.arc(this.x, this.y, this.size, 0, Math.PI*2); context.fill(); context.restore(); }
    }

    const particles = Array.from({ length: 50 }, () => new Particle());

    let frameId = 0;
    const animate = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      const maxDist = isLoginEffect ? 80 : 100; const maxDistSq = maxDist * maxDist;
      const baseAlpha = isLoginEffect ? 0.15 : 0.05; const lineWidth = isLoginEffect ? 1 : 0.5;
      context.strokeStyle = `rgba(103, 254, 183, ${baseAlpha})`; context.lineWidth = lineWidth;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
          if (dx*dx + dy*dy < maxDistSq) { context.save(); if (isLoginEffect) { context.shadowBlur = 3; context.shadowColor = 'rgba(103,254,183,0.4)'; } context.beginPath(); context.moveTo(particles[i].x, particles[i].y); context.lineTo(particles[j].x, particles[j].y); context.stroke(); context.restore(); }
        }
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => { window.removeEventListener('resize', resizeCanvas); cancelAnimationFrame(frameId); };
  }, [className]);

  return <canvas ref={canvasRef} className={`quantum-effect ${className}`} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', zIndex:-1, opacity: className.includes('login-quantum-effect') ? 0.8 : 0.6 }} />;
}
