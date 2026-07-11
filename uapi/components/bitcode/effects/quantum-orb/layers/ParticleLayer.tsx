
'use client';

import React, { useEffect, useRef, useContext } from 'react';
import { QuantumOrbState } from '../QuantumOrb';
import { FRAME_BUDGET_MS } from '../QuantumOrbConfig';
import { OrbLoopContext } from '../QuantumOrb';

interface ParticleLayerProps {
  color: string;
  count: number;
  speed: number;
  state: QuantumOrbState;
  isAnimating?: boolean;
}

// ---------------------------------------------------------------------------
// Utility helpers (kept outside the component so they are created once)
// ---------------------------------------------------------------------------

/**
 * Convert a 3/6-digit hex colour (e.g. "#67feb7") to an `rgba()` string with
 * the provided alpha.
 */
// ---------------------------------------------------------------------------
// Colour helpers – we parse the hex once and later just inject the alpha
// component, avoiding repeated hex-string parsing in the hot draw loop.
// ---------------------------------------------------------------------------

function parseHexRGB(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const isShort = clean.length === 3;
  const num = parseInt(clean, 16);

  const r = isShort ? ((num >> 8) & 0xf) * 17 : (num >> 16) & 0xff;
  const g = isShort ? ((num >> 4) & 0xf) * 17 : (num >> 8) & 0xff;
  const b = isShort ? (num & 0xf) * 17 : num & 0xff;

  return [r, g, b];
}

function rgbToRgbaString(r: number, g: number, b: number, a: number) {
  return `rgba(${r},${g},${b},${a})`;
}

