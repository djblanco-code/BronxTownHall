import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";

export const Caption: React.FC<{
  step: string;
  title: string;
  lines: string[];
  display: string;
  body: string;
}> = ({ step, title, lines, display, body }) => {
  const frame = useCurrentFrame();
  const app = (d: number) =>
    interpolate(frame, [d, d + 18], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <div style={{ maxWidth: 700, fontFamily: body }}>
      <div
        style={{
          opacity: app(4),
          transform: `translateX(${(1 - app(4)) * -24}px)`,
          display: "inline-block",
          padding: "8px 18px",
          borderRadius: 999,
          background: C.red,
          color: C.cream,
          fontSize: 20,
          letterSpacing: 3,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {step}
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: display,
          fontSize: 76,
          lineHeight: 1.02,
          color: C.cream,
          opacity: app(10),
          transform: `translateY(${(1 - app(10)) * 26}px)`,
        }}
      >
        {title}
      </div>
      {lines.map((l, i) => (
        <div
          key={l}
          style={{
            marginTop: 18,
            fontSize: 29,
            color: C.muted,
            opacity: app(24 + i * 10),
            transform: `translateY(${(1 - app(24 + i * 10)) * 16}px)`,
          }}
        >
          <span style={{ color: C.gold, marginRight: 12 }}>—</span>
          {l}
        </div>
      ))}
    </div>
  );
};
