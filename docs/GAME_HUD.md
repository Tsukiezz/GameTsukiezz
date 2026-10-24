# Gameplay interface

The gameplay HUD now uses `demo/features/hud/game-hud.css` and `demo/features/hud/game-hud.js`.
Existing status elements and destination handlers are retained and moved
into the new layout at startup, preserving the game state and character UI.

- Compact player card at the upper left, with location just below it.
- Upper-right actions for destinations, heroes, settings, help and home.
- All 16 travel destinations in a scrollable panel, grouped into World and
  Castle. The former development label for the expanded floor is now a
  reception-room destination.
- Lower-right minimap and a short lower-left keyboard reminder.
- Contextual interaction prompt above the lower controls; detailed keyboard
  instructions are available from the question-mark menu.
- On coarse-pointer devices, a directional pad and attack/jump/interact
  buttons replace the keyboard reminder. Dragging the canvas rotates view.

Only one HUD panel can be open. Escape closes panels and character/settings
modals. HUD clicks do not attack, panel scrolling does not zoom the camera,
modal keyboard input does not move the player, and focus loss releases keys.
Touch actions respect dialogue state. A fixed viewport-sized canvas prevents
mobile layout inflation from the renderer's previous inline pixel size.

The HUD is hidden completely on the home screen. At short landscape heights,
the map is hidden on touch devices to leave room for controls. The map remains
visible during normal desktop play. FPS remains available on wide screens;
all graphics presets are still accessible through settings/help.

Validation: `node tools/tests/verify_hud.js` checks 1280x800, 1920x1080,
768x1024, 390x844 and 844x390 layouts, panel reachability, real browser clicks,
touch direction/release, touch camera drag, modal input and home visibility.
Screenshots and the report are under `demo/verification/`. Responsive and
touch checks use Chrome emulation rather than a physical device lab.
