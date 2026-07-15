"use client";
import React, { useEffect, useRef } from 'react';

interface NodeType {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export default function MarketingAgentNetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let nodes: NodeType[] = [];
    // Fewer nodes → substantially less O(n²) connection math while
    // preserving the same general aesthetic density.  22 nodes yields
    // 231 pair-checks vs 435 previously – ~47% less work per frame.
    const nodeCount = 22;
    const maxDistance = 120;
    const accentColor = 'rgba(103, 254, 183, 0.6)';

    // Resize the backing canvas buffer **and** refresh all node positions so
    // they fill the visible region at the correct device-pixel resolution.
    //
    // We call this:
    //   1. On initial mount.
    //   2. Whenever the browser window resizes.
    //   3. When the section scrolls into view for the first time – this covers
    //      the case where `content-visibility:auto` gave the element a zero
    //      height during the off-screen prerender pass (which previously left
    //      us with a microscopic, blurry canvas once it became visible).
    let currentDpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      currentDpr = window.devicePixelRatio || 1;
      canvas.width = width * currentDpr;
      canvas.height = height * currentDpr;

      // Reset any existing transforms before applying a new device-pixel
      // ratio scale.  Without this every subsequent resize event would
      // multiply the previous scale, quickly causing the drawing operations
      // to blow up and eat excessive CPU/GPU resources.
      if (typeof ctx.setTransform === 'function') {
        // Safari <16 does not support resetTransform but does expose
        // setTransform(1,0,0,1,0,0) which achieves the same effect.
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else if (typeof (ctx as any).resetTransform === 'function') {
        // Fallback for older Chromium-based implementations.
        (ctx as any).resetTransform();
      }

      ctx.scale(currentDpr, currentDpr);
      initNodes(width, height);
    };

    const initNodes = (width: number, height: number) => {
      const baseSize = 1.5; // max additional radius before scaling adjustment
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        // Adjust the rendered size so visual radius is constant across DPRs.
        // Without this, Hi-DPI devices (e.g. MacBooks @2x) display blobs & lines
        // twice as thick, leading to a blurry/fuzzy look.
        // Render sharp, crisp dots by keeping a full device-pixel radius and
        // letting the Hi-DPI canvas scaling handle physical resolution.  The
        // previous DPR division produced sub-pixel radii (e.g. 0.5px on
        // Retina) which the browser anti-aliased into a fuzzy blur.
        size: (Math.random() * baseSize + 1) / currentDpr,
      }));
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track visibility to pause animation when offscreen
    let isVisible = false;
    const observer = new IntersectionObserver((entries) => {
      const nowVisible = entries[0].isIntersecting;
      // Trigger a one-time resize when we transition from hidden → visible so
      // the canvas reinitialises with the *real* dimensions (instead of the
      // zero-sized placeholder box that `content-visibility:auto` provides
      // while off-screen).
      if (nowVisible && !isVisible) {
        resizeCanvas();
      }
      isVisible = nowVisible;
    }, { threshold: 0.1 });
    observer.observe(canvas);

    let rafId = 0;
    let timeoutId: number | undefined;
    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

      // Draw connections --------------------------------------------------
      // We cap each node to a handful of neighbours so the algorithm scales
      // *almost* linearly instead of the full O(n²) mesh.  Visually this
      // preserves the same airy, interconnected feel while cutting the math
      // and GPU work by an order of magnitude on large canvases.

      const maxLinks = 4;
      const linkCounts = new Array(nodes.length).fill(0);

      for (let i = 0; i < nodes.length; i++) {
        if (linkCounts[i] >= maxLinks) continue;

        for (let j = i + 1; j < nodes.length; j++) {
          if (linkCounts[j] >= maxLinks) continue;

          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistance * maxDistance) {
            const alpha = 1 - Math.sqrt(distSq) / maxDistance;
            ctx.strokeStyle = `rgba(103, 254, 183, ${alpha * 0.6})`;
            ctx.lineWidth = 1 / currentDpr;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            linkCounts[i]++;
            linkCounts[j]++;

            if (linkCounts[i] >= maxLinks) break; // i reached quota
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();
      });

        // Update positions
        nodes.forEach((node) => {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        });
      }
      // Schedule next frame regardless to check visibility
      // Use full frame-rate only when the canvas is visible.  Otherwise back
      // off to ~6fps so the tab remains responsive while still preserving the
      // fluid motion on scroll-in.
      if (isVisible) {
        rafId = requestAnimationFrame(animate);
      } else {
        timeoutId = window.setTimeout(() => {
          rafId = requestAnimationFrame(animate);
        }, 160);
      }
    };

    animate();
    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="hidden tablet:block absolute inset-0 z-1 pointer-events-none homepage-background-agent-network">
      <canvas ref={canvasRef} className="w-full h-full agent-network-canvas" />
    </div>
  );
}
