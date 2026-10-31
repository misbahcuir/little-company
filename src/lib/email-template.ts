// Self-contained on purpose (no imports) so it can be rendered and previewed on its own.

export type EmailDetails = {
  email: string;
  place: string;
  dateLabel: string;
  timeLabel: string;
  dress: string;
  cuisine: string;
  kiss: string;
  topics: string;
  message: string;
  submittedAt: string;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const EMAIL_SUBJECT = "Someone would like a little company ❤️";

const CLOSING = [
  "Misbah, someone is making a little space for you in their day.",
  "She might want a coffee, a quiet walk, a long conversation, or simply your presence.",
  "Whatever she needs, perhaps the most important thing is that you show up.",
  "Don't forget to make her smile. ❤️",
];

const CREAM = "#f7efe4";
const CARD = "#fffaf4";
const BLUSH = "#f1d9d6";
const BLUSH_SOFT = "#f8ebe8";
const BURGUNDY = "#7a1f33";
const INK = "#3a2a2d";
const MUTED = "#8a7377";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

function row(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding:0 0 14px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BLUSH_SOFT};border-radius:14px;">
          <tr>
            <td style="padding:16px 20px;">
              <div style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};padding-bottom:6px;">${label}</div>
              <div style="font-family:${SERIF};font-size:20px;line-height:1.35;color:${INK};word-break:break-word;">${valueHtml}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

