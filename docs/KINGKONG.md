# King Kong Boxer — guardian

Fourth playable character: `kingkong`, with a cute brown gorilla silhouette,
red boxing gloves, blue-and-gold pauldrons and a crescent chest emblem.
The Blender mesh uses six pivots and the same shared animation contract as
the other characters. Player scale remains 0.2; visible height is about
0.59 m. Character art, runtime and model data are grouped under
`demo/features/characters/kingkong/`. Portrait provenance and exact prompt
are recorded in that folder's `ART.md`.

The card has four ratings: strength 90, defense 100, magic 20 and speed 65.
It supports Vietnamese and English, mouse and keyboard selection, and
four/two/one-column layouts for desktop/tablet/mobile. Playable characters
remain excluded from the encounter library.

Boxing uses alternating left/right jabs, a guard stance, torso rotation and
smooth arm extension/recovery. The character also supports walking,
sprinting, jumping/falling, sitting/standing, swimming and diving. Switching
characters or returning to the lobby resets its pose and cancels attacks.
The shared stamina, oxygen and chocolate systems apply normally.

Each punch deals 135 melee damage once per swing, using the existing stamina
cost and attack timing. Both lake bosses and the Forest Guardian accept
the boxing attacks. The guardian role reduces incoming monster damage by
20% before armor absorption. Other characters' incoming damage, water-only
targeting and bridge immunity remain unchanged. Oxygen deprivation is
unaffected by this combat passive.

Build: `E:\blender.exe --background --python tools/characters/build_kingkong.py`.
Scene: `Assets/Art/Blender/Characters/KingKongGuardian.blend`.

Validation: `verify_kingkong.js` covers selection, alternating jabs, actual
combat, both monster damage paths, recovery, keyboard controls and responsive
bilingual UI. `verify_hero_animation.js` now checks four characters at
15/30/60/144 FPS (115 checks). `verify_survival_library.js` includes King Kong
in swimming/diving and character-exclusion checks.
