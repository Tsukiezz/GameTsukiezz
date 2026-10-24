# Forest wildlife and backpack

Forest now has nine tree families: birch, pine, fern tree, willow, oak,
acacia, redwood, bamboo and cherry. Supplemental canopy covers the spaces
between the original biome clusters, entirely inside the titanium enclosure.
There are no forest trees planted outside the fence. Ground shrubs remain visible in Minimal. The guardian,
elder roots and the single entrance retain room for movement. There is no
rendered footpath. Minimal uses Blender-decimated forest meshes at roughly
30% of the original triangle count; Ultra restores the original meshes.
Spatial batches share geometry buffers to reduce GPU memory use. `tools/forest/build_ancient_grove.py` authors the same
meshes and placements saved in `Assets/Art/Blender/Forest/AncientGrove.blend`.

`demo/features/forest/wildlife.js` provides harmless frogs, rabbits, pigs and
horses across 81 valid habitat cells. Animals spawn within 45 m of the
player, fade away beyond 65 m, and are capped at 16 active models. Shared
geometry, materials and a model pool avoid unbounded allocations. Roaming
respects tree/rock collisions and the forest boundary. Animals never damage
or physically trap the player. Nearby sightings unlock actual model renders
under the library's Wildlife category.

`demo/features/inventory/` groups the backpack code, CSS and simple chocolate
SVG. I or the HUD button opens the backpack; the lobby's Inventory button
also works. E picks up nearby world chocolate, prioritized over distant
landmark interactions. Touch interaction uses the same E action.

World cells of 64 x 64 m have a deterministic 25% chocolate candidate chance;
water, buildings, cliffs and obstructed positions are rejected, leaving
201 valid spots in the current map. One introductory drop sits near the
central plaza. Only nearby drops render, capped at 24. Each chocolate has a gently pulsing
golden glow sprite, visible even on Minimal without adding point lights. A collected spot
cannot respawn for five real minutes, including across reloads.

Use a chocolate inside the backpack during gameplay to consume one and gain
unlimited stamina for exactly 180 seconds of real time. The effect covers
sprinting, swimming, jumping and attacks; oxygen still drains normally.
The HUD shows infinity and a countdown. Effects do not stack, so another
chocolate cannot be accidentally consumed while one is active. The timer
keeps running in menus or after closing the game. Backpack counts, exact
expiry and pickup cooldowns save locally as `tsuventure_backpack_v1`.

Run `node tools/tests/verify_wildlife_backpack.js` for spawning/despawning,
roaming, harmless behavior, loot eligibility, actual keyboard pickup,
backpack and buff persistence, exact expiry and mobile layout. Forest gate,
guardian combat and natural traversal remain covered by
`verify_primordial_forest.js`.
