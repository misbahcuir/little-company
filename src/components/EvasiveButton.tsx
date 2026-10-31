"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type Props = {
  /** The Yes button: the No button never lands on top of it. */
  avoidRef: RefObject<HTMLElement | null>;
  /** Called every time it dodges, with how many times so far. */
  onDodge?: (count: number) => void;
  children: React.ReactNode;
};

const EDGE = 12; // keep this far from the screen edges
const YES_GAP = 28; // keep this far from the Yes button

type Box = { left: number; top: number; width: number; height: number };

const overlaps = (a: Box, b: Box, gap = 0) =>
  a.left < b.left + b.width + gap && a.left + a.width + gap > b.left && a.top < b.top + b.height + gap && a.top + a.height + gap > b.top;

export default function EvasiveButton({ avoidRef, onDodge, children }: Props) {
  const reduce = useReducedMotion();
  const homeRef = useRef<HTMLSpanElement>(null); // invisible placeholder that keeps the layout steady
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Where the button has been sent, in viewport coordinates (null = still at home).
  const target = useRef<{ left: number; top: number } | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const count = useRef(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const viewport = () => {
    const vv = window.visualViewport;
    return { width: vv?.width ?? window.innerWidth, height: vv?.height ?? window.innerHeight };
  };

  const toOffset = useCallback((left: number, top: number) => {
    const home = homeRef.current?.getBoundingClientRect();
    if (!home) return { x: 0, y: 0 };
    return { x: left - home.left, y: top - home.top };
  }, []);

  const dodge = useCallback(() => {
    const button = buttonRef.current?.getBoundingClientRect();
    const home = homeRef.current?.getBoundingClientRect();
    if (!button || !home) return;

    const { width: vw, height: vh } = viewport();
    const yesRect = avoidRef.current?.getBoundingClientRect();
    const yes: Box | null = yesRect ? { left: yesRect.left, top: yesRect.top, width: yesRect.width, height: yesRect.height } : null;
    const w = button.width;
    const h = button.height;

    const maxLeft = Math.max(EDGE, vw - w - EDGE);
    const maxTop = Math.max(EDGE, vh - h - EDGE);
    const current = target.current ?? { left: home.left, top: home.top };
    const minTravel = Math.min(vw, vh) * 0.28;

    const fits = (left: number, top: number) => {
      const box: Box = { left, top, width: w, height: h };
      if (yes && overlaps(box, yes, YES_GAP)) return false;
      // Never land under her finger or cursor.
      if (pointer.current) {
        const { x, y } = pointer.current;
        if (overlaps(box, { left: x - 28, top: y - 28, width: 56, height: 56 })) return false;
      }
      return true;
    };

    let next: { left: number; top: number } | null = null;
    for (let i = 0; i < 60 && !next; i++) {
      const left = EDGE + Math.random() * (maxLeft - EDGE);
      const top = EDGE + Math.random() * (maxTop - EDGE);
      const far = Math.hypot(left - current.left, top - current.top) >= minTravel || i > 40;
      if (far && fits(left, top)) next = { left, top };
    }
    if (!next) {
      // Tiny screen: try the four corners, and take the first free one.
      const corners = [
        { left: EDGE, top: EDGE },
        { left: maxLeft, top: EDGE },
        { left: EDGE, top: maxTop },
        { left: maxLeft, top: maxTop },
      ];
      next = corners.find((c) => fits(c.left, c.top)) ?? corners[0];
    }

    target.current = next;
    setOffset(toOffset(next.left, next.top));
    count.current += 1;
    onDodge?.(count.current);
  }, [avoidRef, onDodge, toOffset]);

  // Keep it on screen if the window is resized or the phone is rotated.
  useEffect(() => {
    const onResize = () => {
      const t = target.current;
      if (!t) return;
      const button = buttonRef.current?.getBoundingClientRect();
      if (!button) return;
      const { width: vw, height: vh } = viewport();
      const left = Math.min(Math.max(EDGE, t.left), Math.max(EDGE, vw - button.width - EDGE));
      const top = Math.min(Math.max(EDGE, t.top), Math.max(EDGE, vh - button.height - EDGE));
      target.current = { left, top };
      setOffset(toOffset(left, top));
    };
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [toOffset]);

  return (
    <span ref={homeRef} className="relative inline-flex">
      <motion.button
        ref={buttonRef}
        type="button"
        // Mouse and pen dodge as soon as they come near; touches dodge on first contact.
        onPointerEnter={(e) => {
          if (e.pointerType === "touch") return;
          pointer.current = { x: e.clientX, y: e.clientY };
          dodge();
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          pointer.current = { x: e.clientX, y: e.clientY };
          dodge();
        }}
        // Keyboard activation also dodges, and can never reach the Yes action.
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.detail === 0) pointer.current = null;
          dodge();
        }}
        animate={{ x: offset.x, y: offset.y }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 26, mass: 0.7 }}
        className="relative z-30 touch-manipulation select-none rounded-full border border-burgundy/25 bg-cream/80 px-7 py-3.5 text-base font-medium text-burgundy shadow-sm backdrop-blur transition-colors hover:bg-blush-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
      >
        {children}
      </motion.button>
    </span>
  );
}
