import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'
import { useReplayStore } from './state/replayStoreReact.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)

window.addEventListener('load', () => {
    const incrementFrame = useReplayStore.getState().incrementFrame
    createRAF(
        targetFPS(
            () => incrementFrame(),
            60
        )
    )
})

function createRAF(
    callback: FrameRequestCallback,
) {
    let requestID = 0;

    const loop: FrameRequestCallback = timeStamp => {
        requestID = requestAnimationFrame(loop);
        callback(timeStamp);
    };

    let running = useReplayStore.getState().running
    const _updateRunning = useReplayStore.subscribe((state) => {
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