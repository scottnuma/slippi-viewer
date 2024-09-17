import { decode } from "@shelacek/ubjson";
import { actionNameById, characterNameByExternalId, characterNameByInternalId, stageNameByExternalId } from "../common/ids";
import { PlayerUpdate, PlayerUpdateWithNana, PlayerState, GameSettings, ReplayData } from "../common/types";
import { parseGameSettings } from "../parser/parser";
import { CharacterAnimations } from "../viewer/animationCache";
import { actionMapByInternalId } from "../viewer/characters";
import { getPlayerOnFrame, getStartOfAction } from "../viewer/viewerUtil";
import { ReplayStore, RenderData } from "./types";
import colors from "tailwindcss/colors";

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


export function computeRenderData(
    replayData: ReplayData,
    playerUpdate: PlayerUpdate,
    animations: CharacterAnimations,
    isNana: boolean
): RenderData {
    const playerState = (playerUpdate as PlayerUpdateWithNana)[
        isNana ? "nanaState" : "state"
    ];
    const playerInputs = (playerUpdate as PlayerUpdateWithNana)[
        isNana ? "nanaInputs" : "inputs"
    ];
    const playerSettings = replayData!.settings.playerSettings.filter(Boolean)
        .find((settings) => settings.playerIndex === playerUpdate.playerIndex)!;

    const startOfActionPlayerState: PlayerState = (
        getPlayerOnFrame(
            playerUpdate.playerIndex,
            getStartOfAction(playerState, replayData!),
            replayData!
        ) as PlayerUpdateWithNana
    )[isNana ? "nanaState" : "state"];
    const actionName = actionNameById[playerState.actionStateId];
    const characterData = actionMapByInternalId[playerState.internalCharacterId];
    const animationName =
        characterData.animationMap.get(actionName) ??
        characterData.specialsMap.get(playerState.actionStateId) ??
        actionName;
    const animationFrames = animations[animationName];
    // TODO: validate L cancels, other fractional frames, and one-indexed
    // animations. I am currently just flooring. Converts - 1 to 0 and loops for
    // Entry, Guard, etc.
    const frameIndex =
        Math.floor(Math.max(0, playerState.actionStateFrameCounter)) %
        (animationFrames?.length ?? 1);
    // To save animation file size, duplicate frames just reference earlier
    // matching frames such as "frame20".
    const animationPathOrFrameReference = animationFrames?.[frameIndex];
    const path =
        animationPathOrFrameReference !== undefined &&
            (animationPathOrFrameReference.startsWith("frame") ?? false)
            ? animationFrames?.[
            Number(animationPathOrFrameReference.slice("frame".length))
            ]
            : animationPathOrFrameReference;
    const rotation =
        animationName === "DamageFlyRoll"
            ? getDamageFlyRollRotation(replayData, playerState)
            : isSpacieUpB(playerState)
                ? getSpacieUpBRotation(replayData, playerState)
                : 0;
    // Some animations naturally turn the player around, but facingDirection
    // updates partway through the animation and incorrectly flips the
    // animation. The solution is to "fix" the facingDirection for the duration
    // of the action, as the animation expects. However upB turnarounds and
    // Jigglypuff/Kirby mid-air jumps are an exception where we need to flip
    // based on the updated state.facingDirection.
    const facingDirection = actionFollowsFacingDirection(animationName)
        ? playerState.facingDirection
        : startOfActionPlayerState.facingDirection;
    return {
        playerState,
        playerInputs,
        playerSettings,
        path,
        innerColor: getPlayerColor(
            replayData,
            playerUpdate.playerIndex,
            playerState.isNana
        ),
        outerColor:
            startOfActionPlayerState.lCancelStatus === "missed"
                ? "red"
                : playerState.hurtboxCollisionState !== "vulnerable"
                    ? "blue"
                    : "black",
        transforms: [
            `translate(${playerState.xPosition} ${playerState.yPosition})`,
            // TODO: rotate around true character center instead of current guessed
            // center of position+(0,8)
            `rotate(${rotation} 0 8)`,
            `scale(${characterData.scale} ${characterData.scale})`,
            `scale(${facingDirection} 1)`,
            "scale(.1 -.1) translate(-500 -500)",
        ],
        animationName,
        characterData,
    };
}

// DamageFlyRoll default rotation is (0,1), but we calculate rotation from (1,0)
// so we need to subtract 90 degrees. Quick checks:
// 0 - 90 = -90 which turns (0,1) into (1,0)
// -90 - 90 = -180 which turns (0,1) into (-1,0)
// Facing direction is handled naturally because the rotation will go the
// opposite direction (that scale happens first) and the flip of (0,1) is still
// (0, 1)
function getDamageFlyRollRotation(
    replayData: ReplayData,
    playerState: PlayerState
): number {
    const previousState = (
        getPlayerOnFrame(
            playerState.playerIndex,
            playerState.frameNumber - 1,
            replayData!
        ) as PlayerUpdateWithNana
    )[playerState.isNana ? "nanaState" : "state"];
    const deltaX = playerState.xPosition - previousState.xPosition;
    const deltaY = playerState.yPosition - previousState.yPosition;
    return (Math.atan2(deltaY, deltaX) * 180) / Math.PI - 90;
}

