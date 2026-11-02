param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path.TrimEnd('\')
if ((Split-Path $projectRoot -Leaf) -ne 'GameTsukiezz') { throw 'Unexpected project root' }
$previousReport = Join-Path $projectRoot 'docs\current-map-cleanup.json'
if ((Test-Path -LiteralPath $previousReport) -and (Get-Content -LiteralPath $previousReport -Raw -Encoding UTF8 | ConvertFrom-Json).applied) { throw 'Cleanup already completed. Inspect the saved manifest before planning another cleanup.' }
$candidates = @{}
function Add-CleanupTarget([string]$relative, [string]$reason) {
    $target = [IO.Path]::GetFullPath((Join-Path $projectRoot $relative))
    if (!$target.StartsWith($projectRoot + '\', [StringComparison]::OrdinalIgnoreCase) -or $relative.StartsWith('.git\')) { throw "Unsafe target: $target" }
    if (Test-Path -LiteralPath $target -PathType Leaf) { $candidates[$target] = $reason }
    elseif (Test-Path -LiteralPath $target -PathType Container) {
        Get-ChildItem -LiteralPath $target -Recurse -File -Force | ForEach-Object {
            if (!$_.FullName.StartsWith($projectRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Escaped workspace' }
            $candidates[$_.FullName] = $reason
        }
    }
}
# Runtime is demo/index.html + demo/features. Keep all modular authoring sources.
$oldMaps = @('DenseSharedRailServices','DenseSharedRailServicesWorkspace','DesertRailwayWorkspace','GroundRailServices','RailwayCivilEngineering','RailwayJunctionsReviewed','RailwayJunctionsWorkspace','RoyalTechnologyRiverAdventure','RoyalTechnologyRiverAdventureFinal','SharedRailServices','SharedRailServicesWorkspace','SphinxLabyrinthWorkspace')
foreach ($map in $oldMaps) { Add-CleanupTarget "Assets\Art\Blender\Environments\$map.blend" 'Superseded combined scene; current review is YinYangPyramid13Floors.blend' }
Get-ChildItem -LiteralPath (Join-Path $projectRoot 'Assets') -Recurse -File | Where-Object { $_.Name -match '\.blend[0-9]+$' } | ForEach-Object { Add-CleanupTarget $_.FullName.Substring($projectRoot.Length+1) 'Blender backup copy' }
Get-ChildItem -LiteralPath (Join-Path $projectRoot 'demo\verification') -Directory | Where-Object Name -ne 'autumn-upgrade' | ForEach-Object { Add-CleanupTarget $_.FullName.Substring($projectRoot.Length+1) 'Superseded generated test output' }
Add-CleanupTarget 'demo\verification\autumn-upgrade\railway-final.log' 'Failed railway run superseded by railway-final-2.log'
foreach ($name in @('review_dense_shared_railway.py','review_shared_railway.py','review_desert_railway.py','review_railway_engineering.py','build_desert_labyrinth_review.py','build_technology_adventure_review.py')) { Add-CleanupTarget "tools\$name" 'Exporter for a superseded combined scene' }
foreach ($name in @('desert_labyrinth.browser.js','desert_acceptance.browser.js','verify_desert.js','technology_adventure.browser.js','verify_technology_adventure.js','diagnose_railway_entries.js','diagnose_railway_junctions.js','preview_railway.js')) { Add-CleanupTarget "tools\tests\$name" 'Superseded test assumptions or one-off diagnostic; current upgrade and railway suites retained' }
# Separate unshipped Unity prototype has no scenes/prefabs and is never loaded by demo.
foreach ($relative in @('Assets\Scripts','Assets\Art\Models','Packages','ProjectSettings','tools\export_to_unity.py','.github\workflows\csharp-lint-and-validate.yml')) { Add-CleanupTarget $relative 'Legacy Unity-only prototype; active game is the browser demo' }
Get-ChildItem -LiteralPath (Join-Path $projectRoot 'tools') -Directory -Recurse -Force | Where-Object Name -eq '__pycache__' | ForEach-Object { Add-CleanupTarget $_.FullName.Substring($projectRoot.Length+1) 'Regenerable Python bytecode' }
$entries = @($candidates.Keys | Sort-Object | ForEach-Object { $file=Get-Item -LiteralPath $_; [pscustomobject]@{path=$_.Substring($projectRoot.Length+1);bytes=$file.Length;sha256=(Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash;reason=$candidates[$_]} })
$reportPath = Join-Path $projectRoot 'docs\current-map-cleanup.json'
$plan = [ordered]@{project=$projectRoot;applied=$false;files=$entries.Count;bytes=($entries | Measure-Object bytes -Sum).Sum;entries=$entries}
if (!$Apply) { $plan | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $reportPath -Encoding UTF8; Write-Output "Plan: $($plan.files) files; $([math]::Round($plan.bytes/1MB,2)) MiB. $reportPath"; exit }
$recoveryRoot = Join-Path ([IO.Path]::GetTempPath()) ('GameTsukiezz-current-map-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0,6))
New-Item -ItemType Directory -Path $recoveryRoot | Out-Null
$runtimePaths = @((Join-Path $projectRoot 'demo\index.html')) + @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'demo\features') -Recurse -File | ForEach-Object FullName)
$runtimeHashes = @{}; foreach($runtimePath in $runtimePaths) { $runtimeHashes[$runtimePath]=(Get-FileHash -LiteralPath $runtimePath -Algorithm SHA256).Hash }
# Verify every recovery copy BEFORE removing anything from the project.
foreach($entry in $entries) {
    $source = [IO.Path]::GetFullPath((Join-Path $projectRoot $entry.path))
    $destination = [IO.Path]::GetFullPath((Join-Path $recoveryRoot $entry.path))
    if (!$source.StartsWith($projectRoot+'\',[StringComparison]::OrdinalIgnoreCase) -or !$destination.StartsWith($recoveryRoot+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe recovery path' }
    New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination
    if ((Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash -ne $entry.sha256) { throw "Recovery hash mismatch: $source" }
}
$plan.recoveryRoot=$recoveryRoot
$plan | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $recoveryRoot 'restore-manifest.json') -Encoding UTF8
foreach($entry in $entries) {
    $target=[IO.Path]::GetFullPath((Join-Path $projectRoot $entry.path))
    if (!$target.StartsWith($projectRoot+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe delete path' }
    if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -ne $entry.sha256) { throw "Source changed during cleanup: $target" }
    Remove-Item -LiteralPath $target -Force
}
# Delete empty directories only, under the three checked project subtrees.
foreach($relative in @('Assets','Packages','ProjectSettings','demo\verification','tools')) {
    $target=[IO.Path]::GetFullPath((Join-Path $projectRoot $relative))
    if (!$target.StartsWith($projectRoot+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe directory path' }
    if(Test-Path -LiteralPath $target -PathType Container) {
        @(Get-ChildItem -LiteralPath $target -Directory -Recurse -Force | Sort-Object { $_.FullName.Length } -Descending) + @(Get-Item -LiteralPath $target) | ForEach-Object {
            if ($_.FullName.StartsWith($projectRoot+'\',[StringComparison]::OrdinalIgnoreCase) -and @(Get-ChildItem -LiteralPath $_.FullName -Force).Count -eq 0) { Remove-Item -LiteralPath $_.FullName -Force }
        }
    }
}
foreach($runtimePath in $runtimePaths) { if ((Get-FileHash -LiteralPath $runtimePath -Algorithm SHA256).Hash -ne $runtimeHashes[$runtimePath]) { throw "Runtime changed: $runtimePath" } }
$plan.applied=$true; $plan.runtimeFilesVerified=$runtimePaths.Count
$plan | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $reportPath -Encoding UTF8
Write-Output "Removed $($plan.files) files ($([math]::Round($plan.bytes/1MB,2)) MiB). Runtime hashes unchanged: $($runtimePaths.Count). Recovery: $recoveryRoot"
