# Castle interiors

The rooms are stylized original game assets based on historical references;
they are not exact replicas of every object or room in these properties.

Reference sources:

- Windsor Castle, Royal Collection Trust: arms and armor, paintings, ornate
  furniture and State Banquet china.
  https://www.rct.uk/visit/windsor-castle/highlights-of-windsor-castle
- Hampton Court Great Hall, Historic Royal Palaces: a great hall with tapestries;
  the visitor guide also shows dining tables in the hall.
  https://www.hrp.org.uk/hampton-court-palace/whats-on/great-hall/
  https://www.hrp.org.uk/media/xwlpahx5/367_hcp-cas-resource-sept23-web.pdf
- Versailles King's Apartment: ceremonial state bedchamber and private rooms.
  https://en.chateauversailles.fr/discover/estate/kings-apartments
- Versailles Hall of Mirrors: gilded mirror gallery and ceremonial receptions.
  The game uses opaque decorative mirror panels, avoiding costly reflections.
  https://en.chateauversailles.fr/discover/estate/palace/hall-mirrors

| Level | Furnishing zones |
| --- | --- |
| Deep crypt (-5m) | Dragon sword, armored guards, relics and storage |
| Basement (1m) | Armory, supply chests, library cabinets, original shelter furniture |
| Great hall (6m) | Banquet tables, carved chairs, runners, plates, goblets, candles, armor and portraits |
| Reception landing (9.5m) | Dining groups, settees, bookcases, mirrors and chests |
| Royal floor (13m) | Four-poster bed, sitting area, library, dragon display and armor |
| Attic (20m) | Spare bedroom, reading/study furniture, relic display and storage |
| Balconies | Small seating groups on either side of the door |

Assets are built by Blender through `tools/build_castle_extension.py`, using the
library in `tools/castle_furnishings.py`. The generated .blend and browser geometry
stay synchronized; the generator versions script URLs by their contents.

Props use a simple footprint instead of separate collision on tiny legs, studs
or carved decorations. Furniture can support a jumping/falling character, while
its low step threshold prevents walking directly through tabletops. If a load or
landing starts a grounded character inside furniture, recovery searches for the
nearest clear position on the same floor. No floor changes are allowed during
recovery. Structural walls and stairs retain their independent collision.

Checks: run `node tools/tests/verify_interiors.js`, `node tools/tests/verify_castle.js`,
`node tools/tests/verify_basement.js` and `node tools/tests/verify_graphics.js` sequentially
against the running demo. Reports and screenshots go to `demo/verification/`.
The interiors check tests walking routes, room connectivity, escape from each
new furniture footprint and landing on each item. It cannot guarantee every
possible input sequence or all real-world hardware performance.

Validation: 14 interiors checks passed, including escape and landing tests for
all 59 new furniture footprints. The castle suite passed 161 checks and the
basement suite passed 12; graphics profile checks also passed. The 6m hall grid
has 14 samples around its stair opening not reachable by a flat route, while
the actual stair traversal is covered separately by the castle suite. The other
three furnished upper-floor grids are fully connected at the sampled resolution.

## Room furnishing and floating-art repair

`tools/castle_room_details.py` runs after relocation and adds paintings and two
wall sconces to each of 30 main rooms. It adds 30 usable furniture assemblies
(89 total), selecting collision-free corners outside door and stair aprons.
Library rooms get bookcases; dining rooms get consoles and tableware; other
rooms get display furniture. The former tea room on 9.5 m is now a ballroom,
with an open centre and floor inlay. Existing royal bedroom, museum and vault
remain. The source scene is rebuilt in Blender and exported to browser geometry.

Legacy portraits and mirrors incorrectly inherited the last furniture assembly
ID; when the chair/table moved, the wall art moved with it. These decorations
now have independent ownership and explicit wall attachment. Portraits and
mirrors occupy different wall bays to avoid overlap. Canvas materials use the
existing game illustrations and preserve UVs in batching.

`node tools/tests/verify_castle_decor.js` checks attachment, room details and real
left/right direction reversal. `verify_compact.js` checks actual routes through
rooms, stairs, and the prison. Hero world velocity now blends across reversals,
and yaw follows the shortest path with a slower smoothing rate. Physics stays
shared by all three heroes.

## Hero-scale furniture pass

The hero is approximately 0.65 m tall. `castle_furniture_scale.py` shrinks whole
legacy assemblies about their own floor-level anchors (0.525x furniture, 0.375x
armor/weapon exhibits). Meshes, exported vertices, hidden collision volumes
and Blender objects change together. Native legacy furniture in index.html
uses begin/finishHeroFurniture with matching colliders and animation offsets.
The throne dais, doors, stairs and room architecture keep their original size.
Wall art and sconces are resized around their wall/floor anchors.
These sizes are 1.5 times the previous pass. All additional room props also
grow by 1.5, with their larger footprints checked before placement.

Every non-corridor room gets eight new small functional pieces, except the
prison cell which gets four. This adds 260 pieces across 33 rooms, for 349 total
manifest assemblies. Furniture is tested against reserved door aprons, stair
envelopes and occupied footprints. The ballroom centre stays clear.

Checks: verify_furniture_scale.js, verify_compact.js, verify_interiors.js and
verify_graphics.js. All 349 furniture volumes pass escape and landing checks.

## Bridge, gate NPCs and settings

The bridge supports only players on or above its deck; ground-level traversal
uses the terrain underneath. Its underside stops upward jumps. Exterior
foundation walls reach below ground rather than leaving an open bottom edge.
`castle_gate_guards.py` authors two royal NPCs in Blender. They raise an arm
before the gate moves on E, then return to their idle pose. They have no combat
or dialogue behavior. Closing rechecks the player at the threshold.

Settings keep a draft until Save changes is clicked. Language, sound and graphics
apply immediately on save and survive reload. Reopening discards unsaved edits.
The HUD displays labelled health and armor bars bound to gameState values.
`verify_castle_update.js` checks these behaviors and persistence in Chrome.
