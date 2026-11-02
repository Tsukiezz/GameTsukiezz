"""Enable the installed loopback Blender bridge for this session only."""
import addon_utils
import bpy

addon_utils.enable('blender_mcp', default_set=False)
bpy.context.scene.blendermcp_port = 9876
bpy.ops.blendermcp.start_server()
print('Tsukiezz railway design bridge listening on 127.0.0.1:9876')