export function renderEmail(d: EmailDetails): { html: string; text: string } {
  const e = {
    email: escapeHtml(d.email),
    place: escapeHtml(d.place),
    date: escapeHtml(d.dateLabel),
    time: escapeHtml(d.timeLabel),
    at: escapeHtml(d.submittedAt),
    message: escapeHtml(d.message).replace(/\n/g, "<br>"),
  };

  const messageBlock = d.message
    ? row("In her words", `<span style="font-style:italic;">&ldquo;${e.message}&rdquo;</span>`)
    : "";
  // Only the choices she actually made are shown.
  const extras = (dressLabel: string, cuisineLabel: string, kissLabel: string) =>
    [
      d.dress && row(dressLabel, escapeHtml(d.dress)),
      d.cuisine && row(cuisineLabel, escapeHtml(d.cuisine)),
      d.kiss && row(kissLabel, escapeHtml(d.kiss)),
      d.topics && row("Topics she'd like to talk about", escapeHtml(d.topics)),
    ]
      .filter(Boolean)
      .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${escapeHtml(EMAIL_SUBJECT)}</title>
<style>
  @media only screen and (max-width:600px) {
    .wrap { padding:16px 10px !important; }
    .pad { padding-left:20px !important; padding-right:20px !important; }
    .title { font-size:28px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">She said yes to a little company. Here are the details.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
  <tr>
    <td align="center" class="wrap" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${CARD};border-radius:22px;border:1px solid ${BLUSH};overflow:hidden;">
        <tr>
          <td align="center" class="pad" style="background:${BURGUNDY};padding:36px 32px 30px 32px;">
            <div style="font-size:26px;line-height:1;color:${BLUSH};">&#10084;</div>
            <div class="title" style="font-family:${SERIF};font-size:32px;line-height:1.2;color:#fff7ee;padding-top:12px;">Someone would like<br>a little company</div>
            <div style="font-family:${SANS};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${BLUSH};padding-top:14px;">Invitation details</div>
          </td>
        </tr>
        <tr>
          <td class="pad" style="padding:30px 32px 6px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${row("Where to reach her", `<a href="mailto:${e.email}" style="color:${BURGUNDY};text-decoration:none;">${e.email}</a>`)}
              ${row("Where she'd like to go", e.place)}
              ${row("Date", e.date)}
              ${row("Time", e.time)}
              ${extras("Dress code", "Craving", "Where she'd like a kiss")}
              ${messageBlock}
            </table>
          </td>
        </tr>
        <tr>
          <td class="pad" align="center" style="padding:6px 32px 26px 32px;">
            <div style="font-family:${SANS};font-size:12px;color:${MUTED};">Sent ${e.at}</div>
          </td>
        </tr>
        <tr>
          <td class="pad" style="padding:0 32px 34px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BLUSH};border-radius:16px;">
              <tr>
                <td style="padding:26px 24px;font-family:${SERIF};font-size:17px;line-height:1.7;color:${BURGUNDY};text-align:center;">
                  ${CLOSING.map((l) => escapeHtml(l)).join("<br><br>")}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="font-family:${SANS};font-size:11px;color:${MUTED};padding-top:16px;">Reply to this email to answer her directly.</div>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    "SOMEONE WOULD LIKE A LITTLE COMPANY",
    "",
    `Where to reach her: ${d.email}`,
    `Where she'd like to go: ${d.place}`,
    `Date: ${d.dateLabel}`,
    `Time: ${d.timeLabel}`,
    d.dress ? `Dress code: ${d.dress}` : "",
    d.cuisine ? `Craving: ${d.cuisine}` : "",
    d.kiss ? `Where she'd like a kiss: ${d.kiss}` : "",
    d.topics ? `Topics she'd like to talk about: ${d.topics}` : "",
    d.message ? `In her words: "${d.message}"` : "",
    "",
    `Sent ${d.submittedAt}`,
    "",
    ...CLOSING.flatMap((l) => [l, ""]),
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");

  return { html, text };
}

// ---------------------------------------------------------------------------
// The confirmation that goes to her, with the plan and a personal note from Misbah.
// ---------------------------------------------------------------------------

export const GUEST_SUBJECT = "Our little plan ❤️";

const GUEST_NOTE = [
  "Whatever your day has been, you don't have to carry it alone.",
  "When we meet there's nothing to fix and nothing to prove. Just a little company, a little quiet, and all the time you need.",
  "Until then, be gentle with yourself. Drink some water, take a breath, and know that someone is looking forward to seeing you.",
];

export function renderGuestEmail(d: Omit<EmailDetails, "email" | "submittedAt">): { html: string; text: string } {
  const e = {
    place: escapeHtml(d.place),
    date: escapeHtml(d.dateLabel),
    time: escapeHtml(d.timeLabel),
    message: escapeHtml(d.message).replace(/\n/g, "<br>"),
  };
  const extras = [
    d.dress && row("What we'll wear", escapeHtml(d.dress)),
    d.cuisine && row("What we'll eat", escapeHtml(d.cuisine)),
    d.kiss && row("And a little kiss", escapeHtml(d.kiss)),
    d.topics && row("What we'll talk about", escapeHtml(d.topics)),
  ]
    .filter(Boolean)
    .join("");
  const messageBlock = d.message ? row("What you told me", `<span style="font-style:italic;">&ldquo;${e.message}&rdquo;</span>`) : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${escapeHtml(GUEST_SUBJECT)}</title>
<style>
  @media only screen and (max-width:600px) {
    .wrap { padding:16px 10px !important; }
    .pad { padding-left:20px !important; padding-right:20px !important; }
    .title { font-size:28px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">I'll make sure to save this little moment for us.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
  <tr>
    <td align="center" class="wrap" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${CARD};border-radius:22px;border:1px solid ${BLUSH};overflow:hidden;">
        <tr>
          <td align="center" class="pad" style="background:${BURGUNDY};padding:36px 32px 30px 32px;">
            <div style="font-size:26px;line-height:1;color:${BLUSH};">&#10084;</div>
            <div class="title" style="font-family:${SERIF};font-size:32px;line-height:1.2;color:#fff7ee;padding-top:12px;">It&rsquo;s a date!<br>Well, almost.</div>
            <div style="font-family:${SANS};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${BLUSH};padding-top:14px;">Our little plan</div>
          </td>
        </tr>
        <tr>
          <td class="pad" style="padding:30px 32px 8px 32px;">
            <div style="font-family:${SERIF};font-size:19px;line-height:1.65;color:${INK};padding-bottom:22px;">
              Thank you for letting me know. I&rsquo;ll make sure to save this little moment for us.
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${row("Where", e.place)}
              ${row("Date", e.date)}
              ${row("Time", e.time)}
              ${extras}
              ${messageBlock}
            </table>
          </td>
        </tr>
        <tr>
          <td class="pad" style="padding:8px 32px 34px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BLUSH};border-radius:16px;">
              <tr>
                <td style="padding:26px 24px;font-family:${SERIF};font-size:17px;line-height:1.7;color:${BURGUNDY};text-align:center;">
                  ${GUEST_NOTE.map((l) => escapeHtml(l)).join("<br><br>")}
                  <br><br>
                  <span style="font-style:italic;">With all my care,<br>Misbah &#10084;</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="font-family:${SANS};font-size:11px;color:${MUTED};padding-top:16px;">If anything changes, just reply to this email.</div>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    "IT'S A DATE! WELL, ALMOST. ❤️",
    "",
    "Thank you for letting me know. I'll make sure to save this little moment for us.",
    "",
    `Where: ${d.place}`,
    `Date: ${d.dateLabel}`,
    `Time: ${d.timeLabel}`,
    d.dress ? `What we'll wear: ${d.dress}` : "",
    d.cuisine ? `What we'll eat: ${d.cuisine}` : "",
    d.kiss ? `And a little kiss: ${d.kiss}` : "",
    d.topics ? `What we'll talk about: ${d.topics}` : "",
    d.message ? `What you told me: "${d.message}"` : "",
    "",
    ...GUEST_NOTE.flatMap((l) => [l, ""]),
    "With all my care,",
    "Misbah ❤️",
    "",
    "If anything changes, just reply to this email.",
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");

  return { html, text };
}
