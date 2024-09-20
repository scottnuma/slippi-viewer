import './index.css'
import { decode } from '@shelacek/ubjson';
import { parseReplay } from './parser/parser';
import { useReplayStore } from "./state/replayStoreReact";
import { Viewer } from './components/viewer/Viewer';
import { useEffect } from 'react';

interface SlippiViewerProps {
    file: File
    startFrame?: number
    endFrame?: number
    startOnLoad?: boolean
}


export default function SlippiViewer({ file, startFrame, endFrame, startOnLoad }: SlippiViewerProps) {
    const setReplayData = useReplayStore((state) => state.setReplayData);
    useEffect(() => {
        async function fetchReplayData() {
            setReplayData(
                parseReplay(decode(await file.arrayBuffer(), { useTypedArrays: true })),
                startFrame,
                endFrame,
                startOnLoad
            );
        }
        fetchReplayData();
    }, [file, startFrame, endFrame, startOnLoad]);

    return (
        <div className="flex max-h-screen flex-grow flex-col gap-2 pt-2 pr-4 pl-4 lg:pl-0">
            <Viewer />
        </div>
    )
}