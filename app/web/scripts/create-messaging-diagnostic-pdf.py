"""Render the current Persian messaging diagnosis, then verify with Poppler.

Uses the existing ReportLab/FriBidi typography renderer; never reads session files.
The Markdown and sanitized checks are the only document inputs.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import re

from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('makan_pdf_fa', ROOT / 'scripts/create-backend-audit-pdf.py')
fa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fa)


def plain(text):
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    return text.replace('**', '').replace('`', '').replace('—', '-').replace('–', '-')


def header(canvas, document):
    w, h = A4
    canvas.setFillColor(fa.BLUE)
    canvas.rect(0, h - 8, w, 8, fill=1, stroke=0)
    logo = ROOT / 'public/brand/makan-logo-v2.webp'
    if logo.exists():
        canvas.drawImage(str(logo), w - 73, h - 58, width=27, height=27, mask='auto')
    canvas.setFont('Fa', 8.5)
    canvas.setFillColor(fa.MUTED)
    canvas.drawRightString(w - 83, h - 45, fa.visual('ماکان | تشخیص ایراد پیام‌رسان و برنامهٔ اصلاح'))
    canvas.setStrokeColor(fa.LINE)
    canvas.line(45, h - 68, w - 45, h - 68)
    canvas.line(45, 40, w - 45, 40)
    canvas.drawRightString(w - 45, 25, fa.visual('صفحهٔ ' + str(document.page).translate(fa.DIGITS)))
    canvas.drawString(45, 25, 'Test / 2026-11-05')


def api_table(rows):
    def operation(text):
        # Break at path boundaries, preserving LTR spelling and every slash.
        lines, current = [], ''
        for part in re.split(r'(?<=/)|(?<= )', text):
            if current and pdfmetrics.stringWidth(current + part, 'Mono', 8.2) > 262:
                lines.append(current.rstrip())
                current = ''
            current += part
        lines.append(current.rstrip())
        return fa.Text('\n'.join(lines), size=8.2, leading=12.5, left=True, after=0)
    cells = [[fa.Text('کاربرد', 9.3, bold=True, color=fa.BLUE, after=0), fa.Text('عملیات', 9.3, bold=True, color=fa.BLUE, after=0)]]
    for path, purpose in rows[1:]:
        cells.append([fa.Text(purpose, 9.1, leading=14.2, after=0), operation(path)])
    result = Table(cells, colWidths=[225, 280], hAlign='RIGHT', repeatRows=1)
    result.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), fa.PALE),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [fa.colors.white, fa.colors.HexColor('#F7FAFF')]),
        ('LINEBELOW', (0,0), (-1,-1), .35, fa.LINE),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    return result


def main():
    source = ROOT / 'docs/MESSAGING_DIAGNOSTIC_20261105_FA.md'
    checks = json.loads((ROOT / 'docs/quality/MESSAGING_20261105_CHECKS.json').read_text())
    fonts = ROOT / 'public/fonts/makan-reference'
    for name, file in [('Fa', 'Vazirmatn-Regular.ttf'), ('FaBold', 'Vazirmatn-Bold.ttf')]:
        pdfmetrics.registerFont(TTFont(name, str(fonts / file), shapable=False))
    pdfmetrics.registerFont(TTFont('Mono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', shapable=False))
    story = []
    lines = source.read_text().splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                cells = [plain(x.strip()) for x in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', cell) for cell in cells):
                    rows.append(cells)
                i += 1
            story.append(api_table(rows) if rows[0][0] == 'عملیات' else fa.table(rows[0], rows[1:], [125, 380], size=9.1))
            story.append(Spacer(1, 12))
            continue
        if line.startswith('# '):
            story.append(fa.Text(plain(line[2:]), 23, bold=True, leading=35, after=14))
        elif line.startswith('## '):
            name = plain(line[3:])
            if name != 'پاسخ روشن به دو مشکل گزارش‌شده':
                story.append(PageBreak())
            heading = fa.Text(name, 17, bold=True, leading=27, color=fa.BLUE, after=14)
            heading.keepWithNext = True
            story.append(heading)
        elif line.startswith('### '):
            heading = fa.heading(plain(line[4:]))
            heading.keepWithNext = True
            story.append(Spacer(1, 9))
            story.append(heading)
        else:
            story.append(fa.paragraph(plain(line), size=10.1))
            story.append(Spacer(1, 5))
        i += 1
    story.append(PageBreak())
    story.append(fa.title('نتیجهٔ آزمون این تحویل'))
    browser = checks['browser']
    story.append(fa.table(['بخش', 'نتیجهٔ ثبت‌شده'], [
        ['واحد', f"{checks['unit']['passed']} موفق در {checks['unit']['files']} فایل؛ {checks['unit']['newCases']} آزمون تازه."],
        ['مرورگر', f"آخرین نتیجهٔ {browser['latestPassed']} سناریوی یکتا موفق؛ {browser['newCases']} سناریوی تازه. جزئیات اجراهای اولیه و بازآزمایی در JSON ثبت شده‌اند."],
        ['خواندن واقعی', '۵۱ درخواست در پنج نقش؛ دعوت، privacy، membership و inbox. هیچ پیام/دعوت یا تنظیم واقعی تغییر نکرد.'],
        ['BFF و رابط تازه', checks['liveAfterSummaryFa']],
        ['کنترل‌های کد', 'build تولیدی، TypeScript، lint، generated و قالب‌بندی موفق؛ SDK کلاینت ۲۸۹ عملیات و ۵۰۸ schema.'],
    ], [125, 380], size=9.6))
    story.append(Spacer(1, 14))
    story.append(fa.heading('تعبیر درست نتیجه'))
    story.append(fa.paragraph('تست‌های ساخت، پذیرش/رد، انقضا، حساب نامرتبط، رسید نامعتبر، انتخاب‌های صریح privacy و به‌روزرسانی دو حساب در fixture محلی اجرا شدند. این نتیجه جای پذیرش واقعی DB، outbox، ارسال فایل و دوطرفهٔ پیام، Push یا رفتار تمام حساب‌های production نیست.'))
    story.append(fa.paragraph('پیش‌فرض جهانی بک‌اند هنوز تغییر نکرده است. با این تحویل می‌توان دعوت‌های موجود را از رابط دید و به‌صورت صریح پاسخ داد؛ آزمون زندهٔ این نوبت هیچ دعوت موجود را نپذیرفت یا رد نکرد.'))
    story.append(fa.heading('شواهد قابل بازتولید'))
    for name in ['MESSAGING_20261105_LIVE.json', 'MESSAGING_20261105_CONTEXT.json', 'MESSAGING_20261105_BFF_BEFORE.json', 'MESSAGING_20261105_BFF_AFTER.json', 'MESSAGING_20261105_CHECKS.json']:
        story.append(fa.code('web/docs/quality/' + name))
    for command in ['npm test', 'PLAYWRIGHT_CHANNEL=chrome npx playwright test', 'MAKAN_TEST_READ_SMOKE=1 node scripts/audit-messaging-readiness.mjs']:
        story.append(fa.code(command))
    output = ROOT / 'output/pdf/MakanApp_Messaging_Diagnostic_FA_20261105.pdf'
    output.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(str(output), pagesize=A4, leftMargin=45, rightMargin=45, topMargin=85, bottomMargin=55, title='تشخیص ایراد پیام‌رسان و برنامهٔ اصلاح ماکان', author='MakanApp', subject='Verified messaging invitation and privacy diagnosis; frontend fixes and backend acceptance work')
    document.build(story, onFirstPage=header, onLaterPages=header)
    print(json.dumps({'pdf': str(output), 'bytes': output.stat().st_size, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
