import { useEffect } from "react"
import { ReplayStateSetter } from "./components/conversion/ReplayStateSetter"
import { Viewer } from "./components/viewer/Viewer"
import { useReplayStore } from "./state/replayStoreReact"

interface SlippiViewerProps {
    file: File
}

export default function SlippiViewer({ file }: SlippiViewerProps) {
    const clearReplayData = useReplayStore((state) => state.clearReplayData)
    useEffect(() => {
        clearReplayData()
    }, [])
    return (
        <div className="flex max-h-screen flex-grow flex-col gap-2 pt-2 pr-4 pl-4 lg:pl-0">
            <ReplayStateSetter file={file} />

            <Viewer />
        </div>
    )
}