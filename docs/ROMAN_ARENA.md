# Roman arena, VIP podium and lunar bedrock

The arena centre is world (115,110). The fighting floor and entrance remain
at their original 0.35 m height. There is no raised ground drum or new ramp.
Eighteen narrow seating rows rise to a 12.35 m promenade, inside three levels
of exterior stone arcades. Public stairs have 80 small risers. A masonry-supported
VIP loggia at 14 m is integrated into the east cavea with its own stair and gate.
Two opposing covered warrior tunnels retain their E-operated iron gates.
The three removed selectable heroes remain absent.

The VIP ticket counter is right of the main south entrance. Press E to
collect a free ticket, then present it with E at the gold east gate.
The loggia includes a roof, four individual seats facing the arena, stone
side barriers and a clear central aisle. Ticket counters are a game design
adaptation, not a claim about ancient paid VIP ticket sales.

Details include numbered arches, column capitals, bench divisions, stone
parapets, drainage grilles, closed timber service trapdoors, surviving
awning masts, torn cloth, faded banners, moss and fallen masonry.

## Fall fix and lower lunar surface

The old mountain terrain crossed the eastern part of the arena and its
height query overrode the sand floor. Terrain vertices and physics are now
flattened below the whole footprint, with a transition outside it. The
continuous arena foundation, matching stair support, parapets and recovery
anchor prevent the reported floor penetration/fall from continuing.

An additional visible lunar bedrock slab covers 560 x 560 m at top -12 m,
bottom -18 m. Its collider and independent vertical clamp catch fast falls
and already-invalid positions below the slab. Underfloor movement uses this
surface rather than snapping up to the surface terrain. The slab is below
the castle prison at -5 m. Tour controls remain available for returning.

## Blender MCP source

`Assets/Art/Blender/Environments/RomanArenaAndMoon.blend` contains editable parts arranged into ArenaFloor, Cavea, Arcades, VIP, TicketCourtyard
and MoonSafety collections. Textures are packed and also saved under
`Assets/Art/Textures/ArenaGenerated`. The lower slab is hidden in the Blender
viewport by default to make arena editing easier; it is visible in the game.

The browser geometry is authored in `demo/features/arena/roman-arena.js` and
`demo/features/arena/roman-arena-details.js` and `demo/features/arena/arena-warrior-tunnels.js`. `demo/features/world/moon-underlayer.js` installs the slab.
To refresh the editable Blender snapshot, run:

```powershell
$env:EXPORT_ARENA_BLEND='1'
node tools/tests/verify_arena.js
Remove-Item Env:EXPORT_ARENA_BLEND
```

Then execute `tools/sync_arena_blender.py` inside Blender through MCP.
The importer replaces only its own collection and preserves other objects.
Coordinates convert from game (x,y,z) to Blender (x,-z,y). Browser collision
metadata remains authored in the JS modules; Blender edits are not pushed
automatically and structural changes must update the matching physics.

## Sources used for design

- Parco archeologico del Colosseo, barriers and balustrades: protective
  parapets, access stairs, decorative panels and seating indications.
  https://colosseo.it/en/opere/barriers-and-balustrades/
- Parco archeologico del Colosseo, underground levels: service machinery
  beneath the arena and closed trapdoors represented on the playing floor.
  https://colosseo.it/en/marvels/the-underground-levels-of-the-colosseum/
- The-Colosseum.net, Description: elliptical form, numbered entrances,
  circular promenades, column orders and surviving arcade structure.
  https://the-colosseum.net/wp/en/description/
- Architecture of the Colosseum: podium, seating hierarchy, cavea sectors
  and separating corridors. Used as a secondary architecture reference.
  https://colosseo-roma.it/en/explore/coliseum/architecture/

The result is a playable abandoned arena inspired by these references,
not a measured reconstruction of the monument.

## Verification

Run browser suites sequentially because they share a Chrome debugger port:

```powershell
node tools/tests/verify_arena.js
node tools/tests/verify_compact.js
```

The 38 arena checks cover the continuous ground-level floor, original entrance and taller public stairs
at 15/60/144 FPS, both warrior tunnels and their E-operated iron gates,
the ticket-to-VIP workflow, VIP stair ascent/descent, abnormal-fall recovery,
batching and removal of the three selectable heroes. Reports/screenshots are
in `demo/verification/`. These sampled paths do not cover every possible input.

Solid architecture boxes now receive named box/oriented-box collision volumes;
arches have curved segmented collision. Old awning triangles over the public
stairs and an oversized VIP landing were removed/trimmed. Headroom is raycast
on every public stair riser. Torches use batched unlit flame geometry, without
extra point lights; six loudspeaker props and twelve flags decorate the rim.

Spectator routing redesign: main tour arrival is outside at (115,72). An outer
ring and two curved exterior stairs (39..43 elliptical radius) lead to the
upper promenade via east/west bridges. Interior public stairs were removed;
the inner perimeter is closed except for the warrior gates. The VIP assembly
is rotated to the north end, facing the centre, at promenade height 12.35 m.
Its stair/bridge headroom and both exterior routes are checked in arena_checks.

Entrance correction: both guard rings now leave the first four stair wedges
open at the south centre. Collision allows radial entry there. The regression
starts on the outside road at z=62 and walks through the entrance before
climbing either side at 15/60/144 FPS (42 checks total).
