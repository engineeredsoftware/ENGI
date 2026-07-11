
'use client';

import React, { useRef, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { QuantumOrbState } from '../QuantumOrb';
import { FRAME_BUDGET_MS } from '../QuantumOrbConfig';
import { OrbLoopContext } from '../QuantumOrb';

interface WavyBlobLayerProps {
  color: string;
  speed: number;
  direction: 'clockwise' | 'counterClockwise';
  scale: number;
  offset: number;
  rotation?: number;
  state: QuantumOrbState;
  isAnimating?: boolean;
}

export function WavyBlobLayer({
  color,
  speed,
  direction,
  scale,
  offset,
  rotation = 0,
  state,
  isAnimating = true,
}: WavyBlobLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastFrameRef = useRef<number>(0);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  const subscribe = useContext(OrbLoopContext);

  // Initialize points
  useEffect(() => {
    const numPoints = 6;
    pointsRef.current = Array.from({ length: numPoints }, (_, i) => {
      const angle = (i / numPoints) * 2 * Math.PI;
      return {
        x: 0.5 + Math.cos(angle) * 0.9,
        y: 0.5 + Math.sin(angle) * 0.9
      };
    });
  }, [state]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loopDuration = 60000 / speed;

    const drawFrame = () => {
      const now = performance.now();
      if (now - lastFrameRef.current < FRAME_BUDGET_MS) return;
      lastFrameRef.current = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = Date.now() - startTimeRef.current;
      const angle = ((elapsed % loopDuration) / loopDuration) * 2 * Math.PI;

      const width = canvas.width;
      const height = canvas.height;
      const center = { x: width / 2, y: height / 2 };
      const radius = Math.min(width, height) * 0.45;

      const adjustedPoints = pointsRef.current.map((point, index) => {
        const phaseOffset = (index * Math.PI) / 3;
        const xOffset = Math.sin(angle + phaseOffset) * 0.15;
        const yOffset = Math.cos(angle + phaseOffset) * 0.15;

        return {
          x: (point.x - 0.5 + xOffset) * radius + center.x,
          y: (point.y - 0.5 + yOffset) * radius + center.y,
        };
      });

      ctx.save();
      ctx.fillStyle = color;
      ctx.globalAlpha =
        state === 'active' ? 0.8 : state === 'hover' ? 0.7 : 0.6;

      ctx.beginPath();
      ctx.moveTo(adjustedPoints[0].x, adjustedPoints[0].y);

      for (let i = 0; i < adjustedPoints.length; i++) {
        const next = (i + 1) % adjustedPoints.length;

        const currentAngle = Math.atan2(
          adjustedPoints[i].y - center.y,
          adjustedPoints[i].x - center.x,
        );
        const nextAngle = Math.atan2(
          adjustedPoints[next].y - center.y,
          adjustedPoints[next].x - center.x,
        );

        const handleLength = radius * 0.33;

        const control1 = {
          x:
            adjustedPoints[i].x +
            Math.cos(currentAngle + Math.PI / 2) * handleLength,
          y:
            adjustedPoints[i].y +
            Math.sin(currentAngle + Math.PI / 2) * handleLength,
        };

        const control2 = {
          x:
            adjustedPoints[next].x +
            Math.cos(nextAngle - Math.PI / 2) * handleLength,
          y:
            adjustedPoints[next].y +
            Math.sin(nextAngle - Math.PI / 2) * handleLength,
        };

        ctx.bezierCurveTo(
          control1.x,
          control1.y,
          control2.x,
          control2.y,
          adjustedPoints[next].x,
          adjustedPoints[next].y,
        );
      }

      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    let unsubscribe: () => void = () => {};

    if (isAnimating && state !== 'rest') {
      unsubscribe = subscribe(drawFrame);
    } else {
      drawFrame();
    }

    return () => unsubscribe();
  }, [color, speed, state, subscribe, isAnimating]);

  // Handle canvas resize using ResizeObserver instead of `window.resize`
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const updateCanvasSize = () => {
      const { width, height } = parent.getBoundingClientRect();
      // Lower DPR cap on low-end devices – memory usage grows with dpr².
      const deviceDpr = window.devicePixelRatio || 1;
      const lowEnd = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
      // Slightly lower DPR while the orb is in its busiest state to reduce
      // fill-rate without noticeably affecting sharpness.
      const dynamicCap = state === 'active' ? 1 : 1.5;
      const dprCap = lowEnd ? 1 : dynamicCap;
      const dpr = Math.min(deviceDpr, dprCap);
      const ctx2 = canvas.getContext('2d');
      if (!ctx2) return;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Initial size sync
    updateCanvasSize();

    const ro = new ResizeObserver(updateCanvasSize);
    ro.observe(parent);

    return () => {
      ro.disconnect();
    };
  }, [state]);

  // Optimize canvas rendering
  useEffect(() => {
    if (!canvasRef.current) return;

    // Set devicePixelRatio for sharper rendering on high-DPI displays
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Use a lower pixel ratio for blur effects to improve performance
    const deviceDpr = window.devicePixelRatio || 1;
    const lowEnd = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
    const dynamicCap = state === 'active' ? 1 : 2;
    const dprCap = lowEnd ? 1 : dynamicCap;
    const pixelRatio = Math.min(deviceDpr, dprCap);
    canvas.width = canvas.offsetWidth * pixelRatio;
    canvas.height = canvas.offsetHeight * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
  }, []);

  return (
    <motion.div
      className="wavy-blob-container"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale}) translateY(${offset * 100}%) rotate(${rotation}deg)`,
        mixBlendMode: 'plus-lighter',
        filter: 'blur(1px)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      animate={isAnimating ? { rotate: direction === 'clockwise' ? 360 : -360 } : undefined}
      transition={
        isAnimating
          ? {
              duration: 60000 / speed,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop',
            }
          : undefined
      }
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          transform: 'translateZ(0)',
        }}
      />
    </motion.div>
  );
}
