import { Resend } from "resend";
import { EMAIL_SUBJECT, GUEST_SUBJECT, renderEmail, renderGuestEmail } from "@/lib/email-template";
import { rateLimit } from "@/lib/rate-limit";
import { formatDate, formatTime, parseInvitation } from "@/lib/validate";

const MAX_BODY_BYTES = 8 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request) {
  // Only accept requests that come from this site's own pages.
  const origin = request.headers.get("origin");
  if (origin) {
    let sameSite = false;
    try {
      sameSite = new URL(origin).host === request.headers.get("host");
    } catch {}
    if (!sameSite) return json({ error: "Request not allowed." }, 403);
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const perVisitor = rateLimit(`ip:${ip}`, 8, 15 * 60_000);
  const overall = rateLimit("all", 60, 60 * 60_000);
  if (!perVisitor.allowed || !overall.allowed) {
    return json({ error: "That's a lot of tries. Please wait a little and try again." }, 429, {
      "Retry-After": String(Math.max(perVisitor.retryAfter, 1)),
    });
  }

  const idempotencyKey = request.headers.get("idempotency-key") ?? "";
  if (!UUID.test(idempotencyKey)) return json({ error: "Something went wrong. Please refresh and try again." }, 400);

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json({ error: "Could not read the request." }, 400);
  }
  if (raw.length > MAX_BODY_BYTES) return json({ error: "That message is a bit too long." }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Could not read the request." }, 400);
  }

  // Hidden field only bots fill in: pretend it worked and send nothing.
  if (body && typeof body === "object" && typeof (body as Record<string, unknown>).website === "string" && (body as Record<string, string>).website.trim() !== "") {
    return json({ ok: true });
  }

  const parsed = parseInvitation(body);
  if (!parsed.ok) return json({ error: "Please check the highlighted fields.", fields: parsed.errors }, 422);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.NOTIFICATION_EMAIL;
  if (!apiKey || !from || !to) {
    console.error("Email is not configured: set RESEND_API_KEY, RESEND_FROM_EMAIL and NOTIFICATION_EMAIL.");
    return json({ error: "Sending isn't set up yet. Please tell Misbah." }, 503);
  }

  const d = parsed.data;
  const submittedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date());

  const { html, text } = renderEmail({
    email: d.email,
    place: d.place,
    dateLabel: formatDate(d.date),
    timeLabel: formatTime(d.time),
    dress: d.dress,
    cuisine: d.cuisine,
    kiss: d.kiss,
    topics: d.topics,
    message: d.message,
    submittedAt: `${submittedAt} (Dhaka time)`,
  });

  const resend = new Resend(apiKey);
  const sender = `A Little Company <${from.replace(/^.*<|>$/g, "")}>`;

  // 1. The notification to Misbah is the one that must succeed.
  try {
    const { error } = await resend.emails.send(
      { from: sender, to: [to], replyTo: d.email, subject: EMAIL_SUBJECT, html, text },
      // The same key never sends twice, even if she double-clicks or retries after a slow response.
      { idempotencyKey },
    );
    if (error) {
      // Log only the error type, never what she wrote.
      console.error("Resend rejected the email:", error.name);
      return json({ error: "The message couldn't be sent just now. Please try again." }, 502);
    }
  } catch {
    console.error("Resend request failed.");
    return json({ error: "The message couldn't be sent just now. Please try again." }, 502);
  }

  // 2. A confirmation to her. Failing here never fails the request, because Misbah already has the details.
  //    Until a sending domain is verified in Resend, only the account owner can be emailed, so this is skipped.
  let guestEmail = false;
  try {
    const guest = renderGuestEmail({
      place: d.place,
      dateLabel: formatDate(d.date),
      timeLabel: formatTime(d.time),
      dress: d.dress,
      cuisine: d.cuisine,
      kiss: d.kiss,
      topics: d.topics,
      message: d.message,
    });
    const { error } = await resend.emails.send(
      { from: sender, to: [d.email], replyTo: to, subject: GUEST_SUBJECT, html: guest.html, text: guest.text },
      { idempotencyKey: `${idempotencyKey}-guest` },
    );
    if (error) console.warn("Confirmation to the guest was not sent:", error.name);
    else guestEmail = true;
  } catch {
    console.warn("Confirmation to the guest was not sent.");
  }

  return json({ ok: true, guestEmail });
}
