"use client";

import { motion, useReducedMotion } from "framer-motion";
import Heart from "./Heart";

export default function Thanks({ onRestart, emailed }: { onRestart: () => void; emailed: boolean }) {
  const reduce = useReducedMotion();
  // A few small hearts that rise once from the big one.
  const rising = [-70, -35, 0, 35, 70];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-16 text-center">
      <div className="relative mb-10 grid size-40 place-items-center">
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute inset-0 rounded-full border border-burgundy/30"
            initial={{ scale: 0.5, opacity: 0.7 }}
            animate={reduce ? { opacity: 0 } : { scale: 1.6, opacity: 0 }}
            transition={{ duration: 2.6, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
          />
        ))}
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.1 }}
          className="relative text-burgundy"
        >
          <motion.span
            animate={reduce ? undefined : { scale: [1, 1.1, 1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="block drop-shadow-[0_12px_24px_rgba(122,31,51,0.35)]"
          >
            <Heart className="size-24" />
          </motion.span>
        </motion.div>
        {!reduce &&
          rising.map((x, i) => (
            <motion.span
              key={x}
              aria-hidden
              className="absolute text-blush"
              initial={{ y: 0, x: 0, opacity: 0, scale: 0.4 }}
              animate={{ y: -110 - (i % 3) * 18, x, opacity: [0, 1, 0], scale: 1 }}
              transition={{ duration: 2.2, delay: 0.5 + i * 0.12, ease: "easeOut" }}
            >
              <Heart className="size-4" />
            </motion.span>
          ))}
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="font-serif text-4xl font-medium leading-tight tracking-tight text-burgundy-deep sm:text-5xl"
      >
        It&apos;s a date! Well, almost. ❤️
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.8 }}
        className="mt-5 max-w-md text-lg leading-relaxed text-ink/80"
      >
        Thank you for letting me know. I&apos;ll make sure to save this little moment for us. Looking forward to seeing you.
      </motion.p>

      {emailed && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.7 }}
          className="mt-5 max-w-sm rounded-full border border-blush bg-blush-soft px-5 py-2.5 text-sm text-burgundy"
        >
          I&apos;ve sent a little note to your inbox too. ❤️
        </motion.p>
      )}

      <motion.button
        type="button"
        onClick={onRestart}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-10 touch-manipulation rounded-full border border-burgundy/30 bg-cream/70 px-7 py-3.5 text-base font-medium text-burgundy transition hover:bg-blush-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
      >
        Back to the beginning
      </motion.button>
    </div>
  );
}
