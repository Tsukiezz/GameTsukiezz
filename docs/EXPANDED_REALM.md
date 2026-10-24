# Expanded realm and Mercury Lake

Build: `E:\blender.exe --background --python tools/build_expanded_realm.py`.
Review: `Assets/Art/Blender/Environments/ExpandedRealmAndMercuryLake.blend`.
Shared export: `demo/features/world/data/expanded-realm.js`; renderer: `demo/features/world/expanded-realm.js`.

Terrain grows from 560 x 560 m to 2240 x 2240 m: four times each axis,
sixteen times the area. Playable bounds grow from +/-248 to +/-992 m.
The terrain grid keeps its original 8.75 m spacing. Physics interpolates
the same triangles that Blender exports. The safety bedrock and minimap
span grow with the realm. Existing heroes and buildings keep their size.

All inter-building crystal highway geometry, curbs and highway pylons are
removed. Their support list is empty. The central plaza retains its lights.
The castle's functional approach bridge has a stone surface and gold inlay.

Mercury Lake moves from (-35, -135) to (-370, -430). Its basin is approximately
300 x 250 m, ringed by jagged basalt cliffs reaching over 100 m. A north-facing
opening leads to a lookout, a narrow stone causeway and a ruined shrine.
The giant gate pillars, fractured arch, drowned obelisks, dim inscriptions,
red watcher eyes and low mist establish its darker atmosphere.

The liquid surface uses a lightweight animated silver marbling shader.
Static architecture batches by material. Minimal disables lake lights and
optional mist. The lake terrain descends below the water; characters settle
just below the surface and can leave via graded banks rather than becoming
trapped in an unreachable pit. The causeway, lookout, shrine, rails, cliffs
and obelisks have physical collision. The ramp meets the northern terrain.
The boss update deepens the basin to -72 m and moves safety bedrock below it.
See `LAKE_MONSTERS.md` for the two Blender-authored bosses and combat rules.

Validation: `node tools/tests/verify_expanded_realm.js` checks all four distant
corners, boundary, bedrock, highway removal, lake scale, real causeway walking,
interaction reach, cliff collision, entering/leaving the liquid, graphics
and shader compilation. Reports and screenshots go to `demo/verification/`.
