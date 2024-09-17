import './index.css'
import { decode } from '@shelacek/ubjson';
import { parseReplay } from './parser/parser';
import { useReplayStore } from "./state/replayStoreReact";
import { Viewer } from './components/viewer/Viewer';
import { useEffect } from 'react';

interface SlippiViewerProps {
    file: File
}

export function SlippiViewer({ file }: SlippiViewerProps) {
    const setReplayData = useReplayStore((state) => state.setReplayData);
    useEffect(() => {
        async function fetchReplayData() {
            setReplayData(parseReplay(decode(await file.arrayBuffer(), { useTypedArrays: true })));
        }
        fetchReplayData();
    }, [])


    return (
        <Viewer />
    )
}