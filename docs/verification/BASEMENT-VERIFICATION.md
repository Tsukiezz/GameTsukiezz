# Basement navigation and armory

Start the demo server as described in CASTLE-VERIFICATION.md, then run these
sequentially (they share the Chrome debugging port):

```powershell
node tools/tests/verify_basement.js
node tools/tests/verify_castle.js
node tools/tests/verify_graphics.js
```

Basement fixes:

- Split the shelter partition around an actual doorway, with a matching arch.
- Move the war table, its chairs and the alchemy bench clear of the crypt stairs.
- Widen the passage behind the basement stair and move the fireplace away from
  its lower landing. Keep visible furniture and its collision aligned.
- Allow motion in the previously blocked 4.8–5.0m height band inside the basement.
- Ignore wall tops flush with the player's feet: the crypt walls end exactly at
  the upper basement floor and previously created invisible barriers there.
- Allow tangential contact within a one-micrometre tolerance, preventing float
  rounding from catching the character on chest corners and cell bars.

The Blender generator builds eight knight exhibits, two dragon sword display
tables, book cabinets and supply chests across the two basement levels. Curved
armor, helmets, dragon wings and blade tips export actual triangulated meshes.
Each exhibit has a simple collision footprint; small relief details do not snag
the player. Decorative parts are baked by material to reduce draw calls.

The basement suite has 12 checks. With the castle-wide furnishings, a 0.5m
navigation grid now finds 4,528 connected floor points in the upper basement and
958 in the deep crypt after the room partitions. Midpoint checks
prevent paths crossing thin barriers. The real movement/vertical functions then
walk routes to the corners and through the shelter doorway. This does not prove
every possible movement, jump, input or camera position is bug-free.

The existing castle suite passes 161 checks; graphics profile checks also pass.
Screenshots are generated into demo/verification, including basement-armory.png,
basement-knights.png, crypt-armory.png and shelter-doorway.png.

Use the **Phòng Vũ Khí** tour button to inspect the new exhibits. Press E near
a sword display for its description. Gameplay changes apply to the web demo;
the source extension is also saved in CastleExtension.blend.
