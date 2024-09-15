import { useEffect, useState } from "react";
import {    
    ReplayData,
  } from "../../common/types";
import { useReplayStore } from "../../state/replayStoreReact";
// this is a react component to represent state like replayStore

function wrapFrame(replayData: ReplayData, frame: number): number {
    if (!replayData) return frame;
    return (
        (replayData.frames.length) %
        replayData.frames.length
    );
}
interface Props {
  replayData: ReplayData
}

export function Frames({replayData}: Props) {
    const [frame, setFrame] = useState(0);
    const togglePause = useReplayStore((state) => state.togglePause);
    useEffect(() => {        
        setTimeout(() => {
            console.log('starting')
            togglePause();
        }, 2000)
        console.log('ding')
    }, [])

    // 60 times a second, increment frame by 1
    setTimeout(() => {
        console.log('dong')
        if (frame < replayData.frames.length - 1) {
            console.log('increment')
            setFrame(wrapFrame(replayData, frame + 1));
        }
    }, 1000 / 60);
}
