param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

Add-Type -AssemblyName System.Drawing

$outputDirectory = Join-Path $ProjectRoot 'icons'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

foreach ($size in 16, 32, 48, 128) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.ScaleTransform($size / 512, $size / 512)

    $background = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $radius = 112
    $diameter = $radius * 2
    $background.AddArc(24, 24, $diameter, $diameter, 180, 90)
    $background.AddArc(488 - $diameter, 24, $diameter, $diameter, 270, 90)
    $background.AddArc(488 - $diameter, 488 - $diameter, $diameter, $diameter, 0, 90)
    $background.AddArc(24, 488 - $diameter, $diameter, $diameter, 90, 90)
    $background.CloseFigure()
    $graphics.FillPath([System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#202425')), $background)
    $graphics.DrawPath([System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#3b4548'), 16), $background)

    $funnel = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $funnel.AddPolygon([System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(112, 128),
        [System.Drawing.PointF]::new(400, 128),
        [System.Drawing.PointF]::new(292, 260),
        [System.Drawing.PointF]::new(292, 372),
        [System.Drawing.PointF]::new(220, 408),
        [System.Drawing.PointF]::new(220, 260)
    ))
    $graphics.FillPath([System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#08a9b8')), $funnel)

    $graphics.FillEllipse([System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#202425')), 337, 91, 90, 90)
    $graphics.FillEllipse([System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#ff6470')), 344, 98, 76, 76)

    $target = Join-Path $outputDirectory "icon$size.png"
    $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}
