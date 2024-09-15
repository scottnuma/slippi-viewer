import { useEffect, useRef, useState } from "react";
import { useReplayStore } from "../../state/replayStoreReact";

// this component is responsible for incrementing the frame state
// 60 fps is the target fps
interface FrameCounterProps {
    children?: React.ReactNode
}
export function FrameCounter({ children }: FrameCounterProps) {
    const [requestId, setRequestId] = useState(0);
    const totalTimeElapsed = useRef(0);
    const lastTime = useRef(0);
    const FRAME_TIME = 1000 / 60;
    const incrementFrame = useReplayStore((state) => state.incrementFrame);
    const running = useReplayStore((state) => state.running);

    useEffect(() => {
        let animationFrameId = 0;
        const firstFrame = (time: number) => {
            lastTime.current = time;
            animate(time)
        }
        const animate = (time: number) => {            
            if (running) {
                console.log(totalTimeElapsed.current)
                totalTimeElapsed.current += time - lastTime.current;
                if (totalTimeElapsed.current >= FRAME_TIME) {
                    totalTimeElapsed.current = totalTimeElapsed.current - FRAME_TIME;
                    incrementFrame();
                }
            }
            lastTime.current = time;
            animationFrameId = requestAnimationFrame((t) => animate(t));
        };

        if (requestId === 0) {
            animationFrameId = requestAnimationFrame(firstFrame);
            setRequestId(animationFrameId);
        }
        return () => {
            cancelAnimationFrame(requestId);
            setRequestId(0);
        };
    }, [running, requestId, incrementFrame, setRequestId, totalTimeElapsed, lastTime]);
    return (
        <>
            {children}
        </>
    )
}