import sys

INDEX_PATH = r"c:\Users\Admin\OneDrive\Máy tính\Desktop\CODE\Tsukiezz\projects\GameTsukiezz\demo\index.html"

with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

is_crlf = '\r\n' in content
content = content.replace('\r\n', '\n')

old_declaration = """        // Shared Materials
        const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.2 });
        const matSteel = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.9, roughness: 0.25 });
        const matCapeRed = new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.65, side: THREE.DoubleSide });
        const matRobePurple = new THREE.MeshStandardMaterial({ color: 0x2d0b59, roughness: 0.6, side: THREE.DoubleSide });
        const matCyanGlow = new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 1.5, roughness: 0.2 });
        const matPurpleGlow = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 2.5, roughness: 0.2 });"""

target_place = """        scene.add(stars);

        // =====================================================================
        // CORE SHARED GLOW & METALLIC MATERIALS
        // =====================================================================
        const matGold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.2 });
        const matSteel = new THREE.MeshStandardMaterial({ color: 0xb0c4de, metalness: 0.9, roughness: 0.25 });
        const matCapeRed = new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.65, side: THREE.DoubleSide });
        const matRobePurple = new THREE.MeshStandardMaterial({ color: 0x2d0b59, roughness: 0.6, side: THREE.DoubleSide });
        const matCyanGlow = new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 1.5, roughness: 0.2 });
        const matPurpleGlow = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 2.5, roughness: 0.2 });"""

if old_declaration not in content:
    print("ERROR: old_declaration not found")
    sys.exit(1)

content = content.replace(old_declaration, "// Shared Materials declared at top level")

stars_needle = "        scene.add(stars);"
if stars_needle not in content:
    print("ERROR: stars_needle not found")
    sys.exit(1)

content = content.replace(stars_needle, target_place, 1)

if is_crlf:
    content = content.replace('\n', '\r\n')

with open(INDEX_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Moved shared materials to top level before any usage!")
