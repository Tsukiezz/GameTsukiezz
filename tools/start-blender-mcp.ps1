param([string]$BlendFile)
$ErrorActionPreference = 'Stop'
$blenderExecutable = 'D:\blender.exe'
if (-not (Test-Path -LiteralPath $blenderExecutable)) {
    throw 'Blender was not found at D:\blender.exe.'
}
$launchArguments = @()
if ($BlendFile) {
    $resolvedBlend = (Resolve-Path -LiteralPath $BlendFile).Path
    $launchArguments += '"' + $resolvedBlend + '"'
}
# The installed addon starts its loopback bridge automatically with Blender.
Start-Process -FilePath $blenderExecutable -ArgumentList ($launchArguments + '--python-expr "print(''Tsukiezz Blender MCP ready'')"') -WindowStyle Normal
