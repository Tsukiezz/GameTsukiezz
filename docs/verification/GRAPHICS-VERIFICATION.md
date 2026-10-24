# Lightweight browser graphics

Run the demo server from the project directory:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory demo
```

Then run `node tools/tests/verify_graphics.js` and `node tools/tests/verify_castle.js` sequentially.
Both scripts require Google Chrome at its default Windows location and Node with
global WebSocket support. GAME_URL overrides the demo address.

The graphics check verifies the lightweight profile, draw-call reduction, resolution
limits, restoration of Ultra, and persistence after reload. Its temporary Chrome
profile is separate from the user's browser. Castle verification also writes its
existing screenshots and report to demo/verification.

The new potato profile is the default when no saved preference exists. It disables
point lights, shadows, optional flora, footstep sparkles, and decorative castle
animations. It reduces minimap updates and camera far distance. Render resolution
starts at 60 percent per dimension, capped at 960 by 540; sustained low FPS lowers
the scale to 35 percent, with slow recovery when performance improves.

These are browser functional checks, not measurements on a low-end physical PC.
Actual FPS depends on hardware, drivers, viewport, and scene location. WebGL remains
required. The Unity project is unaffected.
