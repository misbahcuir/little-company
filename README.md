# A Little Company? ❤️

A small, personal invitation site. She sees a gentle question, taps **Yes**, fills in when and where,
and you get a beautifully formatted email through [Resend](https://resend.com).

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · Resend · Vercel
**No database, no stored submissions, no Gmail connection.** The form is validated, sent as an email, and forgotten.

## How it works

1. **Landing**: "Oindri, are you feeling a little low?" with a **Yes** button and a playfully evasive **No** button
   that hops to a random spot on screen (never off-screen, never onto Yes).
2. **Form**: email, place, date, time, optional dress code, cuisine and conversation topics (text fields with tappable ideas), a dropdown for where she'd like a kiss, and an optional message.
3. **API** `POST /api/send-email`: validates and sanitises on the server, then sends one email via Resend.
4. **Confirmation**: shown only after Resend has accepted the email. If sending fails she sees a friendly
   message and can retry.

The email goes to `NOTIFICATION_EMAIL`, with *Reply-To* set to her address, so you can answer her by simply replying.

## 1. Install

```bash
npm install
```

Needs Node.js 20.9 or newer.

## 2. Set up Resend (one time)

1. Create a free account at <https://resend.com>.
2. **Domains → Add Domain**, add a domain you own, and add the DNS records Resend shows. Wait until it says *Verified*.
   (Resend only sends from a verified domain. Their `onboarding@resend.dev` test sender can only deliver to the
   email address that owns the Resend account, which is handy for a first test.)
3. **API Keys → Create API Key** (permission: *Sending access*). Copy it.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable             | Meaning                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| `RESEND_API_KEY`     | Your Resend API key. Server-only, never exposed to the browser.                 |
| `RESEND_FROM_EMAIL`  | A sender on your verified domain, e.g. `notifications@yourdomain.com`.          |
| `NOTIFICATION_EMAIL` | Who receives the notification. Defaults to `misbah.rumman0@gmail.com` in the example. |

Gmail is only the **recipient**. The app never asks for your Gmail password, OAuth or SMTP access.

## 4. Run locally

```bash
npm run dev
```

Open <http://localhost:3000>. Production check:

```bash
npm run build && npm start
```

## 5. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On <https://vercel.com/new>, import the repository (framework is detected as Next.js; no settings to change).
3. Under **Settings → Environment Variables**, add `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `NOTIFICATION_EMAIL`
   for *Production* (and *Preview* if you want to test there).
4. Deploy. Your public URL looks like `https://your-project.vercel.app`; share that link.

Or from the terminal: `npx vercel`, then `npx vercel --prod`, and add the variables with `npx vercel env add`.

## Safety and privacy

- The API key lives only on the server and is never sent to the browser.
- Every field is validated on the server, control characters are stripped, and all text is HTML-escaped in the email.
- Nothing is saved. Submission contents are never logged.
- **Duplicate protection:** each attempt carries an idempotency key, so a double-click or a retry after a slow
  connection cannot send two emails. The button is also disabled while sending.
- **Spam protection:** a hidden honeypot field, a same-site check, a body-size limit, and an in-memory rate limit
  (8 attempts per visitor per 15 minutes, 60 per hour overall). On serverless hosting the counters are per warm
  instance and nothing is persisted, so it is best-effort rather than absolute.
- The page is marked `noindex` so search engines don't list it.

## Project layout

```
src/app/page.tsx                  entry point
src/app/api/send-email/route.ts   validation, rate limit, Resend
src/components/Experience.tsx      screen flow: ask → form → sent
src/components/Landing.tsx         question + Yes / evasive No
src/components/EvasiveButton.tsx   the dodging button (Framer Motion)
src/components/InviteForm.tsx      the invitation form
src/components/Thanks.tsx          confirmation screen
src/lib/validate.ts                server-side validation + sanitising
src/lib/email-template.ts          the HTML email
src/lib/rate-limit.ts              in-memory rate limiter
```
