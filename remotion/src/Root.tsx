import { Composition } from "remotion";
import { MainVideo, TOTAL } from "./MainVideo";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={TOTAL}
    fps={30}
    width={1600}
    height={900}
  />
);
