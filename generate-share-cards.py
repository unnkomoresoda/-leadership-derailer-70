"""Lay out exact type labels and existing artwork as 1200x630 link cards.

This exports a code-defined layout; it does not generate or retouch artwork.
Pass the metadata exported from type-catalog.js as a JSON filename.
Requires Pillow. Usage: python3 generate-share-cards.py metadata.json
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
FONT_ROOT = Path('/usr/share/fonts/truetype/dejavu')


def font(size, bold=False):
    return ImageFont.truetype(str(FONT_ROOT / ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')), size)


def wrap(draw, text, face, width):
    lines = []
    current = ''
    for word in text.split():
        candidate = f'{current} {word}'.strip()
        if current and draw.textlength(candidate, font=face) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def make_card(type_data):
    team = type_data['team']
    color = team['color']
    canvas = Image.new('RGB', (1200, 630), '#0e172a')
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((16, 16, 1183, 613), radius=26, outline=color, width=2)
    draw.text((48, 52), 'LEADERSHIP', font=font(22, True), fill='#eef4ff')
    draw.text((48, 78), 'LENS', font=font(38, True), fill=color)
    team_text = team['en'] + ' TEAM'
    team_face = font(17, True)
    badge_width = int(draw.textlength(team_text, font=team_face)) + 38
    draw.rounded_rectangle((48, 163, 48 + badge_width, 208), radius=22, outline=color, width=2)
    draw.text((67, 176), team_text, font=team_face, fill=color)
    face_size = 43
    while True:
        title_face = font(face_size, True)
        lines = wrap(draw, type_data['en'], title_face, 485)
        if len(lines) <= 3 and all(draw.textlength(line, font=title_face) <= 485 for line in lines):
            break
        face_size -= 1
    title_y = 255
    for line in lines:
        draw.text((48, title_y), line, font=title_face, fill='#f8faff')
        title_y += face_size + 12
    draw.line((48, 479, 250, 479), fill=color, width=3)
    draw.text((48, 510), '28 LEADERSHIP STYLES', font=font(20, True), fill='#d1d9e8')
    draw.text((48, 547), '70 QUESTIONS / YOUR OWN PROFILE', font=font(15), fill='#9eabc2')
    # Contain the complete square character; social-card cropping cannot cut it.
    artwork = Image.open(ROOT / f"leader-{type_data['id']}.webp").convert('RGB')
    artwork = artwork.resize((574, 574), Image.Resampling.LANCZOS)
    canvas.paste(artwork, (596, 28))
    draw.rounded_rectangle((595, 27, 1170, 602), radius=4, outline=color, width=2)
    destination = ROOT / 'share' / f"{type_data['id']}-card.png"
    canvas.save(destination, optimize=True)
    return destination.stat().st_size


if __name__ == '__main__':
    types = json.loads(Path(sys.argv[1]).read_text())
    sizes = [make_card(type_data) for type_data in types]
    print(f'Created {len(sizes)} cards, {sum(sizes):,} bytes; largest {max(sizes):,} bytes.')
