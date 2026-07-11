"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WordRotate from "@/components/bitcode/WordRotate/WordRotate";
import "@/styles/shippable-template-text.css";

interface ShippableTemplate {
  id: string;
  name: string;
  text: string;
}

interface ShippableTemplateTextProps {
  text: string;
  templates?: ShippableTemplate[];
  defaultNeed: string;
  onSelect: (read: string) => void;
  onTemplateSelect: (templateId: string) => void;
  onMouseEnter: () => void;
  duration: number;
  delay?: number;
  width?: number;
}

export default function ShippableTemplateText({
  text,
  templates,
  defaultNeed,
  onSelect,
  onTemplateSelect,
  onMouseEnter,
  duration,
  delay,
  width,
}: ShippableTemplateTextProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTemplateText, setSelectedTemplateText] = useState<string | null>(null);

  const [maxWidth, setMaxWidth] = useState<number>(0);
  const rootRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => { if (!canvasRef.current && typeof document !== "undefined") canvasRef.current = document.createElement("canvas"); }, []);

  const possibleStrings = React.useMemo(() => {
    const names = templates?.map((t) => t.name) ?? [];
    return [text, "select a template...", ...names];
  }, [text, templates]);

  useEffect(() => {
    if (!rootRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const style = window.getComputedStyle(rootRef.current);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    let widest = 0;
    possibleStrings.forEach((str) => { widest = Math.max(widest, ctx.measureText(str).width); });
    setMaxWidth(Math.ceil(Math.max(widest, width ?? 0)));
  }, [possibleStrings, width]);

  useEffect(() => {
    if (!showTemplates) return;
    const handler = () => setShowTemplates(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showTemplates]);

  const [baseWidth, setBaseWidth] = useState<number>(0);
  useEffect(() => {
    if (!rootRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const style = window.getComputedStyle(rootRef.current);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    setBaseWidth(Math.ceil(ctx.measureText(text).width));
  }, [text]);

  const displayWords = [text, "select a template...", hoveredTemplate || selectedTemplate || ""];
  const currentWordIndex = (() => { if (showTemplates) { if (hoveredTemplate) return 2; if (selectedTemplate) return 2; return 1; } return hoveredTemplate && selectedTemplate ? 2 : 0; })();

  const handleShippableClick = () => { if (selectedTemplateText) onSelect(selectedTemplateText); else onSelect(defaultNeed); };

  return (
    <span ref={rootRef} className="group/shimmer" style={{ display: "inline-block", position: "relative", fontSize: "inherit", lineHeight: "inherit", verticalAlign: "baseline", width: baseWidth ? `${baseWidth}px` : "auto", minWidth: baseWidth ? `${baseWidth}px` : "auto", maxWidth: baseWidth ? `${baseWidth}px` : "auto" }}>
      <span className="relative inline-block">
        <div className="relative inline-block group/template">
          <button data-testid="template-toggle" onClick={handleShippableClick} onMouseEnter={() => { if (onMouseEnter) onMouseEnter(); if (selectedTemplate) setHoveredTemplate(selectedTemplate); }} onMouseLeave={() => setHoveredTemplate(null)} className="relative inline-block" style={{ lineHeight: "inherit", width: "100%", overflow: "visible", pointerEvents: "auto", isolation: "isolate" }}>
            <div className="text-gray-300 group-hover/shimmer:text-purple-300 transition-colors duration-300" style={{ display: "inline-block", fontSize: "inherit", lineHeight: "inherit", verticalAlign: "top", pointerEvents: "none" }}>
              <WordRotate words={displayWords} activeIndex={currentWordIndex} marquee marqueeSpeed={8} width={baseWidth} framerProps={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }} className="animate-[shiny_2.5s_ease_infinite]" />
            </div>
          </button>
          {templates && templates.length > 0 && (
            <span className="absolute -bottom-1 right-[-0.4rem] pointer-events-auto z-20 overflow-y-hidden inline-block" style={{ contain: "layout paint" }}>
              <button onClick={(e) => { e.stopPropagation(); setShowTemplates(true); }} onMouseEnter={onMouseEnter} className="rounded-full group/toggle relative overflow-hidden flex items-center justify-between transition-[width] duration-300 ease-orbit-fluid max-w-fit text-purple-300 hover:text-purple-200">
                <span className={`text-[10px] font-medium tracking-wide transition-all duration-300 ease-orbit-overshoot whitespace-nowrap mr-0 ${showTemplates ? "opacity-100 text-purple-200 text-shadow-purple" : "opacity-0 pointer-events-none group-hover/template:opacity-30 group-hover/shimmer:opacity-30"} group-hover/toggle:opacity-100 group-hover/toggle:text-purple-200`} style={{ lineHeight: 1, pointerEvents: "none" }}>templates</span>
                <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-all duration-300 stroke-[2.5] mr-0 opacity-0 group-hover/template:opacity-30 group-hover/shimmer:opacity-30 group-hover/toggle:opacity-100 ${showTemplates ? "text-purple-200 text-shadow-purple" : "text-purple-300 text-shadow-purple"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{showTemplates ? (<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />) : (<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />)}</svg>
              </button>
            </span>
          )}
        </div>
        <AnimatePresence>
          {showTemplates && (
            <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute left-0 top-full mt-1.5 z-50 min-w-[260px]">
              <div className="rounded-xl border border-[#67feb7]/12 bg-[#030816]/98 backdrop-blur-sm shadow-lg" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(103,254,183,0.06), inset 0 0 12px rgba(103,254,183,0.02)" }}>
                <div className="py-1 px-1">
                  {templates!.map((template) => (
                    <button data-testid={`template-item-${template.id}`} key={template.id} onClick={(e) => { e.stopPropagation(); onTemplateSelect(template.id); onSelect(template.text); setSelectedTemplate(template.name); setSelectedTemplateText(template.text); }} onMouseEnter={() => setHoveredTemplate(template.name)} onMouseLeave={() => setHoveredTemplate(null)} className="w-full px-2.5 py-1.5 text-left text-sm text-gray-400 hover:text-white rounded-md transition-all duration-150 group/template-item flex items-center justify-between relative">
                      <div className="absolute inset-0 rounded-md transition-all duration-150">
                        <div className={`absolute inset-0 rounded-md p-[1px] opacity-0 transition-opacity duration-150 ${hoveredTemplate === template.name || selectedTemplate === template.name ? "opacity-100" : ""}`} style={{ background: "linear-gradient(120deg, rgba(167,139,250,0.2), rgba(216,180,254,0.3))", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
                        <div className={`absolute inset-0 rounded-md opacity-0 transition-opacity duration-150 ${hoveredTemplate === template.name || selectedTemplate === template.name ? "opacity-100" : ""}`} style={{ background: "linear-gradient(120deg, rgba(167,139,250,0.08), rgba(216,180,254,0.02))" }} />
                      </div>
                      <span className="truncate mr-4 relative z-10">{template.name}</span>
                      <svg className={`w-3.5 h-3.5 flex-shrink-0 relative z-10 transition-all duration-150 ${selectedTemplate === template.name ? "text-purple-300 opacity-100" : "text-purple-300/40 opacity-0 group-hover/template-item:opacity-100"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </span>
  );
}
