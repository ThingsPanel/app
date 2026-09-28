# 生成大屏预览页导航栏图标：双机叠加形状，线宽 1.2（24 单位网格）。
# 输出 1x / @2x / @3x 三套，5+ 引擎按 dpr 自动选择。
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outDir = 'F:\coding\app\static\icon'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$inkColor = [System.Drawing.ColorTranslator]::FromHtml('#25344b')

function New-RoundRect([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
    $p = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $r * 2
    $p.AddArc($x, $y, $d, $d, 180, 90)
    $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $p.CloseFigure()
    return $p
}

# 双机叠加：横屏手机 + 上方竖屏手机（被遮挡处断开）+ 左上旋转弧
function Draw-DualPhone($g, [single]$size, [single]$w) {
    $s = $size / 24.0
    $state = $g.Save()
    $g.ScaleTransform($s, $s)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $pen = [System.Drawing.Pen]::new($inkColor, $w)
    $pen.StartCap = $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $land = New-RoundRect 1.6 9.6 20.8 12.8 3.0
    $g.DrawPath($pen, $land)

    $port = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $port.AddLine(10.9, 9.6, 10.9, 4.0)
    $port.AddArc(10.9, 1.6, 4.8, 4.8, 180, 90)
    $port.AddLine(13.3, 1.6, 18.1, 1.6)
    $port.AddArc(15.7, 1.6, 4.8, 4.8, 270, 90)
    $port.AddLine(20.5, 4.0, 20.5, 9.6)
    $g.DrawPath($pen, $port)

    $g.DrawArc($pen, 1.6, 1.6, 10, 10, 180, 90)

    $pen.Dispose(); $land.Dispose(); $port.Dispose()
    $g.Restore($state)
}

$variants = @(
    @{ suffix = '';    px = 19 },
    @{ suffix = '@2x'; px = 38 },
    @{ suffix = '@3x'; px = 57 }
)

foreach ($v in $variants) {
    $bmp = [System.Drawing.Bitmap]::new($v.px, $v.px)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    Draw-DualPhone $g $v.px 1.0
    $g.Dispose()
    $target = Join-Path $outDir ('device-rotate' + $v.suffix + '.png')
    $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output ("saved " + $target)
}
