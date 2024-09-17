
import { Show } from "../conversion/helpers";
import { useReplayStore } from "../../state/replayStoreReact";
import { useRef } from "react";
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export function Controls() {
  const seekbarInput = useRef<HTMLInputElement>(null);
  const running = useReplayStore((state) => state.running);
  const frame = useReplayStore((state) => state.frame);
  const replayData = useReplayStore((state) => state.replayData);
  const togglePause = useReplayStore((state) => state.togglePause);
  const jump = useReplayStore((state) => state.jump);

  const handleSeekbarInput = () => {
    if (!seekbarInput.current) return;
    jump(Number(seekbarInput.current.value))
  }

  return (
    <div className="flex flex-wrap items-center justify-evenly gap-4 rounded-b border border-t-0 py-1 px-2 text-slate-800">
      <Show
        when={running}
        fallback={
          <div
            onClick={() => togglePause()}
            aria-label="Resume playback"
          >
            <PlayArrowIcon />          
          </div>
        }
      >
        <div
          onClick={() => togglePause()}
          aria-label="pause playback"
        >
          <PauseIcon />
        </div>
      </Show>
      <input
        id="seekbar"
        className="flex-grow accent-slippi-500"
        type="range"
        ref={seekbarInput}
        value={frame}
        max={replayData!.frames.length - 1}
        onInput={handleSeekbarInput}
      />
    </div>
  );
}
