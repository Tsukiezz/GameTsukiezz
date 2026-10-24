# Mercury Lake bosses

Build: `E:\blender.exe --background --python tools/build_lake_monsters.py`.
Scene: `Assets/Art/Blender/Characters/MercuryLakeMonsters.blend`.
The Blender hierarchy contains pivot empties for body, neck/head, jaw, tail
and fins/legs. Exported geometry and pivots drive the same joints in Three.js.

- Loch Ness: 10000 HP, roughly 49 m high and 62 m long, detection 145 m,
  pursuit 7.3 m/s, 38 damage, 1.2 s warning before the attack.
- Space crocodile: 7000 HP, roughly 83 m long, detection 125 m,
  pursuit 8.4 m/s, 28 damage, 0.95 s warning before the attack.

Models feature plated hides, dorsal spines, horned heads, slit eyes and teeth.
Their head/jaw, neck, fins and tails animate; the crocodile raises its muzzle
out of the mercury during the attack preparation. Dead bosses sink, stop
attacking and disable their colliders. Health stays reduced for the current
page session and resets with a full reload.

The lake's Blender-authored floor is now -72 m, 73.2 m below the liquid surface.
Bridge supports and drowned ruins reach that floor. Safety bedrock moves to
-78 m to avoid intersecting the basin. All heroes swim and dive with oxygen; graded banks let them return to shore.
Patrols now fully submerge, and damage/acquisition require the player to be in water.
Dry banks and the bridge are safe; pursuit follows a swimmer vertically.

`demo/features/lake/lake-monsters.js` owns health, patrol, acquisition, pursuit, telegraph,
attack recovery and death. Actors stay on opposite sides of the causeway and
find unobstructed homes around the physical ruins. Moving collision capsules
are queried separately from the static spatial grid. Submerged tail sections
do not create invisible walls for a player at the liquid surface.

Bridge safety checks both the player's horizontal footprint and elevation.
The causeway, connected stone landing and shrine are safe. Being underneath
them does not grant immunity. Safety is checked during acquisition, during
the windup and again inside player-damage handling. Entering the bridge drops
aggro and cancels the warning marker. Enemies keep their bodies outside the
bridge corridor. Settings and dialogue pause combat; returning to the lobby
cancels pending attacks.

Warnings mark a fixed attack area, allowing a sprint or dodge. Armor absorbs
damage first; excess damage reduces health. Defeat restores the player at the
safe landing. All three hero attacks can damage bosses once per swing; staff
attacks have longer range and stone blocks attacks. Boss health bars expose
real current/max values, with bilingual status and bridge safety labels.

Run `node tools/tests/verify_lake_monsters.js`. It covers 33 checks for meshes,
scale/depth, acquisition and movement, bridge immunity, dodging, armor and
health damage, each hero's attacks, death, HUD values and player recovery.
Reports/screenshots go to `demo/verification/`.
