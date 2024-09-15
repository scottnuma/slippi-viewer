import React, { useEffect } from "react";
import { useReplayStore } from "../../state/replayStoreReact";
import { parseReplay } from "../../parser/parser";
import { decode } from "@shelacek/ubjson";

interface ReplayStateSetterProps {
    file: File
    children?: React.ReactNode
}

export function ReplayStateSetter({ file, children }: ReplayStateSetterProps) {
    const replayData = useReplayStore((state) => state.replayData);
    const setReplayData = useReplayStore((state) => state.setReplayData);
    useEffect(() => {
        async function fetchReplayData() {
            if (replayData) return
            const newReplayData = parseReplay(
                decode(await file.arrayBuffer(), { useTypedArrays: true })
            );
            setReplayData(newReplayData);
        }
        fetchReplayData();
    }, [replayData]);

    return <>{children}</>
}
