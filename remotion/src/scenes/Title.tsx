import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { C } from "../theme";

export const Title: React.FC<{ display: string; body: string }> = ({ display, body }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const wipe = interpolate(frame, [8, 44], [100, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const sub = interpolate(frame, [40, 66], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const bar = interpolate(frame, [58, 96], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 140px" }}>
        <div
          style={{
            fontFamily: body,
            color: C.gold,
            letterSpacing: 8,
            fontSize: 24,
            fontWeight: 700,
            opacity: s,
            transform: `translateY(${(1 - s) * 20}px)`,
          }}
        >
          90-SECOND WALKTHROUGH
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: display,
            fontSize: 148,
            lineHeight: 0.98,
            color: C.cream,
            clipPath: `inset(0 ${wipe}% 0 0)`,
          }}
        >
          The Bronx App
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: body,
            fontSize: 38,
            color: C.muted,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 18}px)`,
          }}
        >
          Every Bronx resource, event, and civic contact — in one place.
        </div>
        <div
          style={{
            marginTop: 44,
            height: 8,
            width: `${bar * 46}%`,
            background: `linear-gradient(90deg, ${C.red}, ${C.blue})`,
            borderRadius: 8,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
