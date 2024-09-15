
import { Show } from "../conversion/helpers";
import { useReplayStore } from "../../state/replayStoreReact";
import { useRef } from "react";

export function Controls() {
  const seekbarInput = useRef<HTMLInputElement>(null);
  const running = useReplayStore((state) => state.running);
  const frame = useReplayStore((state) => state.frame);
  const replayData = useReplayStore((state) => state.replayData);
  const togglePause = useReplayStore((state) => state.togglePause);
  const jump = useReplayStore((state) => state.jump);

  return (
    <div className="flex flex-wrap items-center justify-evenly gap-4 rounded-b border border-t-0 py-1 px-2 text-slate-800">
      <Show
        when={running}
        fallback={
          <div
            className="material-icons cursor-pointer text-[32px] leading-none"
            onClick={() => togglePause()}
            aria-label="Resume playback"
          >
            play_arrow
          </div>
        }
      >
        <div
          className="material-icons cursor-pointer text-[32px]"
          onClick={() => togglePause()}
          aria-label="pause playback"
        >
          pause
        </div>
      </Show>
      <input
        id="seekbar"
        className="flex-grow accent-slippi-500"
        type="range"
        // ref={seekbarInput}
        value={frame}
        max={replayData!.frames.length - 1}
        // onInput={() => jump(seekbarInput.valueAsNumber)}
      />
    </div>
  );
}
