# Castle maze — revision 6

This revision supersedes the aligned stair layout in `COMPACT_STAIRS_PRISON.md`.
The Blender source is `Assets/Art/Blender/Environments/CastleExtension.blend`;
`tools/build_castle_extension.py` exports the same authored geometry to the browser.

## Layout

The four upward staircases now occupy different rooms: the genealogy store,
trophy room, map room and antiquities room. Tall, solid bookcase screens hide
the flights from each room's public doorway. Walk around either end of the
screen to discover the stairs; the screens do not require an interaction.
Incoming floor openings follow the new stair positions. The compact return
stairs, handrails, prison controls and emergency release remain functional.

Two alternating corridor walls per floor make players change sides to reach
the next group of rooms. All 33 rooms retain one public entrance, with clear
door approaches. Arrival and departure stair rooms are reserved before moving
complete furniture assemblies.

Room themes include an ancient library with 160 books, an armor museum with
six full suits on plinths, the king's canopy bedroom with heraldic tapestries,
and a basement vault with 54 stacked gold ingots. Gold uses a stable warm
material, and castle windows use opaque colored glass instead of blown-out
emissive panes. Blender box normals face outward. Decorative books and relief
are batched by material; solid partitions retain camera occlusion.

## Verification

Run the maintained browser suites sequentially (shared Chrome debugger port):

```powershell
node tools/tests/verify_compact.js
node tools/tests/verify_maze.js
node tools/tests/verify_redesign.js
node tools/tests/verify_rooms.js
node tools/tests/verify_interiors.js
node tools/tests/verify_safety.js
node tools/tests/verify_graphics.js
```

Checks cover actual traversal of both stair directions at four frame rates,
walking from the corridor to every stair entrance, door counts, room routes,
concealment rays, furniture recovery, prison interactions, repeated running
jumps on the bridge, opaque walls, floor support and graphics settings.
Screenshots and JSON reports are generated under `demo/verification/`.
These checks cover the tested paths and configurations; they are not a claim
that every possible camera position or hardware configuration is error-free.

## Basement display correction

The legacy foundation's rendered inner faces sat 0.6 m behind its collision
faces, leaving the exterior lunar texture visible between the new floor and
the dark wall. Runtime stone liners now meet the basement's exact edges at
local x = ±18.4 and z = ±20.4. They share the partition batches and preserve
the existing room routes. Camera wall clearance is 0.22 m to keep the near
plane away from surfaces at oblique angles. `verify_display.js` checks all
four floor/wall seams, matching collision boundaries and camera clearance,
and captures the reported area around world (-124, 1, 100).
