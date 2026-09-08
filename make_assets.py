# -*- coding: utf-8 -*-
"""توليد ملفات الأصول الوهمية (placeholder) لموقع حديقة الاعتذار.

- assets/images/bouquet-final.png : صورة مؤقتة أنيقة بنفس المسار المطلوب
- assets/audio/background-music.mp3 : صمت قصير صالح بنفس المسار المطلوب

سيستبدل المستخدم هذين الملفين لاحقًا بالملفات الحقيقية دون تعديل الكود.
"""

import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG_PATH = os.path.join(ROOT, "assets", "images", "bouquet-final.png")
AUDIO_PATH = os.path.join(ROOT, "assets", "audio", "background-music.mp3")


def make_bouquet_placeholder():
    """صورة مؤقتة 800x800: خلفية كحلية مع توهج ذهبي ووردة مبسطة."""
    size = 800
    img = Image.new("RGB", (size, size), (13, 13, 21))
    draw = ImageDraw.Draw(img)

    # طبقة توهج ناعمة
    glow = Image.new("RGB", (size, size), (13, 13, 21))
    gdraw = ImageDraw.Draw(glow)
    cx, cy = size // 2, size // 2 - 40
    for radius, alpha in ((300, 18), (220, 30), (150, 45)):
        col = (13 + alpha, 13 + int(alpha * .45), 21 + int(alpha * .5))
        gdraw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=col)
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.blend(img, glow, 0.9)
    draw = ImageDraw.Draw(img)

    # بتلات وردة مبسطة بالأحمر الوردي
    red = (229, 56, 59)
    rose = (249, 232, 234)
    for i in range(8):
        ang = math.radians(i * 45)
        px = cx + 90 * math.cos(ang)
        py = cy + 90 * math.sin(ang)
        rx, ry = 70, 34
        draw.ellipse([px - rx, py - ry, px + rx, py + ry],
                     outline=red, width=5)
    draw.ellipse([cx - 55, cy - 55, cx + 55, cy + 55], outline=rose, width=5)
    draw.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], fill=red)

    # ساق بسيطة
    draw.line([cx, cy + 90, cx, cy + 260], fill=(127, 174, 122), width=8)
    draw.arc([cx - 70, cy + 150, cx + 10, cy + 230], 90, 200,
             fill=(127, 174, 122), width=6)

    # إطار داخلي رفيع
    draw.rounded_rectangle([40, 40, size - 40, size - 40], radius=36,
                           outline=(229, 56, 59), width=2)

    # نص placeholder صغير أسفل الصورة
    try:
        import matplotlib
        font_path = os.path.join(os.path.dirname(matplotlib.__file__),
                                 "mpl-data", "fonts", "ttf", "DejaVuSans.ttf")
        font = ImageFont.truetype(font_path, 26)
    except Exception:
        font = ImageFont.load_default()
    text = "PLACEHOLDER - replace with your bouquet photo"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, size - 110), text,
              fill=(200, 120, 125), font=font)

    os.makedirs(os.path.dirname(IMG_PATH), exist_ok=True)
    img.save(IMG_PATH, "PNG")
    print("created:", IMG_PATH)


def make_silent_mp3():
    """ملف MP3 صامت قصير وصالح: إطارات MPEG-1 Layer III ببيانات صفرية.

    كل إطار 417 بايت (128kbps / 44.1kHz). البيانات الصفرية تُفك كصمت.
    يكفي كملف وهمي حتى يستبدله المستخدم بالموسيقى الحقيقية.
    """
    frame = b"\xff\xfb\x90\x00" + b"\x00" * 413  # ترويسة + حمولة صفرية
    os.makedirs(os.path.dirname(AUDIO_PATH), exist_ok=True)
    with open(AUDIO_PATH, "wb") as f:
        f.write(frame * 60)  # ≈ 1.5 ثانية صمت، تتكرر مع loop
    print("created:", AUDIO_PATH)


if __name__ == "__main__":
    make_bouquet_placeholder()
    make_silent_mp3()
