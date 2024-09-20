interface SlippiViewerProps {
    file: File
    startFrame?: number
    endFrame?: number
    startOnLoad?: boolean
}

export default function SlippiViewer({ file, startFrame, endFrame }: SlippiViewerProps): JSX.Element;