export function ParticleLayer({ color, count, speed, state, isAnimating = true }: ParticleLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // Struct-of-arrays typed-array store for particle properties.  This improves
  // memory locality and avoids per-particle JS object allocations.
  const positionsX = useRef<Float32Array | null>(null);
  const positionsY = useRef<Float32Array | null>(null);
  const sizes = useRef<Float32Array | null>(null);
  const speeds = useRef<Float32Array | null>(null);
  const angles = useRef<Float32Array | null>(null);
  const opacities = useRef<Float32Array | null>(null);
  const life = useRef<Uint16Array | null>(null);
  const maxLife = useRef<Uint16Array | null>(null);
  const lastFrameRef = useRef<number>(0);

  // Pre-parsed RGB so we can compose RGBA strings cheaply per frame.
  const rgbRef = useRef<[number, number, number]>(parseHexRGB(color));

  // Update RGB cache if the colour prop changes
  useEffect(() => {
    if (workerRef.current) {
      // Worker path active, skip main-thread drawing logic.
      return;
    }
    rgbRef.current = parseHexRGB(color);
  }, [color]);

  const subscribe = useContext(OrbLoopContext);

  const getParticleBuffers = () => {
    if (
      !positionsX.current ||
      !positionsY.current ||
      !sizes.current ||
      !speeds.current ||
      !angles.current ||
      !opacities.current ||
      !life.current ||
      !maxLife.current
    ) {
      return null;
    }

    return {
      positionsX: positionsX.current,
      positionsY: positionsY.current,
      sizes: sizes.current,
      speeds: speeds.current,
      angles: angles.current,
      opacities: opacities.current,
      life: life.current,
      maxLife: maxLife.current,
    };
  };

  /* --------------------------------------------------------------------- */
  /* OffscreenCanvas fast-path (runs drawing in a dedicated worker)        */
  /* --------------------------------------------------------------------- */

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const supportsOffscreen =
      typeof (window as any).OffscreenCanvas !== 'undefined' &&
      (canvasEl as any).transferControlToOffscreen;

    if (!supportsOffscreen) return; // Fallback to main-thread path below

    // If a worker already exists we merely forward updates and skip transfer
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'update',
        color,
        speed,
      });
      return;
    }

    const offscreen = (canvasEl as any).transferControlToOffscreen();

    // Inline worker code – keeps the bundle small and avoids separate file
    const workerSrc = `
      let canvas, ctx;
      let w = 0, h = 0;
      let positionsX, positionsY, sizes, speeds, angles, opacities, life, maxLife;
      let count = 0, speed = 60, color = '#ffffff', rgb = [255,255,255];

      const FRAME_BUDGET = 16;

      function rgbFromHex(hex){
        const c = hex.replace('#','');
        const short = c.length === 3;
        const num = parseInt(c,16);
        const r = short ? ((num>>8)&0xf)*17 : (num>>16)&0xff;
        const g = short ? ((num>>4)&0xf)*17 : (num>>8)&0xff;
        const b = short ? (num&0xf)*17 : num&0xff;
        return [r,g,b];
      }

      function rgbaStr(r,g,b,a){return 'rgba('+r+','+g+','+b+','+a+')';}

      function initParticle(i){
        const ang = Math.random()*Math.PI*2;
        const dist = Math.random()*0.5;
        positionsX[i] = 0.5 + Math.cos(ang)*dist;
        positionsY[i] = 0.5 + Math.sin(ang)*dist;
        sizes[i]=0.5+Math.random()*1.5;
        speeds[i]=(0.01+Math.random()*0.02)*(speed/60);
        angles[i]=Math.random()*Math.PI*2;
        opacities[i]=0;
        life[i]=0;
        maxLife[i]=100+Math.floor(Math.random()*100);
      }

      function setupArrays(){
        positionsX = new Float32Array(count);
        positionsY = new Float32Array(count);
        sizes = new Float32Array(count);
        speeds = new Float32Array(count);
        angles = new Float32Array(count);
        opacities = new Float32Array(count);
        life = new Uint16Array(count);
        maxLife = new Uint16Array(count);
        for(let i=0;i<count;i++) initParticle(i);
      }

      let last=0;
      function draw(now){
        if(now-last<FRAME_BUDGET){requestAnimationFrame(draw);return;}
        last=now;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for(let i=0;i<count;i++){
          life[i]++;
          const l=life[i], maxL=maxLife[i];
          let o;
          if(l<maxL*0.2){o=(l/(maxL*0.2))*0.8;}else if(l>maxL*0.8){o=0.8*(1-(l-maxL*0.8)/(maxL*0.2));}else{o=0.8;}
          opacities[i]=o;
          positionsX[i]+=Math.cos(angles[i])*speeds[i];
          positionsY[i]+=Math.sin(angles[i])*speeds[i];
          if(l>=maxL || positionsX[i]<0 || positionsX[i]>1 || positionsY[i]<0 || positionsY[i]>1){initParticle(i);continue;}
          const x=positionsX[i]*canvas.width;
          const y=positionsY[i]*canvas.height;
          const sz=sizes[i]*(canvas.width/100);
          const rgba=rgbaStr(rgb[0],rgb[1],rgb[2],o);
          ctx.save();
          ctx.shadowBlur=sz*3;
          ctx.shadowColor=rgba;
          ctx.fillStyle=rgba;
          ctx.beginPath();
          ctx.arc(x,y,sz,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
        requestAnimationFrame(draw);
      }

      self.onmessage = function(e){
        if(e.data.type==='init'){
          canvas = e.data.canvas;
          ctx = canvas.getContext('2d', {alpha:true, desynchronized:true});
          w = canvas.width = e.data.width;
          h = canvas.height = e.data.height;
          count = e.data.count;
          speed = e.data.speed;
          color = e.data.color;
          rgb = rgbFromHex(color);
          setupArrays();
          requestAnimationFrame(draw);
        }else if(e.data.type==='resize'){
          w = canvas.width = e.data.width;
          h = canvas.height = e.data.height;
        }else if(e.data.type==='update'){
          if(e.data.color){color=e.data.color;rgb=rgbFromHex(color);} 
        }
      }
    `;

    const worker = new Worker(URL.createObjectURL(new Blob([workerSrc], { type: 'application/javascript' })));
    workerRef.current = worker;

    // Initial config
    const deviceDpr = window.devicePixelRatio || 1;
    const lowEnd = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
    const dynamicCap = state === 'active' ? 1 : 1.5;
    const dprCap = lowEnd ? 1 : dynamicCap;
    const dpr = Math.min(deviceDpr, dprCap);

    const initMsg = {
      type: 'init',
      canvas: offscreen,
      width: canvasEl.clientWidth * dpr,
      height: canvasEl.clientHeight * dpr,
      dpr,
      count,
      color,
      speed,
    } as any;
    worker.postMessage(initMsg, [offscreen]);

    // Handle resize
    const ro = new ResizeObserver(() => {
      if (!workerRef.current) return;
      const deviceDpr = window.devicePixelRatio || 1;
      const lowEnd = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
      const dynamicCap = state === 'active' ? 1 : 1.5;
      const dprCap = lowEnd ? 1 : dynamicCap;
      const dpr = Math.min(deviceDpr, dprCap);
      workerRef.current.postMessage({
        type: 'resize',
        width: canvasEl.clientWidth * dpr,
        height: canvasEl.clientHeight * dpr,
      });
    });
    ro.observe(canvasEl.parentElement!);

    return () => {
      worker.terminate();
      ro.disconnect();
    };
  }, [count, color, speed, state]);

  // Fill a particle slot at index `i` with fresh randomised values.
  const initParticle = (i: number) => {
    const buffers = getParticleBuffers();
    if (!buffers) return;

    const {
      positionsX: positionsXData,
      positionsY: positionsYData,
      sizes: sizesData,
      speeds: speedsData,
      angles: anglesData,
      opacities: opacitiesData,
      life: lifeData,
      maxLife: maxLifeData,
    } = buffers;
    const ang = Math.random() * Math.PI * 2;
    const dist = Math.random() * 0.5;

    positionsXData[i] = 0.5 + Math.cos(ang) * dist;
    positionsYData[i] = 0.5 + Math.sin(ang) * dist;
    sizesData[i] = 0.5 + Math.random() * 1.5;
    speedsData[i] = (0.01 + Math.random() * 0.02) * (speed / 60);
    anglesData[i] = Math.random() * Math.PI * 2;
    opacitiesData[i] = 0;
    lifeData[i] = 0;
    maxLifeData[i] = 100 + Math.floor(Math.random() * 100);
  };

  // Allocate / reallocate typed arrays when the particle count or speed
  // changes.
  useEffect(() => {
    if (workerRef.current) return;
    positionsX.current = new Float32Array(count);
    positionsY.current = new Float32Array(count);
    sizes.current = new Float32Array(count);
    speeds.current = new Float32Array(count);
    angles.current = new Float32Array(count);
    opacities.current = new Float32Array(count);
    life.current = new Uint16Array(count);
    maxLife.current = new Uint16Array(count);

    for (let i = 0; i < count; i++) {
      initParticle(i);
    }
  }, [count, speed]);

  // Animation loop via shared rAF provided by OrbLoopContext
  useEffect(() => {
    if (workerRef.current) return; // Worker path already set up context
    if (!canvasRef.current) return;
    const buffers = getParticleBuffers();
    if (!buffers) return; // arrays not ready yet
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    } as any) as CanvasRenderingContext2D | null;
    if (!ctx) return;
    const {
      positionsX: positionsXData,
      positionsY: positionsYData,
      sizes: sizesData,
      speeds: speedsData,
      angles: anglesData,
      opacities: opacitiesData,
      life: lifeData,
      maxLife: maxLifeData,
    } = buffers;

    const drawFrame = () => {
      const now = performance.now();
      if (now - lastFrameRef.current < FRAME_BUDGET_MS) return;
      lastFrameRef.current = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const len = positionsXData.length;
      const [rr, gg, bb] = rgbRef.current;
      const stateOpacityMultiplier =
        state === 'active' ? 1 : state === 'hover' ? 0.8 : 0.6;

      for (let i = 0; i < len; i++) {
        lifeData[i]++;

        // Calculate opacity easing based on life span
        const l = lifeData[i];
        const maxL = maxLifeData[i];

        let o: number;
        if (l < maxL * 0.2) {
          o = (l / (maxL * 0.2)) * 0.8;
        } else if (l > maxL * 0.8) {
          o = 0.8 * (1 - (l - maxL * 0.8) / (maxL * 0.2));
        } else {
          o = 0.8;
        }

        opacitiesData[i] = o;

        const finalOpacity = o * stateOpacityMultiplier;

        // Update position
        positionsXData[i] += Math.cos(anglesData[i]) * speedsData[i];
        positionsYData[i] += Math.sin(anglesData[i]) * speedsData[i];

        // Respawn if dead or out of bounds
        if (
          l >= maxL ||
          positionsXData[i] < 0 ||
          positionsXData[i] > 1 ||
          positionsYData[i] < 0 ||
          positionsYData[i] > 1
        ) {
          initParticle(i);
          continue;
        }

        const x = positionsXData[i] * canvas.width;
        const y = positionsYData[i] * canvas.height;
        const sz = sizesData[i] * (canvas.width / 100);

        const rgba = rgbToRgbaString(rr, gg, bb, finalOpacity);

        ctx.save();
        ctx.shadowBlur = sz * 3;
        ctx.shadowColor = rgba;
        ctx.fillStyle = rgba;

        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    let unsubscribe: () => void = () => {};

    if (isAnimating && state !== 'rest') {
      unsubscribe = subscribe(drawFrame);
    } else {
      drawFrame();
    }

    return () => unsubscribe();
  }, [color, speed, state, subscribe, isAnimating]);

  // Handle canvas resize using ResizeObserver (no global `resize` listener)
  useEffect(() => {
    if (workerRef.current) return; // Offscreen/worker handles its own resize
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const updateCanvasSize = () => {
      const { width, height } = parent.getBoundingClientRect();
      const deviceDpr = window.devicePixelRatio || 1;
      const lowEnd = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
      const dynamicCap = state === 'active' ? 1 : 1.5;
      const dprCap = lowEnd ? 1 : dynamicCap;
      const dpr = Math.min(deviceDpr, dprCap);
      const ctx2 = canvas.getContext('2d', {
        alpha: true,
        desynchronized: true,
      } as any) as CanvasRenderingContext2D | null;
      if (!ctx2) return;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateCanvasSize();

    const ro = new ResizeObserver(updateCanvasSize);
    ro.observe(parent);

    return () => ro.disconnect();
  }, [state]);

  // Optimize canvas rendering
  useEffect(() => {
    if (workerRef.current) return; // Skip when using Offscreen worker
    if (!canvasRef.current) return;

    // Set devicePixelRatio for sharper rendering on high-DPI displays
    const canvas = canvasRef.current;
    const deviceDpr = window.devicePixelRatio || 1;
    const lowEnd = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
    const dynamicCap = state === 'active' ? 1 : 2;
    const dprCap = lowEnd ? 1 : dynamicCap;
    const pixelRatio = Math.min(deviceDpr, dprCap);

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    } as any) as CanvasRenderingContext2D | null;
    if (!ctx) return;

    // Apply the new DPR
    canvas.width = canvas.offsetWidth * pixelRatio;
    canvas.height = canvas.offsetHeight * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    // Disable image smoothing for particle rendering (better performance)
    ctx.imageSmoothingEnabled = false;
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        mixBlendMode: 'plus-lighter',
        willChange: 'transform',
        transform: 'translateZ(0)',
        contain: 'paint',
      }}
    />
  );
}
