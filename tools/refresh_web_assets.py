"""Refresh cache keys for local assets referenced by the demo entry point."""
from pathlib import Path
import hashlib
import re
import json

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / 'demo'
page = WEB / 'index.html'

def refresh(match):
    attribute, quote, url = match.groups()
    if url.startswith(('http:', 'https:', '//', 'data:', '#')):
        return match.group()
    relative = url.split('?', 1)[0]
    asset = (WEB / relative).resolve()
    if not asset.is_relative_to(WEB.resolve()) or not asset.is_file():
        return match.group()
    digest = hashlib.sha256(asset.read_bytes()).hexdigest()[:12]
    return f'{attribute}={quote}{relative}?v={digest}{quote}'

manifest_path = WEB / 'core/boot-manifest.json'
if manifest_path.is_file():
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    for index, url in enumerate(manifest['scripts']):
        relative = url.split('?', 1)[0]
        asset = WEB / relative
        if not asset.is_file():
            raise FileNotFoundError(asset)
        manifest['scripts'][index] = relative + '?v=' + hashlib.sha256(asset.read_bytes()).hexdigest()[:12]
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
source = page.read_text(encoding='utf-8')
page.write_text(re.sub(r'''\b(src|href|data-boot-manifest)=(['"])([^'"\s]+)\2''', refresh, source), encoding='utf-8')
print('Local asset cache keys refreshed')
