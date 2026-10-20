import { THINKING_DOTS_CONTENT } from "@/config/content";

export function ThinkingDots() {
  // iOS-style typing indicator: three dots bouncing in sequence.
  // Custom keyframe gives a gentler arc than Tailwind's animate-bounce.
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      <style>{`
                @keyframes thinkingBounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
                    40% { transform: translateY(-0.25rem); opacity: 1; }
                }
            `}</style>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block rounded-full bg-primary"
          style={{
            width: "0.375rem",
            height: "0.375rem",
            animation: "thinkingBounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <span className="sr-only">{THINKING_DOTS_CONTENT.SR_LABEL}</span>
    </span>
  );
}
