SlippiViewer is a React component that can be used to view slippi replays in the browser.

I took the Viewer from https://github.com/frankborden/slippilab and ripped it out into its own thing as a React component (instead of solid-js).
It was a sloppy job and I removed several features from the player, but overall seems to play the replays the same.

This package is >230MB!!

If you have any issues with this package, or there are new features you'd like to see, please feel free to make your own change

Usage:
npm i slippilab-vite
import SlippiViewer from 'slippilab-vite'
<SlippiViewer file={File} startFrame={number} endFrame={number} startOnLoad={boolean}>
It will play the replay, looping between startFrame and endFrame. By default this range is start-to-end.
startOnLoad determines if the player is running when the replay first loads.

Building:
npm run build
index.tsx

Development:
npm run dev
index.html + main.tsx -> App.tsx