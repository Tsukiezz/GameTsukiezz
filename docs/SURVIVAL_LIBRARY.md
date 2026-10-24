# Swimming, stamina and journey library

All three heroes use `demo/features/survival/player-survival.js`. Stamina powers sprinting,
fast swimming, jumping (12) and attacks (8), regenerates while resting, and
locks sprinting at exhaustion until 20 stamina returns. Normal swimming
costs less; exhaustion makes the hero float upward.

In Mercury Lake, WASD swims, Space ascends, Q or Ctrl dives, and Shift swims
faster. Touch controls provide ascent and dive buttons. Oxygen appears only
while swimming, drains with the head submerged (25 seconds from full), and
recovers at the surface. Empty oxygen damages health directly; defeat
returns the hero to the safe stone bridge with restored vitals. Menus pause
simulation. Underwater camera fog and a shared swimming pose apply to all
three heroes. The Blender lake floor is -72 m, below the water at 1.2 m.

The two lake bosses patrol at varying depths and fully submerge. They chase
swimmers vertically and independently reject damage to players on dry land
or on the bridge. Their existing 10000 / 7000 HP and combat remain intact.

`demo/features/world/lunar-biome.js` gives the terrain and forest floor a shared neutral
lunar crater texture. 10480 mutant grass clumps use spatially culled instance
batches, avoid buildings and water, and have no blocking collision. Minimal
retains 2182 base clumps and hides the additional detail layer.

The book button (or B) opens `demo/features/library/field-guide.js`: monsters, NPCs and
places. Playable characters are managed in the separate Character menu and
are excluded from library entries and discovery totals. Monsters require a visible encounter
or close underwater encounter; locations and NPCs require proximity. Locked
entries reveal no identity or stats. Discoveries and defeated marks persist
in localStorage `tsuventure_field_guide_v1`. The library follows the saved
Vietnamese/English setting and pauses gameplay while open.
Known entries use renders of actual game models and locations, captured by
`demo/features/library/library-previews.js`. The 7000 HP disguised Forest Guardian is also
registered on encounter; see `ANCIENT_GROVE.md`.

Validation: `node tools/tests/verify_survival_library.js` checks 35 behavior
cases plus actual keyboard diving/ascent, B, focus restoration, English and
discovery persistence across reload. Regression suites cover hero animation,
lake combat, expanded map navigation, safety and graphics. Artifacts go to
the ignored `demo/verification/` folder.
