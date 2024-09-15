import React from 'react';
import { PlayerHUD } from "../../components/viewer/PlayerHUD";
import { Timer } from "../../components/viewer/Timer";
import { useReplayStore } from "../../state/replayStoreReact";

export function HUD() {
  const replayData = useReplayStore((state) => state.replayData);
  const playerIndexes = replayData!.settings.playerSettings.filter(Boolean).map((playerSettings) => playerSettings.playerIndex);

  return (
    <>
      <Timer />
      {playerIndexes.map((playerIndex) => (
          <PlayerHUD key={playerIndex} player={playerIndex} />
      )
      )}
    </>
  );
}