"""Editable Blender vegetation for the living Moonwell mountain."""
import math
import random
import bpy


def build_mountain_ecology(ground, trail_near, spring, ellipsoid, object_mesh, materials, collection):
    rng = random.Random(247019)
    prototypes, instances = {}, []

    def merged(entries):
        bins = {}
        for material, (vertices, indices) in entries:
            target = bins.setdefault(material, dict(material=material, vertices=[], indices=[]))
            offset = len(target['vertices'])
            target['vertices'].extend(vertices)
            target['indices'].extend(i + offset for i in indices)
        return list(bins.values())

    def branch(a, b, radius, tip=.08, segments=7):
        # Build a tapered branch around an arbitrary axis.
        from mathutils import Vector
        axis = (Vector(b) - Vector(a)).normalized()
        right = axis.cross(Vector((0, 0, 1)))
        if right.length < .1:
            right = axis.cross(Vector((1, 0, 0)))
        right.normalize()
        up = axis.cross(right).normalized()
        vertices, indices = [], []
        for center, r in [(a, radius), (b, tip)]:
            for i in range(segments):
                v = Vector(center) + (right * math.cos(i * math.tau / segments) + up * math.sin(i * math.tau / segments)) * r
                vertices.append(list(v))
        for i in range(segments):
            j = (i + 1) % segments
            indices.extend([i, j, i + segments, j, j + segments, i + segments])
        return vertices, indices

    entries = [('bark', branch((0, -.35, 0), (.15, 5.8, 0), .48, .18))]
    for i in range(7):
        angle = i * 2.4
        end = (math.cos(angle) * (2.5 + i % 2), 5.3 + i % 3 * .75, math.sin(angle) * (2.5 + i % 2))
        entries.append(('bark', branch((.1, 2.7 + i * .25, 0), end, .19, .05)))
        for j in range(3):
            center = (end[0] + math.cos(j * 2.1) * .9, end[1] + .55 + j * .22, end[2] + math.sin(j * 2.1) * .9)
            entries.append((['blossom', 'blossomLight', 'blossomDeep'][(i + j) % 3], ellipsoid(center, (1.6, 1.05, 1.45), 9, 5)))
    entries.append(('blossomLight', ellipsoid((0, 7.2, 0), (2.5, 1.3, 2.3), 10, 5)))
    prototypes['cherry'] = merged(entries)

    entries = [('bark', branch((0, -.3, 0), (0, 9.5, 0), .38, .06))]
    for y, radius in [(3.4, 2.8), (5, 2.4), (6.6, 1.9), (8, 1.3)]:
        vertices = [[0, y + 2.8, 0]] + [[math.cos(i * math.tau / 9) * radius, y, math.sin(i * math.tau / 9) * radius] for i in range(9)]
        indices = []
        for i in range(9):
            indices.extend([0, i + 1, (i + 1) % 9 + 1])
        entries.append(('pineLeaf', (vertices, indices)))
    prototypes['pine'] = merged(entries)
    prototypes['bush'] = merged([('leafGreen', ellipsoid((-.6, .65, 0), (1, .8, 1), 8, 4)), ('leafLight', ellipsoid((.5, .9, .2), (.9, 1, .85), 8, 4))])

    vertices, indices = [], []
    for i in range(7):
        a = i * 2.4
        x, z, h = math.cos(a) * .2, math.sin(a) * .2, .4 + i % 3 * .15
        offset = len(vertices)
        vertices.extend([[x - .055, 0, z], [x + .055, 0, z], [x + math.cos(a) * .2, h, z + math.sin(a) * .25]])
        indices.extend([offset, offset + 1, offset + 2, offset + 2, offset + 1, offset])
    prototypes['grass'] = merged([('grassGreen', (vertices, indices))])
    flower_entries = [('leafGreen', branch((0, 0, 0), (0, .65, 0), .025, .015, 5))]
    for i in range(5):
        a = i * math.tau / 5
        vertices=[[0,.65,0],[math.cos(a-.45)*.22,.67,math.sin(a-.45)*.22],[math.cos(a)*.34,.65,math.sin(a)*.34],[math.cos(a+.45)*.22,.67,math.sin(a+.45)*.22]]
        flower_entries.append(('wildflower',(vertices,[0,1,2,0,2,3])))
    flower_entries.append(('pollen', ellipsoid((0, .69, 0), (.07, .04, .07), 6, 2)))
    prototypes['flower'] = merged(flower_entries)
    fern_entries = []
    for i in range(7):
        a = i * math.tau / 7
        vertices, indices = [], []
        for j in range(5):
            r = .15 + j * .18
            center = (math.cos(a) * r, .25 + math.sin(j / 5 * math.pi) * .5, math.sin(a) * r)
            off = len(vertices)
            width = .24 * (1 - j / 6)
            vertices.extend([list(center), [center[0] - math.sin(a) * width, center[1] + .04, center[2] + math.cos(a) * width], [math.cos(a) * (r + .22), center[1] + .04, math.sin(a) * (r + .22)]])
            indices.extend([off, off + 1, off + 2, off + 2, off + 1, off])
        fern_entries.append(('leafLight', (vertices, indices)))
    prototypes['fern'] = merged(fern_entries)

    def suitable(x, z, clearance):
        if not (-985 < x < -535 and 425 < z < 875) or math.hypot(x + 760, z - 650) > 227:
            return False
        pond = math.hypot((x - spring['x']) / spring['rx'], (z - spring['z']) / spring['rz'])
        if pond < 1.16 or trail_near(x, z)[0] < clearance or (x > -706 and z < 636):
            return False
        y = ground(x, z)
        slope = math.hypot((ground(x + 1, z) - ground(x - 1, z)) / 2, (ground(x, z + 1) - ground(x, z - 1)) / 2)
        return y > 5 and slope < (2.15 if clearance > 4 else 2.8)

    tree_positions = []
    for i in range(24):
        a = i * math.tau / 24
        x, z = spring['x'] + math.cos(a) * 68, spring['z'] + math.sin(a) * 52
        if suitable(x, z, 7):
            tree_positions.append((x, z))
            instances.append(dict(kind='cherry', x=x, y=ground(x, z), z=z, scale=.95 + rng.random() * .4, rotation=a))
    for _ in range(1600):
        if len(tree_positions) >= 105:
            break
        a, r = rng.random() * math.tau, math.sqrt(rng.random()) * 224
        x, z = -760 + math.cos(a) * r, 650 + math.sin(a) * r
        if abs(math.hypot((x-spring['x'])/62,(z-spring['z'])/48)-1)>.085 and suitable(x, z, 7) and all(math.hypot(x - tx, z - tz) > 11 for tx, tz in tree_positions):
            tree_positions.append((x, z))
            instances.append(dict(kind='cherry' if rng.random() < .6 else 'pine', x=x, y=ground(x, z), z=z, scale=.7 + rng.random() * .65, rotation=rng.random() * math.tau))
    for kind, attempts in [('bush', 320), ('fern', 650), ('flower', 2400), ('grass', 4800)]:
        for _ in range(attempts):
            a, r = rng.random() * math.tau, math.sqrt(rng.random()) * 228
            x, z = -760 + math.cos(a) * r, 650 + math.sin(a) * r
            if suitable(x, z, 4.8 if kind == 'bush' else 3.8):
                instances.append(dict(kind=kind, x=x, y=ground(x, z), z=z, scale=.6 + rng.random() * .8, rotation=rng.random() * math.tau))
    for kind, pieces in prototypes.items():
        sources = []
        for i, p in enumerate(pieces):
            src = object_mesh('MoonwellPrototype_' + kind + '_' + str(i), p['vertices'], p['indices'], p['material'])
            src.hide_render = src.hide_viewport = True
            sources.append(src)
        for i, p in enumerate(q for q in instances if q['kind'] == kind):
            for src in sources:
                obj = bpy.data.objects.new('Moonwell_' + kind + '_' + str(i), src.data)
                collection.objects.link(obj)
                obj.location = (p['x'], -p['z'], p['y'])
                obj.rotation_euler.z = -p['rotation']
                obj.scale = (p['scale'],) * 3
    return dict(prototypes=prototypes, instances=instances)
