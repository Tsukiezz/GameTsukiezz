"""Save surveyed walking routes so normal game startup needs no path search."""
import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--accept-cache-miss', action='store_true',
                    help='Bake a fully walked rebuild when only the old-cache assertion fails.')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
report_path = root / 'demo/verification/terrain-traversal/report.json'
payload = json.loads(report_path.read_text(encoding='utf-8'))
if payload.get('errors'):
    raise SystemExit('Fix the browser errors before baking walking surfaces.')
report = payload['report']
failed = [check for check in report['checks'] if not check['ok']]
expected_cache_miss = (args.accept_cache_miss and failed
                      and all(check['name'] == 'Normal startup uses baked walking surfaces' for check in failed)
                      and report.get('walked', 0) >= 100000
                      and not report.get('walkingFailures') and not report.get('fallEvidence')
                      and not report.get('failures'))
if failed and not expected_cache_miss:
    raise SystemExit('Fix the failed traversal checks before baking walking surfaces.')
design = report['design']
for kind in ('station', 'summit', 'foothill'):
    ids = {route['village'] for route in design['routes'] if route['kind'] == kind}
    if len(ids) != 23:
        raise SystemExit(f'Cannot bake incomplete {kind} routes: {len(ids)}/23')
target = root / 'demo/features/world/data/highland-walking-routes.js'
for route in design['routes']:
    for field in ('profile', 'floors', 'tops'):
        if field in route:
            route[field] = [[round(v, 6) for v in p] for p in route[field]] if field == 'profile' else [round(v, 6) for v in route[field]]
target.write_text('// Surveyed against the current canonical terrain and village stations.\n'
                  'window.HIGHLAND_WALKING_ROUTES='
                  + json.dumps(design, ensure_ascii=True, separators=(',', ':')) + ';\n',
                  encoding='utf-8')
print(f'Saved {len(design["routes"])} surveyed paths: {target.name}')
