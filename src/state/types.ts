import {
  PlayerInputs,
  PlayerSettings,
  PlayerState,
  ReplayData,
} from "../common/types";
import { CharacterAnimations } from "../viewer/animationCache";
import { Character } from "../viewer/characters/character";


export interface ReplayStub {
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