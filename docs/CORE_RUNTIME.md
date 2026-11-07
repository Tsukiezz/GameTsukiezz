# Core runtime files

The former inline JavaScript in `demo/index.html` is split into five classic
scripts, loaded synchronously at the same location after the game's HTML:

1. `demo/core/audio.js`: SoundFX, the shared SFX instance and button listeners.
2. `demo/core/hero-models.js`: hamster/rabbit builders and hero selection.
3. `demo/core/castle-builder.js`: the castle model, colliders and interactions.
4. `demo/core/game-loop.js`: the animation, movement and rendering loop.
5. `demo/core/runtime.js`: shared state, scene setup, physics, controls, UI and
   the original ordered feature installation calls.

The three definition files contain only function declarations. They run before
runtime initialization so calls that previously depended on function hoisting
continue to work. Function bodies and executable statements were extracted
without changes. The scripts intentionally share the existing global lexical
scope; do not add `type="module"`, `async`, wrappers or `defer` independently.

Keep feature installation order in `runtime.js`. Run
`python tools/refresh_web_assets.py` after changing shipped scripts to update
the entry page's content-based cache keys.

The desktop launcher serves these files from the adjacent `demo` folder. The
portable build includes them automatically through `tools/desktop/build_exe.py`.
Standalone EXE copies require rebuilding to include source changes.

Validation: `tools/tests/verify_current_map.js` checks every core and feature
asset and observes a fresh browser reload for early runtime/network errors.
The existing castle and player-experience suites exercise shared global state,
collision helpers, model switching, input and persistence.

## Refactor verification (2026-11-03)

- Entry page reduced from 5,344 to 1,531 lines.
- Reconstructed the original inline source from the extracted files and checked
  exact code preservation, including keeping hero initialization in its original
  position in the runtime.
- Checked JavaScript syntax and all 146 local HTML asset links/cache keys.
- Found 18 referenced assets absent from the working folder. Restored only those
  missing files from the pre-refactor EXE, with SHA-256 verification against its
  original manifest. This includes actor animation and forest audio assets.
- Compared the rebuilt package against the old manifest: `index.html` is the
  only changed existing asset; the five `core/*.js` files are the only additions.
  All model, audio, gameplay feature and other existing asset bytes match.
- Rebuilt `Tsuventure.exe`; all 17 portable EXE checks passed, including verifying
  the hashes of all 185 packaged files.
- The real-browser castle suite passed 71/71 movement, stairs and prison checks
  with no JavaScript runtime errors. Report:
  `.runtime/index-refactor/final-castle/compact-report.json`.

The original entry page, EXE and build manifest are preserved under
`.runtime/index-refactor/`. Source verification details are in
`.runtime/index-refactor/final-source.json`.

This change improves code organization and browser caching. It does not claim
an FPS improvement or change game balance or saved-game formats.
