import React from "react";
import { Img, staticFile, interpolate, useCurrentFrame } from "remotion";

export const Phone: React.FC<{
  shot: string;
  /** pan from -> to, in px of the inner image */
  panFrom?: number;
  panTo?: number;
  duration: number;
  zoom?: number;
  rotate?: number;
}> = ({ shot, panFrom = 0, panTo = -120, duration, zoom = 1, rotate = 0 }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, duration], [panFrom, panTo], {
    extrapolateRight: "clamp",
  });
  const enter = interpolate(frame, [0, 22], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const float = Math.sin(frame / 42) * 6;

  return (
    <div
      style={{
        width: 380,
        height: 780,
        borderRadius: 52,
        background: "#05101B",
        padding: 10,
        boxShadow: "0 60px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
        transform: `translateY(${float + (1 - enter) * 60}px) scale(${zoom * (0.96 + enter * 0.04)}) rotate(${rotate}deg)`,
        opacity: enter,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 44,
          overflow: "hidden",
          background: "#fff",
          position: "relative",
        }}
      >
        <Img
          src={staticFile(`shots/${shot}.png`)}
          style={{
            position: "absolute",
            top: y,
            left: 0,
            width: "100%",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};
