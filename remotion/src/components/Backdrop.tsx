import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 160) * 60;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(140deg, ${C.bg} 0%, ${C.bg2} 60%, #0A1724 100%)` }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(700px 500px at ${420 + drift}px 220px, rgba(30,91,198,0.30), transparent 70%),
                       radial-gradient(600px 500px at ${1250 - drift}px 780px, rgba(200,16,46,0.22), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.07,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          transform: `translateY(${(frame % 80) * -1}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
