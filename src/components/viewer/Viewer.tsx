import { For, Show } from '../conversion/helpers';
import { Camera } from "../../components/viewer/Camera";
import { HUD } from "../../components/viewer/HUD";
import { Players } from "../../components/viewer/Player";
import { Stage } from "../../components/viewer/Stage";
import { Item } from "../../components/viewer/Item";
import { Controls } from "../../components/viewer/Controls";
import { useReplayStore } from "../../state/replayStoreReact";
import { useCallback } from "react";

export function Viewer() {
  const replayData = useReplayStore((state) => state.replayData);
  const frame = useReplayStore((state) => state.frame);
  const items = useCallback(
    () => replayData?.frames[frame].items ?? []
    , [replayData, frame]);
  return (
    <div className="flex flex-col overflow-y-auto pb-4">
      <Show when={!!replayData}>
        <svg className="rounded-t border bg-slate-50" viewBox="-365 -300 730 600">
          <g className="-scale-y-100">
            <Camera>
              <Stage />
              <Players />
              <For each={items()}>{(item) => <Item item={item} />}</For>
            </Camera>
            <HUD />
          </g>
        </svg>
        <Controls />
      </Show>
    </div>
  );
}
