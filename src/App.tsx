import './index.css'
import { decode } from '@shelacek/ubjson';
import { parseReplay } from './parser/parser';
import { useReplayStore } from "./state/replayStoreReact";
import { Viewer } from './components/viewer/Viewer';
export function App() {
  const setReplayData = useReplayStore((state) => state.setReplayData);
  const handleReplayDataChange = async (file: File) => {
    const newReplayData = parseReplay(
      decode(await file.arrayBuffer(), { useTypedArrays: true })
    );
    setReplayData(newReplayData);
  }
  return (
    <>
      <input onChange={e => {
        if (!e.target?.files?.[0]) return
        handleReplayDataChange(e.target.files[0])
      }} type="file" />
      <div className="flex max-h-screen flex-grow flex-col gap-2 pt-2 pr-4 pl-4 lg:pl-0">
        <Viewer />
      </div>    
    </>
  )
}