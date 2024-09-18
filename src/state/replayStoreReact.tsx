import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { RenderData} from './types';
import { CharacterAnimations, fetchAnimations } from '../viewer/animationCache';
import { computeRenderData, createAnimationResourceReact, wrapFrame } from './stateHelper';
import { ReplayData } from '../common/types';

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

// call incrementFrame 60 times a second
// only while running
// stolen from solid-js
const incrementFrame = useReplayStore.getState().incrementFrame
createRAF(
    targetFPS(
        () => incrementFrame(),
        60
    )
)

async function getAnimations(replayData: ReplayData, frame: number) {
    const ids: number[] = [];
    for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
        const id = createAnimationResourceReact(replayData, frame, playerIndex)()
        if (id) ids.push(id)
    }
    const animations = await Promise.all(ids.map(async id => await fetchAnimations(id)))
    return animations
}

async function getFrameAndRenderDatas(get: () => ReactReplayStore, frame: number) {
    const replayData = get().replayData
    const newFrame = wrapFrame(replayData!, frame)
    animations = await getAnimations(replayData!, newFrame);
    const newRenderDatas = getNewRenderDatas(replayData!, newFrame, animations)
    return { newFrame, newRenderDatas }
}

function createRAF(
    callback: FrameRequestCallback,
) {
    let requestID = 0;

    const loop: FrameRequestCallback = timeStamp => {
        requestID = requestAnimationFrame(loop);
        callback(timeStamp);
    };

    let running = useReplayStore.getState().running
    useReplayStore.subscribe((state) => {
        if (state.running) {
            if (running) return;
            requestID = requestAnimationFrame(loop);
        }
        else {
            if (!running) return;
            cancelAnimationFrame(requestID);
        }
        running = state.running
    })
}

function targetFPS(
    callback: FrameRequestCallback,
    fps: number,
): FrameRequestCallback {
    const interval = (() => {
        const newInterval = Math.floor(1000 / fps);
        return () => newInterval;
    })();

    let elapsed = 0;
    let lastRun = 0;
    let missedBy = 0;

    return timeStamp => {
        elapsed = timeStamp - lastRun;
        if (Math.ceil(elapsed + missedBy) >= interval()) {
            lastRun = timeStamp;
            missedBy = Math.max(elapsed - interval(), 0);
            callback(timeStamp);
        }
    };
}