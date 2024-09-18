import { useReplayStore } from "../../state/replayStoreReact";
import { useCallback, useEffect, useState } from "react";

const ZOOM_LEVEL = 1;


export function Camera({children}: any) {
  const frame = useReplayStore((state) => state.frame);
  const replayData = useReplayStore((state) => state.replayData);

  const [center, setCenter] = useState<[number, number] | undefined>();
  const [scale, setScale] = useState<number | undefined>();


  useEffect(() => {
    const followSpeeds = [0.04, 0.04];
    const padding = [25, 25];
    const minimums = [100, 100];

    const currentFrame = replayData!.frames[frame];
    const focuses = currentFrame.players.filter(Boolean).map((player) => ({
      x: player.state.xPosition,
      y: player.state.yPosition,
    }));
    const xs = focuses.map(({ x }) => x);
    const ys = focuses.map(({ y }) => y);
    const xMin = Math.min(...xs) - padding[0];
    const xMax = Math.max(...xs) + padding[0];
    const yMin = Math.min(...ys) - padding[1];
    const yMax = Math.max(...ys) + padding[1];
    const newCenterX = (xMin + xMax) / 2;
    const newCenterY = (yMin + yMax) / 2;
    const xRange = Math.max(xMax - xMin, minimums[0]);
    const yRange = Math.max(yMax - yMin, minimums[1]);
    // scale both axes based on the most zoomed out one.
    const scaling = Math.min(640 / xRange, 480 / yRange);

    setCenter((oldCenter) => [
      smooth(oldCenter?.[0] ?? newCenterX, newCenterX, followSpeeds[0]),
      smooth(oldCenter?.[1] ?? newCenterY, newCenterY, followSpeeds[1]),
    ]);
    setScale(
      (oldScaling) =>
        ZOOM_LEVEL *
        smooth(oldScaling ?? 5, scaling, Math.max(...followSpeeds))
    );
  }, [frame, replayData]);

  const transforms = useCallback(() =>
    [
      `scale(${scale ?? 1})`,
      `translate(${(center?.[0] ?? 0) * -1}, ${(center?.[1] ?? 0) * -1})`,
    ].join(" ")
  , [center, scale]);

  return <g transform={transforms()}>{children}</g>;
}

function smooth(from: number, to: number, byPercent: number): number {
  return from + (to - from) * byPercent;
}
