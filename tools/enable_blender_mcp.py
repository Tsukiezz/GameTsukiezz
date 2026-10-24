"""Enable the installed MCP addon without changing or saving a game scene."""
import addon_utils
import bpy

addon_utils.modules_refresh()
addon_utils.enable('blender_mcp', default_set=True, persistent=True)
if 'blender_mcp' not in bpy.context.preferences.addons:
    raise RuntimeError('MCP for Blender addon did not enable')
bpy.ops.wm.save_userpref()
print('TSUKIEZZ_MCP_ADDON_ENABLED', bpy.app.version_string)
