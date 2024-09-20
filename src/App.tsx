import SlippiViewer from './index';
import { useState } from 'react';

export function App() {
  const [file, setFile] = useState<File | undefined>(undefined)  
  const [startFrame, setStartFrame] = useState(0)
  const [endFrame, setEndFrame] = useState(100)
  const [startOnLoad, setstartOnLoad] = useState(false)
  return (
    <>
      <input onChange={e => {
        if (!e.target?.files?.[0]) return
        setFile(e.target.files[0])
      }} type="file" />
      <input type="number" value={startFrame} onChange={e => setStartFrame(parseInt(e.target.value))} />
      <input type="number" value={endFrame} onChange={e => setEndFrame(parseInt(e.target.value))} />
      <input type="checkbox" checked={startOnLoad} onChange={e => setstartOnLoad(e.target.checked)} />
      {file &&<SlippiViewer file={file} startFrame={startFrame} endFrame={endFrame} startOnLoad={startOnLoad} />}
    </>
  )
}