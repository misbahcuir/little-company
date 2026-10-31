import Heart from "./Heart";

// Deterministic values (no Math.random) so server and client render the same markup.
const HEARTS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 97,
  size: 10 + ((i * 7) % 16),
  duration: 18 + ((i * 5) % 14),
  delay: -((i * 3.7) % 26),
  opacity: 0.16 + ((i * 3) % 5) * 0.045,
  sway: 12 + ((i * 9) % 26),
  tone: i % 3 === 0 ? "text-burgundy" : "text-blush",
}));

export default function FloatingHearts() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {HEARTS.map((h, i) => (
        <Heart
          key={i}
          className={`heart-float ${h.tone}`}
          style={
            {
              left: `${h.left}%`,
              width: h.size,
              height: h.size,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
              "--heart-opacity": h.opacity,
              "--heart-sway": `${h.sway}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
