"""Read-only MCP handshake and Blender scene inspection."""
import asyncio
import json
import os
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    workspace = Path(__file__).resolve().parents[3]
    runtime = workspace / '.runtime' / 'blender-mcp'
    env = dict(os.environ, BLENDER_HOST='127.0.0.1', BLENDER_PORT='9876',
               DISABLE_TELEMETRY='true', PYTHONUTF8='1', PYTHONIOENCODING='utf-8')
    params = StdioServerParameters(command=str(runtime / 'venv/Scripts/mcp-for-blender.exe'), env=env)
    async with stdio_client(params) as (reader, writer):
        async with ClientSession(reader, writer) as client:
            initialization = await client.initialize()
            tools = await client.list_tools()
            scene = await client.call_tool('get_scene_info', {})
            status = await client.call_tool('get_addon_status', {})
            report = {
                'server': initialization.serverInfo.model_dump(),
                'tool_count': len(tools.tools),
                'scene': scene.model_dump(mode='json'),
                'addon': status.model_dump(mode='json'),
            }
            (runtime / 'connection-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
            if scene.isError or status.isError:
                raise RuntimeError(json.dumps(report, ensure_ascii=False))
            print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    asyncio.run(main())
