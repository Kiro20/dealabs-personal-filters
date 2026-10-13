param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

$ErrorActionPreference = 'Stop'

$manifestPath = Join-Path $ProjectRoot 'manifest.json'
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$version = $manifest.version
if ($version -notmatch '^\d+\.\d+\.\d+$') {
    throw "Version de manifeste invalide : $version"
}

$distDirectory = Join-Path $ProjectRoot 'dist'
$archivePath = Join-Path $distDirectory "filtres-personnels-dealabs-v$version.zip"

New-Item -ItemType Directory -Path $distDirectory -Force | Out-Null
if (Test-Path -LiteralPath $archivePath) {
    Remove-Item -LiteralPath $archivePath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$files = [ordered]@{
    'manifest.json' = 'manifest.json'
    'filters.js' = 'filters.js'
    'content.js' = 'content.js'
    'LICENSE' = 'LICENSE'
    'icons/icon16.png' = 'icons/icon16.png'
    'icons/icon32.png' = 'icons/icon32.png'
    'icons/icon48.png' = 'icons/icon48.png'
    'icons/icon128.png' = 'icons/icon128.png'
}

$archive = [System.IO.Compression.ZipFile]::Open($archivePath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($entryName in $files.Keys) {
        $source = Join-Path $ProjectRoot $files[$entryName]
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive,
            $source,
            $entryName,
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
}
finally {
    $archive.Dispose()
}

Write-Output $archivePath
