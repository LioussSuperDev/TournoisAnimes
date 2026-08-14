"use client";

import { useEffect, useRef, useState } from "react";

export interface WheelSegmentDisplay {
  endingId: string;
  label: string;
  color: string;
}

function contrastTextColor(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}

export function Wheel({
  segments,
  winnerIndex,
  spinToken,
  size = 520,
  onSpinEnd,
}: {
  segments: WheelSegmentDisplay[];
  winnerIndex: number;
  spinToken: string | number;
  size?: number;
  onSpinEnd?: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const rotationRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastToken = useRef<typeof spinToken | null>(null);

  const n = segments.length;
  const anglePer = n > 0 ? 360 / n : 0;
  const radius = size / 2;

  useEffect(() => {
    if (n === 0 || spinToken == null) return;
    if (lastToken.current === spinToken) return;
    lastToken.current = spinToken;

    setSpinning(true);
    audioRef.current?.play().catch(() => {});

    const jitter = (Math.random() - 0.5) * anglePer * 0.6;
    const targetSegmentAngle = winnerIndex * anglePer + anglePer / 2 + jitter;

    const current = rotationRef.current;
    const prevMod = ((current % 360) + 360) % 360;
    const targetMod = ((-targetSegmentAngle % 360) + 360) % 360;
    const delta = ((targetMod - prevMod) + 360) % 360;
    const extraSpins = 6 + Math.floor(Math.random() * 3);
    const newRotation = current + extraSpins * 360 + delta;

    rotationRef.current = newRotation;
    setRotation(newRotation);

    const timeout = setTimeout(() => {
      setSpinning(false);
      onSpinEnd?.();
    }, 5200);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinToken, n]);

  if (n === 0) return null;

  const cx = radius;
  const cy = radius;
  const r = radius - 8;

  function point(angleDeg: number, rad: number) {
    const rad0 = (angleDeg * Math.PI) / 180;
    return { x: cx + rad * Math.sin(rad0), y: cy - rad * Math.cos(rad0) };
  }

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <audio ref={audioRef} src="/audio/wheel-spin.mp3" preload="auto" />

      <div
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{ top: -14 }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "16px solid transparent",
            borderRight: "16px solid transparent",
            borderTop: "28px solid var(--accent-2)",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          }}
        />
      </div>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? "transform 5.2s cubic-bezier(0.12,0.67,0.1,1)" : undefined,
        }}
        className="drop-shadow-[0_0_40px_rgba(168,85,247,0.25)]"
      >
        <circle cx={cx} cy={cy} r={r + 6} fill="var(--surface-2)" stroke="var(--border)" strokeWidth={2} />
        {segments.map((seg, i) => {
          const startAngle = i * anglePer;
          const endAngle = (i + 1) * anglePer;
          const p1 = point(startAngle, r);
          const p2 = point(endAngle, r);
          const largeArc = anglePer > 180 ? 1 : 0;
          const d = `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;

          const midAngle = startAngle + anglePer / 2;
          const textRadius = r * 0.62;
          const tp = point(midAngle, textRadius);
          let textRot = midAngle;
          if (textRot > 90 && textRot < 270) textRot += 180;

          const fontSize = Math.max(10, Math.min(16, 220 / Math.max(n, 4)));

          return (
            <g key={seg.endingId + i}>
              <path d={d} fill={seg.color} stroke="var(--surface)" strokeWidth={2} />
              <text
                x={tp.x}
                y={tp.y}
                fill={contrastTextColor(seg.color)}
                fontSize={fontSize}
                fontWeight={700}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textRot} ${tp.x} ${tp.y})`}
              >
                {seg.label}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={r * 0.12} fill="var(--surface)" stroke="var(--accent-2)" strokeWidth={3} />
      </svg>
    </div>
  );
}
