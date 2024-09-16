import { useState } from 'react'
import './index.css'
import SlippiViewer from "./SlippiViewer"
export function App() {
  const [file, setFile] = useState<File | undefined>();
  return (
    <>
      {!file &&<input onChange={e => setFile(e.target?.files?.[0])} type="file" />}
      {file &&
        <SlippiViewer file={file} />
      }
    </>
  )
}