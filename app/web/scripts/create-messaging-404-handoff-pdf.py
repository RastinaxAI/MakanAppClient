"""Render the 404 fix/handoff from its Persian Markdown source.

Reuses the established ReportLab/FriBidi/ActualText renderer; no session data.
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
spec = importlib.util.spec_from_file_location('makan_fa', ROOT / 'scripts/create-backend-audit-pdf.py')
fa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fa)


def plain(text):
    return re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text).replace('**', '').replace('`', '').replace('—', '-').replace('–', '-')


def page_header(canvas, document):
    w, h = A4
    canvas.setFillColor(fa.BLUE)
    canvas.rect(0, h - 8, w, 8, fill=1, stroke=0)
    logo = ROOT / 'public/brand/makan-logo-v2.webp'
    if logo.exists():
        canvas.drawImage(str(logo), w - 73, h - 58, width=27, height=27, mask='auto')
    canvas.setFont('Fa', 8.5)
    canvas.setFillColor(fa.MUTED)
    canvas.drawRightString(w - 83, h - 45, fa.visual('ماکان | رفع ۴۰۴ گفتگوی آموزشگاه و حوالهٔ فنی'))
    canvas.setStrokeColor(fa.LINE)
    canvas.line(45, h - 68, w - 45, h - 68)
    canvas.line(45, 40, w - 45, 40)
    canvas.drawRightString(w - 45, 25, fa.visual('صفحهٔ ' + str(document.page).translate(fa.DIGITS)))
    canvas.drawString(45, 25, 'Test / 2026-11-05')


def report_table(rows):
    widths = [205, 135, 165] if len(rows[0]) == 3 else [125, 380]
    cells = []
    for row_index, row in enumerate(rows):
        values = []
        for index, value in enumerate(row):
            if re.fullmatch(r'404 / [A-Z_]+', value):
                values.append(fa.Text(value.replace('404 / ', 'HTTP 404\n'), size=7.5, leading=11.5, left=True, after=0))
            elif re.match(r'^(GET|POST|PUT|PATCH|DELETE) ', value):
                parts, current = [], ''
                for part in re.split(r'(?<=/)|(?<= )', value):
                    if current and pdfmetrics.stringWidth(current + part, 'Mono', 7.8) > widths[index] - 18:
                        parts.append(current.rstrip())
                        current = ''
                    current += part
                parts.append(current.rstrip())
                values.append(fa.Text('\n'.join(parts), size=7.8, leading=12, left=True, after=0))
            else:
                values.append(fa.Text(value, 9.1, bold=row_index == 0, color=fa.BLUE if row_index == 0 else fa.INK, leading=14.1, after=0))
        cells.append(list(reversed(values)))
    result = Table(cells, colWidths=list(reversed(widths)), hAlign='RIGHT', repeatRows=1)
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
    fonts = ROOT / 'public/fonts/makan-reference'
    for name, file in [('Fa','Vazirmatn-Regular.ttf'),('FaBold','Vazirmatn-Bold.ttf')]:
        pdfmetrics.registerFont(TTFont(name, str(fonts / file), shapable=False))
    pdfmetrics.registerFont(TTFont('Mono','/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',shapable=False))
    source = ROOT / 'docs/MESSAGING_404_FIX_20261105_FA.md'
    lines = source.read_text().splitlines()
    story, i, first_section = [], 0, True
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line == '```':
            i += 1
            code = []
            while i < len(lines) and lines[i].strip() != '```':
                code.append(lines[i]); i += 1
            story.append(fa.Text('\n'.join(code), size=8.0, leading=12.4, left=True, after=10))
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                cells = [plain(v.strip()) for v in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', value) for value in cells):
                    rows.append(cells)
                i += 1
            story.append(report_table(rows)); story.append(Spacer(1,10))
            continue
        elif line.startswith('# '):
            story.append(fa.Text(plain(line[2:]), 22, bold=True, leading=33, after=13))
        elif line.startswith('## '):
            if not first_section:
                story.append(PageBreak())
            first_section = False
            title = fa.Text(plain(line[3:]), 17, bold=True, leading=26, color=fa.BLUE, after=12)
            title.keepWithNext = True
            story.append(title)
        elif line.startswith('### '):
            title = fa.heading(plain(line[4:])); title.keepWithNext = True
            story.append(Spacer(1,7)); story.append(title)
        elif line.startswith('- '):
            story.append(fa.bullet(plain(line[2:])))
        else:
            story.append(fa.paragraph(plain(line), size=9.8)); story.append(Spacer(1,5))
        i += 1
    output = ROOT / 'output/pdf/MakanApp_Messaging_404_Backend_Handoff_FA_20261105.pdf'
    output.parent.mkdir(parents=True,exist_ok=True)
    doc = SimpleDocTemplate(str(output), pagesize=A4, leftMargin=45,rightMargin=45,topMargin=85,bottomMargin=55,title='رفع خطای ۴۰۴ گفتگوی آموزشگاه و حوالهٔ فنی بک‌اند',author='MakanApp',subject='Verified CONVERSATION_NOT_FOUND reproduction; workspace selection client fix and backend contract recommendations')
    doc.build(story,onFirstPage=page_header,onLaterPages=page_header)
    print(json.dumps({'pdf':str(output),'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
