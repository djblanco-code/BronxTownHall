import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Archivo";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";
import { Shot, ShotProps } from "./scenes/Shot";
import { Title } from "./scenes/Title";
import { End } from "./scenes/End";
import { C } from "./theme";

const display = loadDisplay("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;

const TITLE = 200;
const ENDF = 220;
const TRANSITION = 16;

type S = Omit<ShotProps, "display" | "body">;

const shots: S[] = [
  {
    shot: "home",
    step: "Step 1 · Home",
    title: "Open now, near you",
    lines: [
      "Search, ZIP, and voice input up top",
      "Five languages, one tap",
      "SOS is always one thumb away",
    ],
    panFrom: 0,
    panTo: -160,
    duration: 330,
  },
  {
    shot: "search",
    step: "Step 2 · Search",
    title: "Type it, or say it",
    lines: [
      "Typo-tolerant fuzzy matching",
      "Voice search for low-literacy users",
      "Filters: halal, kosher, language, access",
    ],
    panFrom: -40,
    panTo: -320,
    duration: 320,
    flip: true,
  },
  {
    shot: "detail",
    step: "Step 3 · Resource detail",
    title: "Everything you need to show up",
    lines: [
      "Hours, eligibility, languages spoken",
      "\u201CListen\u201D button reads it aloud",
      "Last verified date, in the open",
    ],
    panFrom: 0,
    panTo: -420,
    duration: 360,
  },
  {
    shot: "detail",
    step: "Step 4 · Act",
    title: "Call · Directions · Share · Report",
    lines: [
      "Tap-to-call and one-tap directions",
      "Share by text or WhatsApp",
      "Report a problem \u2014 fixes ship publicly",
    ],
    panFrom: -220,
    panTo: -640,
    duration: 320,
    flip: true,
  },
  {
    shot: "map",
    step: "Step 5 · Map & transit",
    title: "Which train gets you there",
    lines: [
      "Clustered pins across all 12 boards",
      "Subway and bus lines per listing",
      "Spreadsheet view for caseworkers",
    ],
    panFrom: 0,
    panTo: -140,
    duration: 300,
  },
  {
    shot: "civic",
    step: "Step 6 · Your voice",
    title: "Your board, precinct, and reps",
    lines: [
      "By ZIP, with meeting calendar export",
      "Pre-filled contact templates",
      "311 and HPD reporting built in",
    ],
    panFrom: -20,
    panTo: -380,
    duration: 300,
    flip: true,
  },
  {
    shot: "emergency",
    step: "Step 7 · Crisis",
    title: "Works when the network doesn't",
    lines: ["911 · 311 · 988 · NYC crisis lines", "Offline-ready page, tap to call"],
    panFrom: 0,
    panTo: -260,
    duration: 260,
  },
  {
    shot: "events",
    step: "Step 8 · Neighborhood",
    title: "Hyper-local events",
    lines: ["Community-submitted, moderated", "Calendar view and .ics export"],
    panFrom: 0,
    panTo: -260,
    duration: 240,
    flip: true,
  },
];

export const TOTAL =
  TITLE + ENDF + shots.reduce((a, s) => a + s.duration, 0) - TRANSITION * (shots.length + 1);

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const w = interpolate(frame, [0, durationInFrames], [0, 100]);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div style={{ height: 6, background: "rgba(255,255,255,0.10)" }}>
        <div
          style={{
            height: "100%",
            width: `${w}%`,
            background: `linear-gradient(90deg, ${C.red}, ${C.gold})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={TITLE}>
          <Title display={display} body={body} />
        </TransitionSeries.Sequence>
        {shots.map((s, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Transition
              presentation={fade()}
              timing={linearTiming({ durationInFrames: TRANSITION })}
            />
            <TransitionSeries.Sequence durationInFrames={s.duration}>
              <Shot {...s} display={display} body={body} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={ENDF}>
          <End display={display} body={body} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Progress />
    </AbsoluteFill>
  );
};
