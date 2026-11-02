param([string]$BlendFile, [string]$BlenderExecutable)
$ErrorActionPreference = 'Stop'
$blenderPath = $BlenderExecutable
if (-not $blenderPath) {
    $blenderPath = @($env:BLENDER_EXE, 'E:\blender.exe', 'D:\blender.exe') | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
}
if (-not $blenderPath -or -not (Test-Path -LiteralPath $blenderPath)) {
    throw 'Blender was not found. Pass -BlenderExecutable with the installed path.'
}
$launchArguments = @()
if ($BlendFile) {
    $resolvedBlend = (Resolve-Path -LiteralPath $BlendFile).Path
    $launchArguments += '"' + $resolvedBlend + '"'
}
# The installed addon starts its loopback bridge automatically with Blender.
Start-Process -FilePath $blenderPath -ArgumentList ($launchArguments + '--python-expr "print(''Tsukiezz Blender MCP ready'')"') -WindowStyle Normal
