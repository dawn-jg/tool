# -*- coding: utf-8 -*-
# 一次性：PIL 生成 og-image.png v3（精确居中 + 装饰圆调淡）
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

W, H = 1200, 630

# 1. 背景渐变
img = Image.new("RGB", (W, H))
d = ImageDraw.Draw(img)
for y in range(H):
    for x in range(0, W, 2):
        t = (x + y * 0.6) / (W + H * 0.6)
        r = int(30 + (59 - 30) * t)
        g = int(58 + (130 - 58) * t)
        b = int(138 + (246 - 138) * t)
        d.line([(x, y), (x + 1, y)], fill=(r, g, b))

# 2. 装饰圆（半透明叠加层，调淡）
overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
od = ImageDraw.Draw(overlay)
od.ellipse((860, -60, 1240, 320), fill=(255, 255, 255, 10))
od.ellipse((-160, 400, 320, 880), fill=(255, 255, 255, 8))
od.ellipse((980, 440, 1240, 700), fill=(255, 255, 255, 6))
img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
d = ImageDraw.Draw(img)

# 3. 字体
font_path = "C:/Windows/Fonts/msyh.ttc"
font_bold = "C:/Windows/Fonts/msyhbd.ttc"
if not os.path.exists(font_bold): font_bold = font_path
f_brand = ImageFont.truetype(font_bold, 78)
f_title = ImageFont.truetype(font_path, 42)
f_sub = ImageFont.truetype(font_path, 30)
f_badge = ImageFont.truetype(font_bold, 26)
f_tag = ImageFont.truetype(font_path, 30)

def center_text(y, text, font, fill):
    """精确水平居中，textbbox 度量 + 左右安全边距"""
    tb = d.textbbox((0, 0), text, font=font)
    tw = tb[2] - tb[0]
    x = (W - tw) / 2
    d.text((x, y), text, font=font, fill=fill)
    return tw

# 4. 品牌名
brand = "Tooltip.cc"
tb = d.textbbox((0, 0), brand, font=f_brand)
bw_ = tb[2] - tb[0]
d.text(((W - bw_) / 2, 85), brand, font=f_brand, fill=(255, 255, 255))

# 5. 分隔线
line_w = min(int(bw_) + 60, 500)
d.line(((W - line_w) / 2, 228, (W + line_w) / 2, 228), fill=(150, 195, 255), width=2)

# 6. 中文标题
center_text(258, "免费在线工具箱 · 浏览器本地运行", f_title, (235, 245, 255))

# 7. 功能列表
center_text(348, "JSON格式化  ·  Base64  ·  正则测试  ·  二维码  ·  图片处理", f_sub, (205, 228, 255))

# 8. 徽章（深蓝实底 + 白字）
badge_text = "数据不上传 · 无需注册 · 打开即用"
tb = d.textbbox((0, 0), badge_text, font=f_badge)
bw = tb[2] - tb[0] + 64
bh = 62
bx = (W - bw) / 2
by = 440
d.rounded_rectangle((bx, by, bx + bw, by + bh), radius=31, fill=(37, 84, 160), outline=(140, 190, 255), width=2)
tb2 = d.textbbox((0, 0), badge_text, font=f_badge)
d.text(((W - (tb2[2] - tb2[0])) / 2, by + (bh - (tb2[3] - tb2[1])) / 2 - tb2[1]), badge_text, font=f_badge, fill=(255, 255, 255))

# 9. 底部英文
center_text(556, "100% Browser-based · Zero Upload", f_tag, (215, 235, 255))

img.save("D:/tooltip.cc/public/og-image.png", "PNG", optimize=True)
print("saved v3")
