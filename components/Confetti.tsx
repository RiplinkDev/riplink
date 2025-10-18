"use client";
import { useEffect, useMemo } from "react";

export default function Confetti({ fire }: { fire: boolean }) {
  const pieces = useMemo(() => Array.from({ length: 80 }, (_, i) => i), []);
  useEffect(() => { /* no-op, just client */ }, [fire]);
  if (!fire) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0">
        {pieces.map((i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 0.6;
          const dur = 2.4 + Math.random() * 0.9;
          const rot = Math.random() * 360;
          return (
            <span
              key={i}
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${dur}s`,
                transform: `rotate(${rot}deg)`,
              }}
              className="absolute -top-6 text-xl animate-[fall_linear_forwards]"
            >
              {["🎉","✨","🪙","💎","⭐","🎊"][i % 6]}
            </span>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
