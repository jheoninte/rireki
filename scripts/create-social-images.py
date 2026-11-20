"""Regenerate the checked-in social cards (Pillow; no user resume data)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'og'
OUT.mkdir(exist_ok=True)
def font(size, cjk=False):
    paths = [Path('C:/Windows/Fonts/YuGothB.ttc' if locale == 'ja' else 'C:/Windows/Fonts/malgun.ttf')] if cjk else []
    paths += [ROOT / 'public/fonts/NotoSans-Bold.ttf']
    return ImageFont.truetype(str(next(path for path in paths if path.exists())), size)

cards = {
    'ja': ('履歴書作成ツール', '履歴書・職務経歴書を、わかりやすく。', '登録不要で作成 / PDF・Word保存'),
    'ko': ('바로 이력서', '경험을 정리하고, 다음 기회로.', '이력서 · 경력기술서 / PDF · Word 저장'),
    'en': ('Folio.', 'Your experience. Clearly told.', 'SwiftResume / 18 original English templates'),
}
for locale, (title, subtitle, note) in cards.items():
    im = Image.new('RGB', (1200, 630), '#f3f7ff')
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((50, 45, 1150, 585), radius=24, fill='white', outline='#dce6f6', width=2)
    d.rounded_rectangle((95, 93, 158, 161), radius=14, fill='#2563eb')
    d.line([(114, 110), (138, 110), (145, 118), (145, 144), (114, 144), (114, 110)], fill='white', width=3)
    d.line((121, 124, 138, 124), fill='white', width=2)
    d.line((121, 133, 135, 133), fill='white', width=2)
    d.text((95, 218), title, font=font(62 if locale != 'en' else 88, locale != 'en'), fill='#243b60')
    d.text((98, 340), subtitle, font=font(27, locale != 'en'), fill='#46658e')
    d.text((98, 407), note, font=font(21, locale != 'en'), fill='#6b83a6')
    d.rounded_rectangle((97, 476, 452, 527), radius=8, fill='#2563eb')
    d.text((118, 485), 'rireki-easy.pages.dev' + ('/' if locale == 'ja' else '/' + locale + '/'), font=font(19), fill='white')
    d.rounded_rectangle((840, 108, 1080, 521), radius=8, fill='#f8faff', outline='#d4e0f1', width=2)
    d.rectangle((866, 139, 923, 144), fill='#2563eb')
    for y, width in [(171, 132), (193, 173), (213, 146), (266, 102), (289, 172), (308, 164), (327, 157), (376, 102), (400, 172), (420, 155), (440, 168), (460, 143)]:
        d.rounded_rectangle((867, y, 867+width, y+6), radius=2, fill='#8ba3c5' if y in (171, 266, 376) else '#d2ddec')
    im.save(OUT / f'{locale}.png', optimize=True)
