import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Phone } from "../components/Phone";
import { Caption } from "../components/Caption";

export type ShotProps = {
  shot: string;
  step: string;
  title: string;
  lines: string[];
  panFrom?: number;
  panTo?: number;
  duration: number;
  flip?: boolean;
  display: string;
  body: string;
};

export const Shot: React.FC<ShotProps> = ({
  shot,
  step,
  title,
  lines,
  panFrom,
  panTo,
  duration,
  flip,
  display,
  body,
}) => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{
          flexDirection: flip ? "row-reverse" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 96,
          padding: "0 110px",
        }}
      >
        <Phone
          shot={shot}
          panFrom={panFrom}
          panTo={panTo}
          duration={duration}
          rotate={flip ? 2 : -2}
        />
        <Caption step={step} title={title} lines={lines} display={display} body={body} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
