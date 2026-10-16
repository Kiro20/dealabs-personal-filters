param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

$ErrorActionPreference = 'Stop'

$manifestPath = Join-Path $ProjectRoot 'manifest.json'
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$version = $manifest.version
if ($version -notmatch '^\d+\.\d+\.\d+$') {
    throw "Version de manifeste invalide : $version"
}

$distDirectory = Join-Path $ProjectRoot 'dist'
$chromiumArchivePath = Join-Path $distDirectory "filtres-personnels-dealabs-v$version.zip"
$firefoxArchivePath = Join-Path $distDirectory "filtres-personnels-dealabs-firefox-v$version.zip"

New-Item -ItemType Directory -Path $distDirectory -Force | Out-Null

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function New-ExtensionArchive([string]$ArchivePath, [string]$ManifestSource) {
    if (Test-Path -LiteralPath $ArchivePath) {
        Remove-Item -LiteralPath $ArchivePath -Force
    }

    $files = [ordered]@{
        'manifest.json' = $ManifestSource
        'filters.js' = 'filters.js'
        'content.js' = 'content.js'
        'LICENSE' = 'LICENSE'
        'icons/icon16.png' = 'icons/icon16.png'
        'icons/icon32.png' = 'icons/icon32.png'
        'icons/icon48.png' = 'icons/icon48.png'
        'icons/icon128.png' = 'icons/icon128.png'
    }

    $archive = [System.IO.Compression.ZipFile]::Open($ArchivePath, [System.IO.Compression.ZipArchiveMode]::Create)
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
}

New-ExtensionArchive -ArchivePath $chromiumArchivePath -ManifestSource 'manifest.json'
New-ExtensionArchive -ArchivePath $firefoxArchivePath -ManifestSource 'manifest.firefox.json'

Write-Output $chromiumArchivePath
Write-Output $firefoxArchivePath
