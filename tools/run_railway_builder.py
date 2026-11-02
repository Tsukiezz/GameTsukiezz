import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
from ai_blender_bridge import BlenderAIBridge
p=Path(__file__).with_name('build_moon_railway.py').resolve()
code=f'exec(compile(open({str(p)!r},encoding="utf-8-sig").read(),{str(p)!r},"exec"),{{"__file__":{str(p)!r}}})'
print(BlenderAIBridge().send_command('execute_code',{'code':code},timeout=180))
