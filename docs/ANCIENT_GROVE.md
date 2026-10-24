# Primordial Forest and disguised Forest Guardian

Region name: Rung Nguyen Sinh / Primordial Forest. The rectangular forest
is now 294 x 284 m (three times its former 98 x 284 m area), from x=148 to
442 and z=-244 to 40. The original 111 m elder remains at (202, -206).
Nine tree families, bushes, mushrooms and rocks now provide 3896 instances,
all inside the titanium enclosure. See `BACKPACK_WILDLIFE.md` for density,
nearby wildlife streaming and chocolate loot. Essential trees remain on
Minimal, while small optional flora can be disabled.

The titanium enclosure follows the same terrain height field as the world.
Panels have solid lower plates, metal rails, bars and reinforced posts,
roughly 9 m above local ground. Physical barriers close the full perimeter
except a single nominal 8 m southern entrance at (290, 40). Fast travel
always lands outside at (290, 48). There is no rendered or reserved trail.
Natural gaps remain traversable between trunks, including to both the elder
and the guardian. Elder discovery still saves locally, but never bypasses
the entrance with direct interior fast travel.

Build the environment with:
`E:\blender.exe --background --python tools/forest/build_ancient_grove.py`.
Review: `Assets/Art/Blender/Forest/AncientGrove.blend`.
Runtime: `demo/features/forest/ancient-grove.js`, `demo/features/forest/data/ancient-grove.js`.

The Forest Guardian at (340, -150) has 7000 HP. It disguises itself using the
same ordinary fern-tree mesh as its neighbours. Within 20 m, it transitions
to an articulated bark giant with root legs, knotted arms, a carved face,
branching antlers and foliage. Beyond 32 m, or outside the forest, it stops
attacking and returns to its tree disguise. Lost health remains lost while
changing forms. It is rooted in place and attacks via a 1.2 s warning circle
before a root strike, dealing 32 armor-first damage. Move out of the marked
area to evade. Menus pause attacks. All three character attacks can damage
it, with trunks blocking ranged strikes. Death disables its collision and
saves the defeated mark in the library; player defeat returns to the gate.
Boss health resets on page reload, consistent with the lake bosses.

Build: `E:\blender.exe --background --python tools/forest/build_forest_guardian.py`.
Review: `Assets/Art/Blender/Forest/ForestGuardian.blend`, containing six
pivot joints and a branch-swing demonstration animation. Runtime:
`demo/features/forest/forest-guardian.js`, `demo/features/forest/data/forest-guardian.js`.

Library thumbnails now render actual runtime meshes for monsters and NPCs,
and actual scenes for places (`demo/features/library/library-previews.js`). A reusable
render target captures images once per discovered entry without changing
the gameplay camera, viewport, adaptive resolution or fog. Unknown entries
stay locked; playable characters remain outside the library.

Run `node tools/tests/verify_primordial_forest.js` for perimeter sampling,
actual gate traversal, natural-route walking, terrain alignment, elder
scale/discovery, transformation, combat with all characters, recovery,
real-model thumbnails, graphics visibility and saved discoveries. The old
`verify_ancient_grove.js` entry point delegates to this replacement suite.
Review images and JSON reports go to ignored `demo/verification/`.
