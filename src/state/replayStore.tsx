import createRAF, { targetFPS } from "@solid-primitives/raf";
import { batch, createEffect, createResource } from "solid-js";
import { createStore } from "solid-js/store";
import {
  PlayerInputs,
  PlayerSettings,
  PlayerState,
  ReplayData,
} from "../common/types";
import { parseReplay } from "../parser/parser";
import { CharacterAnimations, fetchAnimations } from "../viewer/animationCache";
import { Character } from "../viewer/characters/character";

import { decode } from "@shelacek/ubjson";
import { computeRenderData, getReplayData, wrapFrame, createAnimationResource } from "./stateHelper";

// was handled in state
const FRAMES_PER_TICK = 1;

interface ReplayStub {
  fileName: string;
  playedOn: string;
  numFrames: number;
  stageId: number;
  isTeams: boolean;
  playerSettings: {
    playerIndex: number;
    connectCode: string;
    displayName: string;
    nametag: string;
    externalCharacterId: number;
    teamId: number;
  }[];
}

export interface RenderData {
  playerState: PlayerState;
  playerInputs: PlayerInputs;
  playerSettings: PlayerSettings;

  // main render
  path?: string;
  innerColor: string;
  outerColor: string;
  transforms: string[];

  // shield/shine renders
  animationName: string;
  characterData: Character;
}

export interface ReplayStore {
  // used in Controls, HUD, Item, Player, Stage, Timer, Viewer
  replayData?: ReplayData;
  // used in Controls, Stage, Timer
  frame: number;
  // used in Player, PlayerHUD
  renderDatas: RenderData[];
  // used in controls
  running: boolean;
  // used internally
  animations: (CharacterAnimations | undefined)[];
  fps: number;
  file?: File;
  stub?: ReplayStub;
}

export const defaultReplayStoreState: ReplayStore = {
  frame: 0,
  renderDatas: [],
  animations: Array(4).fill(undefined),
  fps: 60,
  running: false,
};

const [replayState, setReplayState] = createStore<ReplayStore>(
  defaultReplayStoreState
);

export const replayStore = replayState;

export async function load(file: File): Promise<void> {
  const goodFileAndSetting = await getReplayData(file);
  if (goodFileAndSetting === undefined) return
  // Save results to the store
  batch(() => {
    setReplayState(
      "stub",
      goodFileAndSetting.stub
    );
    setReplayState(
      "file",
      goodFileAndSetting.file
    );
  });
}

export function togglePause(): void {
  running() ? stop() : start();
}

export function jump(target: number): void {
  setReplayState("frame", wrapFrame(replayState, target));
}

const [running, start, stop] = createRAF(
  targetFPS(
    () =>
      setReplayState("frame", (f) =>
        wrapFrame(replayState, f + FRAMES_PER_TICK)
      ),
    () => replayState.fps
  )
);
createEffect(() => setReplayState("running", running()));

createEffect(async () => {
  const selected: [File, ReplayStub] = [replayState.file!, replayState.stub!];
  if (selected === undefined) {
    setReplayState(defaultReplayStoreState);
    return;
  }

  const replayData = parseReplay(
    decode(await selected[0].arrayBuffer(), { useTypedArrays: true })
  );

  setReplayState({
    replayData,
    frame: 0,
    renderDatas: [],
  });
  start();
});

// -----------------------------------------------

// These two blocks of code deal with fetching the character animations
// and updating whenever new characters are loaded in the replay

// For the react conversion, we can instead treat this as a prop/externally provided data


const animationResources = [];
// get characterid for each player
// then fetch all animations for that character
for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
  animationResources.push(
    createResource(
      createAnimationResource(replayState, playerIndex),
      (id) => (id === undefined ? undefined : fetchAnimations(id))
    )
  );
}

animationResources.forEach(([dataSignal], playerIndex) =>
  createEffect(() =>
    // I can't use the obvious setReplayState("animations", playerIndex,
    // dataSignal()) because it will merge into the previous animations data
    // object, essentially overwriting the previous characters animation data
    // forever
    setReplayState("animations", (animations) => {
      const newAnimations = [...animations];
      newAnimations[playerIndex] = dataSignal();
      return newAnimations;
    })
  )
);

// -----------------------------------------------
// This effect is responsible for computing the render data for each player on the current frame.
// It will loop through all the players on the current frame and compute their render data.
// If a player has a Nana, it will compute the render data for the nana as well.
// The render data is then stored in the replayState.renderDatas array.
// The effect will run every time the replayState.frame property changes.
// createEffect(() => {
//   if (replayState.replayData === undefined) {
//     return;
//   }
//   setReplayState(
//     "renderDatas",
//     replayState.replayData.frames[replayState.frame].players
//       .filter((playerUpdate) => playerUpdate)
//       .flatMap((playerUpdate) => {
//         const animations = replayState.animations[playerUpdate.playerIndex];
//         if (animations === undefined) return [];
//         const renderDatas = [];
//         renderDatas.push(
//           computeRenderData(replayState, playerUpdate, animations, false)
//         );
//         if (playerUpdate.nanaState != null) {
//           renderDatas.push(
//             computeRenderData(replayState, playerUpdate, animations, true)
//           );
//         }
//         return renderDatas;
//       })
//   );
// });
