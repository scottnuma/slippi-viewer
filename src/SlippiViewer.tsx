import { useEffect } from "react"
import { FrameCounter } from "./components/conversion/FrameCounter"
import { ReplayStateSetter } from "./components/conversion/ReplayStateSetter"
import { Viewer } from "./components/viewer/Viewer"
import { useReplayStore } from "./state/replayStoreReact"

interface SlippiViewerProps {
    file: File
}

export default function SlippiViewer({file}: SlippiViewerProps) {
    const clearReplayData = useReplayStore((state) => state.clearReplayData)
    useEffect(() => {
        clearReplayData()
    }, [])
    return (
        <>
        <ReplayStateSetter file={file} />
        {/* <FrameCounter /> */}
        <Viewer />
        </>
    )
}