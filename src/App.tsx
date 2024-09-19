import SlippiViewer from './index';
import { useState } from 'react';

export function App() {
  const [file, setFile] = useState<File | undefined>(undefined)  

  return (
    <>
      <input onChange={e => {
        if (!e.target?.files?.[0]) return
        setFile(e.target.files[0])
      }} type="file" />
      {file &&<SlippiViewer file={file} />}
    </>
  )
}