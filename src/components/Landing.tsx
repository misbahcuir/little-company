"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import EvasiveButton from "./EvasiveButton";
import Heart from "./Heart";

const TEASES = [
  "",
  "Hehe, it's shy. 🙈",
  "Still trying? I admire that.",
  "That one really doesn't want to be pressed.",
  "Okay, you're persistent.",
  "I'm right here, you know. ❤️",
  "The other button is much friendlier…",
  "Alright, I'll stop. Almost. ❤️",
];

export default function Landing({ onYes }: { onYes: () => void }) {
  const yesRef = useRef<HTMLButtonElement>(null);
  const [dodges, setDodges] = useState(0);
  const handleDodge = useCallback((n: number) => setDodges(n), []);
  const tease = dodges === 0 ? "" : TEASES[Math.min(dodges, TEASES.length - 1)];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 160, damping: 14 }}
        className="mb-8 text-burgundy"
      >
        <motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="block">
          <Heart className="size-9" />
        </motion.span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-burgundy-deep sm:text-6xl md:text-7xl"
      >
        Hey, are you feeling a little low?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-6 max-w-md text-lg leading-relaxed text-ink/80 sm:text-xl"
      >
        Sometimes, we don&apos;t need solutions. We just need a little company. And I&apos;d love to be there for you.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-10 font-serif text-2xl italic text-burgundy sm:text-3xl"
      >
        Would you like some company?
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
        className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
      >
        <button
          ref={yesRef}
          type="button"
          onClick={onYes}
          className="touch-manipulation rounded-full bg-burgundy px-8 py-4 text-base font-medium text-cream shadow-[0_10px_30px_-8px_rgba(122,31,51,0.55)] transition hover:-translate-y-0.5 hover:bg-burgundy-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy sm:text-lg"
        >
          ❤️ Yes, I&apos;d love that!
        </button>
        <EvasiveButton avoidRef={yesRef} onDodge={handleDodge}>
          No, I&apos;m okay.
        </EvasiveButton>
      </motion.div>

      {/* Reserved height so the playful lines never shift the layout. */}
      <div className="mt-8 h-6" aria-live="polite">
        <AnimatePresence mode="wait">
          {tease && (
            <motion.p
              key={tease}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted"
            >
              {tease}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
