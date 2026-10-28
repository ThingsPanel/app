# Preserve the existing PNG geometry and alpha; bake in the dark tabbar colors.
# Native App image loading resolves bundled assets without CSS mask URL handling.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$sourceDirectory = Join-Path (Split-Path $PSScriptRoot -Parent) 'static/tabbar'
$destinationDirectory = Join-Path $sourceDirectory 'dark'
New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
foreach ($name in @('dashboard', 'boards', 'devices', 'automation', 'account')) {
    $source = [System.Drawing.Bitmap]::new((Join-Path $sourceDirectory ($name + '.png')))
    foreach ($state in @(@('', '#E1E6ED'), @('-selected', '#67DFF0'))) {
        $color = [System.Drawing.ColorTranslator]::FromHtml($state[1])
        $icon = [System.Drawing.Bitmap]::new($source.Width, $source.Height)
        for ($y = 0; $y -lt $source.Height; $y++) {
            for ($x = 0; $x -lt $source.Width; $x++) {
                $alpha = $source.GetPixel($x, $y).A
                $icon.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B))
            }
        }
        $icon.Save((Join-Path $destinationDirectory ($name + $state[0] + '.png')), [System.Drawing.Imaging.ImageFormat]::Png)
        $icon.Dispose()
    }
    $source.Dispose()
    Write-Output "Exported dark $name (normal/selected)"
}
