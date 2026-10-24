# Cute Dragon Knight

The jade dragon is a third playable hero alongside Hamster Knight and Rabbit
Mage. It shares the existing movement, collision, jump, sitting and sword attack
systems. Short wings and a curled tail have secondary animation. Collision size
and movement speed remain the same as the original heroes.

## Files

- `tools/characters/build_dragon_knight.py`: standalone Blender authoring script.
- `Assets/Art/Blender/Characters/DragonKnight.blend`: editable Blender collection.
- `demo/features/characters/dragon-knight/model.js`: exported mesh data and pivots.
- `demo/features/characters/dragon-knight/portrait-art.png`: final fantasy portrait used by the card.
- `demo/features/characters/dragon-knight/portrait.png`: 3D model preview for authoring.
- `demo/features/characters/dragon-knight.js`: batched renderer and existing limb bindings.
- `tools/tests/verify_dragon_knight.js`: gameplay checks and portrait rendering.

Run the authoring script in Blender through MCP, then run
`node tools/tests/verify_dragon_knight.js` with the local demo server running.
The test renders the authoring preview from the game meshes; it never overwrites the final fantasy art. Vietnamese
and English names/descriptions are in `demo/features/lobby/lobby-settings.js`.

## Project organization

Runtime files stay in `demo/`; browser data and portraits are under
`demo/features/characters/`. Editable art stays in `Assets/Art/Blender/`.
Authoring tools are grouped in `tools/characters/`, media tools in `tools/media/`,
and browser checks in `tools/tests/`. `verify_heroes.js` runs the current hero
checks; the obsolete three-hero tests and removed character exports are gone.

`.runtime/` contains regeneratable export data used by the Blender arena sync.
`demo/verification/` contains ignored screenshots and reports. These are kept
apart from runtime assets. Unity `Packages/` and `ProjectSettings/` are retained.
Blender `.blend1`/`.blend2` backups and exports for the removed unicorn, demon
dragon and ninja were deleted; the separate castle unicorn remains in use.

## Art and animation update

The four display bars use the melee knight layout and values (90/95/45/75).
They are comparison bars, not a new combat damage calculation.
`demo/features/characters/hero-animation.js` controls all three heroes with delta-time
blending, saved rest poses, walk/run cadence, jump/fall distinction, landing,
sit/stand transitions, attack windup/strike/recovery, and secondary appendages.
Physics remains in the game loop. Turning uses the shortest angular path.
Attacks last 0.5 seconds and are cancelled on returning to the lobby.
Run `node tools/tests/verify_hero_animation.js` for the pose checks at
15/30/60/144 FPS and `verify_dragon_knight.js` for actual controls.
Art generation details are in `DRAGON_PORTRAIT_PROMPT.md`.
