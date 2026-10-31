import { KISSES } from "./options";

export type Invitation = {
  email: string;
  place: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  dress: string; // optional free text: "" when left blank
  cuisine: string;
  kiss: string; // optional: one of KISSES, or ""
  topics: string; // optional free text
  message: string;
};

export type ValidationResult =
  | { ok: true; data: Invitation }
  | { ok: false; errors: Partial<Record<keyof Invitation, string>> };

// Everything except tab/newline is a control character: drop it so it can't smuggle markup or headers.
const CONTROL = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F\\u2028\\u2029]", "g");

function clean(value: unknown, max: number, multiline = false): string {
  if (typeof value !== "string") return "";
  let v = value.normalize("NFKC").replace(CONTROL, "").replace(/\r\n?/g, "\n");
  v = multiline ? v.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : v.replace(/\s+/g, " ");
  return v.trim().slice(0, max);
}

const EMAIL = /^[^\s@<>"'`,;:()[\]\\]+@[^\s@<>"'`,;:()[\]\\]+\.[^\s@<>"'`,;:()[\]\\]{2,}$/;

export function parseInvitation(raw: unknown): ValidationResult {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: Partial<Record<keyof Invitation, string>> = {};

  const email = clean(body.email, 254).toLowerCase();
  if (!EMAIL.test(email)) errors.email = "Please enter a valid email address.";

  const place = clean(body.place, 120);
  if (place.length < 2) errors.place = "Tell me where you'd like to go.";

  const date = clean(body.date, 10);
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!parts) {
    errors.date = "Please pick a date.";
  } else {
    const [y, m, d] = parts.slice(1).map(Number);
    const picked = Date.UTC(y, m - 1, d);
    const real = new Date(picked);
    const valid = real.getUTCFullYear() === y && real.getUTCMonth() === m - 1 && real.getUTCDate() === d;
    // One day of slack so every time zone can pick "today".
    const earliest = Date.now() - 24 * 60 * 60 * 1000;
    const latest = Date.now() + 2 * 365 * 24 * 60 * 60 * 1000;
    if (!valid) errors.date = "That date doesn't look right.";
    else if (picked < earliest - (earliest % 86_400_000)) errors.date = "Let's pick a day that hasn't passed yet.";
    else if (picked > latest) errors.date = "That's a little too far away.";
  }

  const time = clean(body.time, 5);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) errors.time = "Please pick a time.";

  // Optional free-text answers (ideas are only suggestions in the form).
  const dress = clean(body.dress, 120);
  const cuisine = clean(body.cuisine, 120);
  const topics = clean(body.topics, 300);

  // The kiss question is the only dropdown: empty is fine, anything else must be one of the offered choices.
  let kiss = clean(body.kiss, 60);
  if (kiss !== "" && !(KISSES as readonly string[]).includes(kiss)) {
    errors.kiss = "Please choose one of the options.";
    kiss = "";
  }

  const message = clean(body.message, 1000, true);

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { email, place, date, time, dress, cuisine, kiss, topics, message } };
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function formatTime(time: string): string {
  const [h, min] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(min).padStart(2, "0")} ${suffix}`;
}
