import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-serif text-6xl text-burgundy">404</p>
        <h1 className="mt-4 font-serif text-3xl text-burgundy-deep">This page wandered off</h1>
        <p className="mt-3 text-ink/70">Let&apos;s go back to where we started.</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-burgundy px-7 py-3.5 text-base font-medium text-cream transition hover:bg-burgundy-deep"
        >
          Back to the beginning
        </Link>
      </div>
    </main>
  );
}
