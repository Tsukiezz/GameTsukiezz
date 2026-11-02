# Web game feature layout

Run the web game from `demo/index.html`; serve `demo/` as the HTTP root.
Related runtime code, generated data and web art now live together under
`demo/features/`:

| Folder | Content |
| --- | --- |
| `forest/` | Forest, guardian, wildlife, generated Blender mesh data |
| `inventory/` | Backpack, world loot, temple supplies, healing, timed vision and equipment |
| `characters/` | Character animation, dragon meshes and portraits |
| `castle/` | Castle runtime and exported geometry |
| `arena/` | Arena architecture, details and tunnels |
| `lake/` | Lake boss runtime and Blender meshes |
| `world/` | Terrain, lunar groundcover, diverse flora, roaming wildlife and seam repairs |
| `world/*expansion*`, `world/antarctic-realm.js` | 6.72 km terrain, dense connected rivers, factory, polar art |
| `world/snow-queen.js`, `world/santa-gifts.js` | Snow Queen freezing combat, flying reindeer sleigh and persistent falling gift chests |
| `survival/player-life.js` | Fall impact damage and common initial-spawn recovery |
| `volcano/` | Raised caldera, fatal lava, War Dragon, eruptions and lava-sword equipment |
| `mountain/` | Bach Khuyet trails and sabertooth |
| `river/` | Braided river, bridges, hot spring, waterfall and wildlife |
| `mangrove/` | Blender tidal forest, drowned sanctuary, swamp crocodile and ancient fragment |
| `library/` | Encounter records and real-model image rendering |
| `cavern/` | Underground Evil God maze, unlit rendering, sentinels and cave monsters |
| `survival/` | Stamina, swimming, oxygen and item-effect integration |
| `hud/` | Gameplay controls, responsive HUD and styles |
| `lobby/` | Lobby styles, settings, background art and video |

Forest authoring scripts are under `tools/forest/`; editable Blender scenes
are grouped in `Assets/Art/Blender/Forest/`. The unused Unity prototype was
removed on 2026-10-27. Browser test outputs stay in ignored
`demo/verification/`, separate from shipped art. All source references,
builders, tests and docs were updated when moving files.

After changing web assets, run `python tools/refresh_web_assets.py` to refresh
the entry point's local asset cache keys.

Cleanup inventory and retention rules: [PROJECT_CLEANUP.md](PROJECT_CLEANUP.md).

Motion, bounded dragon flight and temple supplies: [ANIMATION_AND_TEMPLE_SUPPLIES.md](ANIMATION_AND_TEMPLE_SUPPLIES.md).
