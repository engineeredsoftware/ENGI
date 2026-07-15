/**
 * Positions the curved SVG arrow from the GitHub App link to Setup step #1.
 */
import { useCallback, useEffect, type RefObject } from "react";

export function useScreenshotArrow(args: {
  howItWorksRef: RefObject<HTMLDivElement | null>;
  linkRef: RefObject<HTMLAnchorElement | null>;
  step1Ref: RefObject<HTMLDivElement | null>;
  installRef: RefObject<HTMLLIElement | null>;
  arrowRef: RefObject<SVGSVGElement | null>;
  arrowPathRef: RefObject<SVGPathElement | null>;
  arrowHeadRef: RefObject<SVGPathElement | null>;
}) {
  const {
    howItWorksRef,
    linkRef,
    step1Ref,
    installRef,
    arrowRef,
    arrowPathRef,
    arrowHeadRef,
  } = args;

  const updateArrow = useCallback(() => {
    if (
      !linkRef.current ||
      !step1Ref.current ||
      !arrowRef.current ||
      !arrowPathRef.current ||
      !arrowHeadRef.current ||
      !howItWorksRef.current
    ) {
      return;
    }

    const containerRect = howItWorksRef.current.getBoundingClientRect();
    const source = linkRef.current.getBoundingClientRect();
    const defaultTarget = step1Ref.current.getBoundingClientRect();
    const installEl = installRef.current;
    const targetRect = installEl ? installEl.getBoundingClientRect() : defaultTarget;

    const startX = source.left - containerRect.left - 6;
    const startY = source.bottom - containerRect.top + 0.33;

    const endX = targetRect.left - containerRect.left;
    const endY = targetRect.top - containerRect.top + targetRect.height / 2;

    const dx = Math.abs(endX - startX);
    const cardLeft = targetRect.left;
    const screenMargin = 16;
    const available = Math.max(cardLeft - screenMargin, 0);
    const arc = available;
    const minX = Math.min(startX, endX) - arc;
    const minY = Math.min(startY, endY) - 20;
    const width = dx + arc * 2;
    const height = Math.abs(endY - startY) + 40;

    const svg = arrowRef.current;
    svg.style.left = `${minX}px`;
    svg.style.top = `${minY}px`;
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height}`);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const sx = startX - minX;
    const sy = startY - minY;
    const ex = endX - minX;
    const ey = endY - minY;

    const cx1 = 0;
    const cy1 = sy;
    const cx2 = 0;
    const cy2 = ey;
    arrowPathRef.current.setAttribute(
      "d",
      `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${ex} ${ey}`,
    );

    const angle = Math.atan2(ey - cy2, ex - cx2);
    const size = 16;
    const hx = ex;
    const hy = ey;
    const leftX = hx - size * Math.cos(angle - Math.PI / 6);
    const leftY = hy - size * Math.sin(angle - Math.PI / 6);
    const rightX = hx - size * Math.cos(angle + Math.PI / 6);
    const rightY = hy - size * Math.sin(angle + Math.PI / 6);
    arrowHeadRef.current.setAttribute(
      "d",
      `M ${hx} ${hy} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`,
    );
  }, [howItWorksRef, linkRef, step1Ref, installRef, arrowRef, arrowPathRef, arrowHeadRef]);

  useEffect(() => {
    updateArrow();

    let raf = 0;
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateArrow);
    };

    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    return () => {
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [updateArrow]);

  return updateArrow;
}
