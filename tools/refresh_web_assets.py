"""Refresh cache keys for local assets referenced by the demo entry point."""
from pathlib import Path
import hashlib
import re

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

source = page.read_text(encoding='utf-8')
page.write_text(re.sub(r'''\b(src|href)=(['"])([^'"\s]+)\2''', refresh, source), encoding='utf-8')
print('Local asset cache keys refreshed')
