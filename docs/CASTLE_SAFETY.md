# Floor, partition and entrance repair

`tools/castle_safety.py` adds visible floor slabs with matching support and
collision. The original upper floors stopped before the interior face of the
outer walls. New slabs overlap that face, closing the perimeter strips. Lower
parts of the basement, crypt and attic stair openings are covered, leaving only
the space the final risers require for headroom. Low guards protect their sides.

Grounded walking rejects unsupported drops outside authored stair/ramp paths.
Jumping keeps gravity. A last-resort recovery returns an invalid castle fall to
the last clear, supported floor position nearby, excluding normal stair/ramp
travel. This supplements the visible repairs rather than adding invisible floors.

Room partitions now have fewer, properly enclosed room bays. Protected routes
get bounded doorways with solid lintels instead of broad full-height cuts.
Only the rising attic stair retains the full-height structural opening it needs.
Wall joints overlap slightly to close hairline seams. Narrow west galleries have
their own doors so closing the partitions does not trap the player there.

The redesigned gate uses visible portal jambs aligned with the facade. Its two
leaves slide behind the front wall to reveal one broad central passage. The old
narrow throat and low upper closure were removed because they hid the door relief.

New check: `node tools/tests/verify_safety.js` (with the demo HTTP server running).
It probes upper-floor support outside stair paths, raycasts partitions from both
sides, verifies one gate opening and tests invalid-fall recovery. It writes its
report and screenshots under demo/verification. Other movement, furniture, room,
basement and graphics suites remain relevant and must run sequentially because
they share Chrome's debugging port. Sampling cannot prove every possible position
or input sequence is free of bugs.
