import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { RenderData, ReplayStore, ReplayStub } from './types';
import { CharacterAnimations, fetchAnimations } from '../viewer/animationCache';
import { computeRenderData, createAnimationResourceReact, wrapFrame, wrapFrame2 } from './stateHelper';
import { Frame, ReplayData } from '../common/types';

interface ReactReplayStore {
    frame: number;
    renderDatas: RenderData[];
    running: boolean;
    fps: number;
    replayData?: ReplayData;
    togglePause: () => void;
    jump: (target: number) => void;
    setReplayData: (replayData: ReplayData) => void;
    incrementFrame: () => void;
    clearReplayData: () => void;
}


const getNewRenderDatas = (replayData: ReplayData, frame: number, animations: CharacterAnimations[]) => {
    const renderDatas = replayData.frames[frame].players
        .filter((playerUpdate) => playerUpdate)
        .flatMap((playerUpdate) => {
            const animations2 = animations[playerUpdate.playerIndex];
            if (animations === undefined) return [];
            const renderDatas = [];
            renderDatas.push(
                computeRenderData(replayData, playerUpdate, animations2, false)
            );
            if (playerUpdate.nanaState != null) {
                renderDatas.push(
                    computeRenderData(replayData, playerUpdate, animations2, true)
                );
            }
            return renderDatas;
        })
    return renderDatas
}

const getAnimations = async (replayData: ReplayData, frame: number) => {
    const ids: number[] = [];
    for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
        const id = createAnimationResourceReact(replayData, frame, playerIndex)()
        if (id) ids.push(id)
    }
    const animations = await Promise.all(ids.map(async id => await fetchAnimations(id)))
    return animations
}

const getFrameAndRenderDatas = async (get: () => ReactReplayStore, frame: number) => {
    const replayData = get().replayData
    const newFrame = wrapFrame2(replayData!, frame)
    animations = await getAnimations(replayData!, newFrame);
    const newRenderDatas = getNewRenderDatas(replayData!, newFrame, animations)
    return { newFrame, newRenderDatas }
}

let animations = [];
export const useReplayStore = create<ReactReplayStore>()(
    devtools(
        (set, get) => ({
            frame: 0,
            renderDatas: [],
            fps: 60,
            running: false,
            togglePause: () => set((state) => ({ running: !state.running })),
            jump: async (target: number) => {
                const { newFrame, newRenderDatas } = await getFrameAndRenderDatas(get, target)
                set(() => ({ frame: newFrame, renderDatas: newRenderDatas }))
            },
            incrementFrame: async () => {
                const frame = get().frame
                const { newFrame, newRenderDatas } = await getFrameAndRenderDatas(get, frame + 1)
                set(() => ({ frame: newFrame, renderDatas: newRenderDatas })
                )
            },
            clearReplayData: () => set({ replayData: undefined, renderDatas: [], frame: 0, running: false }),
            setReplayData: async (replayData: ReplayData, frame = 0) => {
                animations = await getAnimations(replayData, frame);
                const newRenderDatas = getNewRenderDatas(replayData, frame, animations)
                set(() => ({ replayData: replayData, renderDatas: newRenderDatas, frame: frame, running: false }))
            },
        }),
        {
            name: 'replay-store',
        }
    )
)