import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { C } from "../theme";

const facts = ["30+ working modules", "5 languages", "Cloud backend + RLS", "WCAG 2.2 AA"];

export const End: React.FC<{ display: string; body: string }> = ({ display, body }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div
          style={{
            fontFamily: display,
            fontSize: 116,
            color: C.cream,
            transform: `scale(${0.9 + s * 0.1})`,
            opacity: s,
          }}
        >
          Built for the Bronx.
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: body,
            fontSize: 34,
            color: C.gold,
            opacity: interpolate(frame, [20, 44], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }),
          }}
        >
          Ready for operator handoff.
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 52 }}>
          {facts.map((f, i) => {
            const o = interpolate(frame, [40 + i * 9, 60 + i * 9], [0, 1], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            });
            return (
              <div
                key={f}
                style={{
                  fontFamily: body,
                  fontSize: 24,
                  color: C.cream,
                  padding: "14px 26px",
                  borderRadius: 999,
                  border: `1px solid rgba(246,239,230,0.28)`,
                  background: "rgba(255,255,255,0.05)",
                  opacity: o,
                  transform: `translateY(${(1 - o) * 18}px)`,
                }}
              >
                {f}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
