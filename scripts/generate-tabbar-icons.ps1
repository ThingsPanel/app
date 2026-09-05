# Export native-tabBar-compatible PNGs from shared 24-unit vector geometry.
# State changes only recolor the same alpha mask, preventing size/shape shifts.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetDirectory = Join-Path (Split-Path $PSScriptRoot -Parent) 'static/tabbar'
$exportSize = 96
$renderSize = 384

function Add-Polyline($path, [single[]]$coordinates, [bool]$closed = $false) {
    $points = for ($index = 0; $index -lt $coordinates.Length; $index += 2) {
        [System.Drawing.PointF]::new($coordinates[$index], $coordinates[$index + 1])
    }
    $path.StartFigure()
    $path.AddLines([System.Drawing.PointF[]]$points)
    if ($closed) { $path.CloseFigure() }
}

foreach ($name in @('dashboard', 'devices', 'automation', 'account')) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    switch ($name) {
        'dashboard' {
            Add-Polyline $path @(3,10.5, 12,3, 21,10.5)
            Add-Polyline $path @(5,9.5, 5,21, 10,21, 10,14, 14,14, 14,21, 19,21, 19,9.5)
        }
        'devices' {
            foreach ($position in @(@(3,3), @(14,3), @(3,14), @(14,14))) {
                $path.AddRectangle([System.Drawing.RectangleF]::new($position[0], $position[1], 7, 7))
            }
        }
        'automation' {
            Add-Polyline $path @(12,3, 21,9, 12,21, 3,9) $true
            Add-Polyline $path @(3,9, 21,9)
            Add-Polyline $path @(12,3, 12,21)
        }
        'account' {
            $path.AddEllipse(8,3,8,8)
            $path.StartFigure()
            $path.AddBezier(4,21, 4,11.5, 20,11.5, 20,21)
            $path.CloseFigure()
        }
    }
    $large = [System.Drawing.Bitmap]::new($renderSize, $renderSize)
    $graphics = [System.Drawing.Graphics]::FromImage($large)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.ScaleTransform($renderSize / 24, $renderSize / 24)
    $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 1.7)
    $pen.StartCap = $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $graphics.DrawPath($pen, $path)
    $mask = [System.Drawing.Bitmap]::new($exportSize, $exportSize)
    $downsample = [System.Drawing.Graphics]::FromImage($mask)
    $downsample.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $downsample.DrawImage($large, 0, 0, $exportSize, $exportSize)
    $downsample.Dispose()
    foreach ($state in @(@('', '#7F8CA0'), @('-selected', '#1677FF'))) {
        $color = [System.Drawing.ColorTranslator]::FromHtml($state[1])
        $icon = [System.Drawing.Bitmap]::new($exportSize, $exportSize)
        for ($y = 0; $y -lt $exportSize; $y++) {
            for ($x = 0; $x -lt $exportSize; $x++) {
                $icon.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($mask.GetPixel($x, $y).A, $color.R, $color.G, $color.B))
            }
        }
        $icon.Save((Join-Path $assetDirectory ($name + $state[0] + '.png')), [System.Drawing.Imaging.ImageFormat]::Png)
        $icon.Dispose()
    }
    $mask.Dispose()
    $pen.Dispose()
    $graphics.Dispose()
    $large.Dispose()
    $path.Dispose()
    Write-Output "Exported $name (normal/selected, 96x96, shared alpha mask)"
}
