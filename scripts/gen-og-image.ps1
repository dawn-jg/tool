# 一次性：生成 og-image.png (1200x630)
Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(1200, 630)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# 渐变背景
$rect = New-Object System.Drawing.Rectangle(0, 0, 1200, 630)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(30, 58, 138), [System.Drawing.Color]::FromArgb(59, 130, 246), 45)
$g.FillRectangle($brush, $rect)

# 装饰圆
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 255, 255, 255))
$g.FillEllipse($whiteBrush, 850, 20, 380, 380)
$g.FillEllipse($whiteBrush, -80, 400, 440, 440)

$white = [System.Drawing.Brushes]::White
$light = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 255, 255, 255))
$lighter = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 255, 255, 255))

$font1 = New-Object System.Drawing.Font('Arial', 60, [System.Drawing.FontStyle]::Bold)
$font2 = New-Object System.Drawing.Font('Arial', 28)
$font3 = New-Object System.Drawing.Font('Arial', 22)

$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

$g.DrawString('Tooltip.cc', $font1, $white, (New-Object System.Drawing.RectangleF(0, 140, 1200, 130)), $sf)
$g.DrawString('免费在线工具箱 · 浏览器本地运行', $font2, $light, (New-Object System.Drawing.RectangleF(0, 300, 1200, 60)), $sf)
$g.DrawString('JSON格式化 / Base64 / 正则测试 / 二维码 / 图片处理', $font3, $lighter, (New-Object System.Drawing.RectangleF(0, 380, 1200, 50)), $sf)

# 圆角徽章
$badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 255, 255, 255))
$g.FillRectangle($badgeBrush, 460, 460, 280, 56)
$g.DrawString('数据不上传 · 无需注册', $font3, $white, (New-Object System.Drawing.RectangleF(0, 452, 1200, 72)), $sf)

$bmp.Save('D:/tooltip.cc/public/og-image.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output 'PNG saved OK'
