# Web game feature layout

Run the web game from `demo/index.html`; serve `demo/` as the HTTP root.
Related runtime code, generated data and web art now live together under
`demo/features/`:

| Folder | Content |
| --- | --- |
| `forest/` | Forest, guardian, wildlife, generated Blender mesh data |
| `inventory/` | Backpack, world loot, stylesheet and chocolate SVG |
| `characters/` | Character animation, dragon meshes and portraits |
| `castle/` | Castle runtime and exported geometry |
| `arena/` | Arena architecture, details and tunnels |
| `lake/` | Lake boss runtime and Blender meshes |
| `world/` | Terrain, lunar groundcover and shared realm data |
| `library/` | Encounter records and real-model image rendering |
| `survival/` | Stamina, swimming, oxygen and item-effect integration |
| `hud/` | Gameplay controls, responsive HUD and styles |
| `lobby/` | Lobby styles, settings, background art and video |

Forest authoring scripts are under `tools/forest/`; editable Blender scenes
are grouped in `Assets/Art/Blender/Forest/`. Existing Unity assets retain
their own asset tree. Browser test outputs stay in ignored
`demo/verification/`, separate from shipped art. All source references,
builders, tests and docs were updated when moving files.

After changing web assets, run `python tools/refresh_web_assets.py` to refresh
the entry point's local asset cache keys.
