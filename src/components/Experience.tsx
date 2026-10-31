"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import FloatingHearts from "./FloatingHearts";
import InviteForm from "./InviteForm";
import Landing from "./Landing";
import Thanks from "./Thanks";

type Step = "ask" | "form" | "sent";

const screen = {
  initial: { opacity: 0, y: 24, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(6px)" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Experience() {
  const [step, setStep] = useState<Step>("ask");
  const [guestEmailed, setGuestEmailed] = useState(false);

  return (
    <>
      <FloatingHearts />
      <main className="relative flex min-h-dvh items-center justify-center pb-[env(safe-area-inset-bottom)]">
        <AnimatePresence mode="wait">
          <motion.div key={step} {...screen} className="w-full">
            {step === "ask" && <Landing onYes={() => setStep("form")} />}
            {step === "form" && (
              <InviteForm
                onSent={(emailed) => {
                  setGuestEmailed(emailed);
                  setStep("sent");
                }}
                onBack={() => setStep("ask")}
              />
            )}
            {step === "sent" && <Thanks emailed={guestEmailed} onRestart={() => setStep("ask")} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
