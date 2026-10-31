"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";

type Field = "email" | "place" | "date" | "time" | "message";
type Status = "idle" | "sending" | "error";

const SUGGESTIONS = ["A quiet café", "Somewhere peaceful", "A nice restaurant", "A long walk", "Anywhere you like"];

const input =
  "w-full rounded-2xl border border-line bg-white/70 px-5 py-3.5 text-base text-ink shadow-sm outline-none transition placeholder:text-muted/70 focus:border-burgundy focus:bg-white focus:ring-4 focus:ring-burgundy/10 aria-[invalid=true]:border-burgundy/70";
const label = "mb-2 block text-sm font-medium text-burgundy-deep";

function Spinner() {
  return (
    <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function InviteForm({ onSent, onBack }: { onSent: (guestEmail: boolean) => void; onBack: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [place, setPlace] = useState("");
  // Today's date in her own time zone, filled in after mount so server and browser markup match.
  const [today, setToday] = useState<string | undefined>(undefined);
  const sending = useRef(false);
  // One key per attempt: a double-click or retry after a slow connection can never send two emails.
  const key = useRef<string | null>(null);

  useEffect(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending.current) return;
    sending.current = true;
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form) as Record<string, string>;

    setStatus("sending");
    setMessage("");
    setFieldErrors({});
    key.current ??= crypto.randomUUID();

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key.current },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        guestEmail?: boolean;
        error?: string;
        fields?: Partial<Record<Field, string>>;
      };

      // Only a confirmed success moves on to the thank-you screen.
      if (res.ok && body.ok) {
        onSent(body.guestEmail === true);
        return;
      }
      key.current = null; // a definite failure: the next try is a fresh attempt
      if (body.fields) setFieldErrors(body.fields);
      setMessage(body.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      // Unsure whether it arrived: keep the same key so a retry can't duplicate it.
      setMessage("I couldn't reach the server. Please check your connection and try again.");
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  const err = (f: Field) => fieldErrors[f];
  const describe = (f: Field) => (err(f) ? `${f}-error` : undefined);

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-14">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight text-burgundy-deep sm:text-5xl">
          Then let&apos;s make some time for us. ❤️
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-ink/80">
          I&apos;d love to spend some time with you. Let&apos;s figure out when and where.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate={false}
        className="mt-10 space-y-6 rounded-[2rem] border border-line bg-cream/70 p-6 shadow-[0_30px_80px_-40px_rgba(92,21,39,0.35)] backdrop-blur sm:p-9"
      >
        {/* Honeypot: invisible to people, tempting to bots. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Leave this empty
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div>
          <label htmlFor="email" className={label}>
            Your email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            inputMode="email"
            placeholder="Where can I reach you?"
            aria-invalid={!!err("email")}
            aria-describedby={describe("email")}
            className={input}
          />
          {err("email") && <p id="email-error" className="mt-2 text-sm text-burgundy">{err("email")}</p>}
        </div>

        <div>
          <label htmlFor="place" className={label}>
            Preferred place
          </label>
          <input
            id="place"
            name="place"
            type="text"
            required
            minLength={2}
            maxLength={120}
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Where would you like us to go?"
            aria-invalid={!!err("place")}
            aria-describedby={describe("place")}
            className={input}
          />
          {err("place") && <p id="place-error" className="mt-2 text-sm text-burgundy">{err("place")}</p>}
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Ideas">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPlace(s)}
                aria-pressed={place === s}
                className="touch-manipulation rounded-full border border-blush bg-blush-soft px-3.5 py-1.5 text-sm text-burgundy transition hover:border-burgundy/40 hover:bg-blush aria-pressed:border-burgundy aria-pressed:bg-burgundy aria-pressed:text-cream"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className={label}>
              Preferred date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              min={today}
              aria-invalid={!!err("date")}
              aria-describedby={describe("date")}
              className={`${input} min-h-[3.25rem] appearance-none`}
            />
            {err("date") && <p id="date-error" className="mt-2 text-sm text-burgundy">{err("date")}</p>}
          </div>
          <div>
            <label htmlFor="time" className={label}>
              Preferred time
            </label>
            <input
              id="time"
              name="time"
              type="time"
              required
              aria-invalid={!!err("time")}
              aria-describedby={describe("time")}
              className={`${input} min-h-[3.25rem] appearance-none`}
            />
            {err("time") && <p id="time-error" className="mt-2 text-sm text-burgundy">{err("time")}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="message" className={label}>
            Anything you&apos;d like to tell me? <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={1000}
            placeholder="Anything on your mind? You can tell me..."
            aria-describedby={describe("message")}
            className={`${input} resize-y`}
          />
        </div>

        <div aria-live="polite">
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="rounded-2xl border border-burgundy/20 bg-blush-soft px-4 py-3 text-sm text-burgundy-deep"
            >
              {message} Everything you wrote is still here. ❤️
            </motion.p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="flex w-full touch-manipulation items-center justify-center gap-3 rounded-full bg-burgundy px-8 py-4 text-base font-medium text-cream shadow-[0_10px_30px_-8px_rgba(122,31,51,0.55)] transition hover:-translate-y-0.5 hover:bg-burgundy-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy disabled:translate-y-0 disabled:cursor-wait disabled:opacity-80 sm:text-lg"
        >
          {status === "sending" ? (
            <>
              <Spinner /> Sending…
            </>
          ) : status === "error" ? (
            "Try again ❤️"
          ) : (
            "Send this little request ❤️"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          disabled={status === "sending"}
          className="text-sm text-muted underline-offset-4 transition hover:text-burgundy hover:underline disabled:opacity-50"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