// Rotation will be whatever direction the player was holding at blastoff. The
// default rotation of the animation is (1,0), so we need to subtract 180 when
// facing left, and subtract 0 when facing right.
// Quick checks:
// 0 - 0 = 0, so (1,0) is unaltered when facing right
// 0 - 180 = -180, so (1,0) is flipped when facing left
function getSpacieUpBRotation(
    replayData: ReplayData,
    playerState: PlayerState
): number {
    const startOfActionPlayer = getPlayerOnFrame(
        playerState.playerIndex,
        getStartOfAction(playerState, replayData!),
        replayData!
    );
    const joystickDegrees =
        ((startOfActionPlayer.inputs.processed.joystickY === 0 &&
            startOfActionPlayer.inputs.processed.joystickX === 0
            ? Math.PI / 2
            : Math.atan2(
                startOfActionPlayer.inputs.processed.joystickY,
                startOfActionPlayer.inputs.processed.joystickX
            )) *
            180) /
        Math.PI;
    return (
        joystickDegrees -
        ((startOfActionPlayer as PlayerUpdateWithNana)[
            playerState.isNana ? "nanaState" : "state"
        ].facingDirection === -1
            ? 180
            : 0)
    );
}

// All jumps and upBs either 1) Need to follow the current frame's
// facingDirection, or 2) Won't have facingDirection change during the action.
// In either case we can grab the facingDirection from the current frame.
function actionFollowsFacingDirection(animationName: string): boolean {
    return (
        animationName.includes("Jump") ||
        ["SpecialHi", "SpecialAirHi"].includes(animationName)
    );
}

function isSpacieUpB(playerState: PlayerState): boolean {
    const character = characterNameByInternalId[playerState.internalCharacterId];
    return (
        ["Fox", "Falco"].includes(character) &&
        [355, 356].includes(playerState.actionStateId)
    );
}

function getPlayerColor(
    replayData: ReplayData,
    playerIndex: number,
    isNana: boolean
): string {
    if (replayData!.settings.isTeams) {
        const settings =
            replayData!.settings.playerSettings[playerIndex];
        return [
            [colors.red["800"], colors.red["600"]],
            [colors.green["800"], colors.green["600"]],
            [colors.blue["800"], colors.blue["600"]],
        ][settings.teamId][isNana ? 1 : settings.teamShade];
    }
    return [
        [colors.red["700"], colors.red["600"]],
        [colors.blue["700"], colors.blue["600"]],
        [colors.yellow["500"], colors.yellow["400"]],
        [colors.green["700"], colors.green["600"]],
    ][playerIndex][isNana ? 1 : 0];
}

export function wrapFrame(replayData: ReplayData, frame: number): number {
    if (!replayData) return frame;
    return (
        (frame + replayData.frames.length) %
        replayData.frames.length
    );
}

export const getReplayData = async (file: File) => {
    const settings = parseGameSettings(
        decode(await file.arrayBuffer(), { useTypedArrays: true })
    );
    if (isLegalGameWithoutCPUs(settings)) {
        const stub = settingsToStub(file, settings);
        return { file: file, stub: stub };
    }

    return undefined;
}

export const createAnimationResource = (replayState: ReplayStore, playerIndex: number) => () => {
    const replay = replayState.replayData;
    if (replay === undefined) {
      return undefined;
    }
    const playerSettings = replay.settings.playerSettings[playerIndex];
    if (playerSettings === undefined) {
      return undefined;
    }
    const playerUpdate =
      replay.frames[replayState.frame].players[playerIndex];
    if (playerUpdate === undefined) {
      return playerSettings.externalCharacterId;
    }
    if (
      playerUpdate.state.internalCharacterId ===
      characterNameByInternalId.indexOf("Zelda")
    ) {
      return characterNameByExternalId.indexOf("Zelda");
    }
    if (
      playerUpdate.state.internalCharacterId ===
      characterNameByInternalId.indexOf("Sheik")
    ) {
      return characterNameByExternalId.indexOf("Sheik");
    }
    return playerSettings.externalCharacterId;
  }

  export const createAnimationResourceReact = (replayData: ReplayData, frame: number, playerIndex: number) => () => {
    const replay = replayData;
    if (replay === undefined) {
      return undefined;
    }
    const playerSettings = replay.settings.playerSettings[playerIndex];
    if (playerSettings === undefined) {
      return undefined;
    }
    const playerUpdate =
      replay.frames[frame].players[playerIndex];
    if (playerUpdate === undefined) {
      return playerSettings.externalCharacterId;
    }
    if (
      playerUpdate.state.internalCharacterId ===
      characterNameByInternalId.indexOf("Zelda")
    ) {
      return characterNameByExternalId.indexOf("Zelda");
    }
    if (
      playerUpdate.state.internalCharacterId ===
      characterNameByInternalId.indexOf("Sheik")
    ) {
      return characterNameByExternalId.indexOf("Sheik");
    }
    return playerSettings.externalCharacterId;
  }

function isLegalGameWithoutCPUs(gameSettings: GameSettings): boolean {
    const stageName = stageNameByExternalId[gameSettings.stageId];
    if (
        ![
            "Battlefield",
            "Fountain of Dreams",
            "Yoshi's Story",
            "Dream Land N64",
            "Pokémon Stadium",
            "Final Destination",
        ].includes(stageName)
    ) {
        return false;
    }
    if (
        gameSettings.playerSettings
            .filter((p) => p)
            .some((p) => p.playerType === 1 || p.externalCharacterId >= 26)
    ) {
        return false;
    }
    return true;
}

function settingsToStub(file: File, settings: GameSettings): ReplayStub {
    return {
        // fake stuff
        numFrames: 99999,
        // real stuff
        isTeams: settings.isTeams,
        fileName: file.name,
        stageId: settings.stageId,
        playedOn: settings.startTimestamp,
        playerSettings: settings.playerSettings.map((p) => ({
            playerIndex: p.playerIndex,
            connectCode: p.connectCode,
            displayName: p.displayName,
            nametag: p.nametag,
            externalCharacterId: p.externalCharacterId,
            teamId: p.teamId,
        })),
    };
}