# Rooms, corridors and free mouse look

The Blender source `tools/castle_rooms.py` divides the six existing levels into
functional room zones around a ten-metre central hall and side rooms.
The deep crypt has four smaller chambers. The source contains 49 room/corridor
zones in total, with bounded doorways and lintels around protected routes.

Routes preserve the main gate, balcony doors, basement/crypt stairs, throne
steps, attic stair and their landings. The attic route now follows the north
corridor instead of crossing diagonally through the new partitions. Rooms have
names displayed in the location badge. No keys are required for interior doors.

Partition geometry is baked by floor/material, while physical collision keeps
individual solid wall segments. The combined meshes also block camera rays.
Furniture retains its escape/landing behavior from CASTLE_INTERIORS.md.

Hold the right mouse button and drag horizontally or vertically. Mouse pitch
now spans approximately -72 to +72 degrees. Aim direction is independent of the
safe camera orbit, so floor/ceiling clamps no longer cancel looking up/down.
The camera still clips against walls, floors and other registered obstacles.

Run the demo server, then these checks sequentially (they share a Chrome port):

```powershell
node tools/tests/verify_rooms.js
node tools/tests/verify_interiors.js
node tools/tests/verify_basement.js
node tools/tests/verify_castle.js
node tools/tests/verify_graphics.js
```

The rooms check walks the actual character through doors to each layout zone
on all six floors and verifies actual rendered camera direction after mouse
events. It also writes `rooms-report.json` and `maze-*.png` to demo/verification.
Grid sampling does not prove every possible input sequence is bug-free.

Validation passed: 16 room/camera checks, 14 furniture checks, 12 basement
checks and 162 existing castle checks. Every authored room zone has a sampled
reachable interior and an actual movement route through doors. Three former
basement probe coordinates were moved 0.5m off the newly built walls; reachability
is additionally checked across all sampled walkable basement/crypt floor cells.
