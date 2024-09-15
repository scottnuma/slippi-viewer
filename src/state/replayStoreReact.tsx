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
    currentFrameData?: Frame;
    togglePause: () => void;
    jump: (target: number) => void;
    setReplayData: (replayData: ReplayData) => void;
    incrementFrame: () => void;
    clearReplayData: () => void;
    test: () => void;
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

let animations = [];
export const useReplayStore = create<ReactReplayStore>()(
    devtools(
            (set, get) => ({
                frame: 0,
                renderDatas: [],
                animations: Array(4).fill(undefined),
                fps: 60,
                running: false,
                togglePause: () => set((state) => ({ running: !state.running })),
                jump: (target: number) => set((state) => ({ frame: wrapFrame2(state.replayData!, target) })),
                incrementFrame: async () => {
                    const replayData = get().replayData
                    const frame = get().frame
                    const newFrame = wrapFrame2(replayData!, frame + 1)
                    animations = await getAnimations(replayData!, newFrame);
                    const newRenderDatas = getNewRenderDatas(replayData!, newFrame, animations)
                    set(() => {
                        return ({ frame: newFrame, renderDatas: newRenderDatas })
                    })
                },
                clearReplayData: () => set({ replayData: undefined, renderDatas: [], frame:0, running: false }),
                setReplayData: async (replayData: ReplayData) => {
                    animations = await getAnimations(replayData, 0);
                    const newRenderDatas = getNewRenderDatas(replayData!, 0, animations)
                    set(() => ({ replayData: replayData, renderDatas: newRenderDatas }))
                },
                test: () => console.log('test'),
            }),
            {
                name: 'replay-store',
            }
        )
)