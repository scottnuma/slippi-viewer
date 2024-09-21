# SlippiViewer
================

SlippiViewer is a React component that can be used to view slippi replays in the browser.

## Background
------------

I took the Viewer from https://github.com/frankborden/slippilab and ripped it out into its own thing as a React component (instead of solid-js). It was a hacky and sloppy job and I removed several features from the player, but overall seems to play the replays the same.

## Important Notes
-----------------

* This package is >230MB!!

## Usage
-----

### Installation

```bash
npm i slippi-viewer
```

### Importing the Component

```jsx
import SlippiViewer from 'slippi-viewer'
```

### Using the Component

```jsx
<SlippiViewer file={File} startFrame={number} endFrame={number} startOnLoad={boolean}>
```

The component will play the replay, looping between `startFrame` and `endFrame`. By default, this range is start-to-end. `startOnLoad` determines if the player is running when the replay first loads.

### Validation

Note that you are expected to have validated the file before passing it to the viewer. Specifically:

1. Only legal stages (unsure about unfrozen PS)
2. No cpus?
3. No doubles?

I'm not sure if #2 or #3 will cause problems, but I don't really care to test it.

## Development
-------------

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

This will start the development server, using `index.html` and `main.tsx` to render the `App.tsx` component.

If you find any bugs or have new features ideas, feel free to fork this and make those changes!