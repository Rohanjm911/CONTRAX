import os
import tempfile
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.config.logging import logger


def generate_pdf_audit_report(
    contract_info: Dict[str, Any],
    findings: List[Dict[str, Any]],
    output_path: str = None
) -> str:
    """
    Generates a minimalist Apple-inspired dual-tone PDF security audit report.
    Adheres to strict dual-tone styling (#0B0D0F and #F5F5F2) with solid accents.
    """
    if not output_path:
        fd, output_path = tempfile.mkstemp(prefix="contrax_audit_", suffix=".pdf")
        os.close(fd)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    c_graphite = colors.HexColor("#0B0D0F")
    c_light = colors.HexColor("#F5F5F2")
    c_subtle_border = colors.HexColor("#333333")

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=24,
        textColor=c_graphite,
        spaceAfter=4
    )

    tagline_style = ParagraphStyle(
        "ReportTagline",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=10,
        textColor=colors.HexColor("#666666"),
        spaceAfter=15
    )

    heading2_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=c_graphite,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=c_graphite,
        spaceAfter=6
    )

    disclaimer_style = ParagraphStyle(
        "ReportDisclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        textColor=colors.HexColor("#555555"),
        spaceBefore=10
    )

    elements = []

    elements.append(Paragraph("CONTRAX SECURITY AUDIT REPORT", title_style))
    elements.append(Paragraph("See the flaw before they do.", tagline_style))
    elements.append(Spacer(1, 10))

    c_name = contract_info.get("name", "Target Contract")
    c_net = contract_info.get("network", "Local Upload")
    meta_data = [
        ["Target Contract:", c_name, "Network:", c_net],
        ["Compiler:", contract_info.get("compiler_version", "0.8.20"), "Verification:", "Verified" if contract_info.get("is_verified") else "Source / Unverified"]
    ]
    meta_table = Table(meta_data, colWidths=[90, 180, 90, 180])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('TEXTCOLOR', (0,0), (-1,-1), c_graphite),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("VULNERABILITY FINDINGS OVERVIEW", heading2_style))
    summary_data = [["SEVERITY", "TITLE", "FILE", "LINE", "CONFIDENCE"]]
    for f in findings:
        summary_data.append([
            f.get("severity", "LOW"),
            f.get("title", "")[:35],
            f.get("source_file", "")[:20],
            str(f.get("line_number", "-")),
            f.get("confidence", "HIGH")
        ])

    sum_table = Table(summary_data, colWidths=[80, 200, 120, 50, 90])
    sum_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EAEAEA")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CCCCCC")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(sum_table)
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("DETAILED SECURITY FINDINGS", heading2_style))
    for idx, f in enumerate(findings, 1):
        f_title = f"#{idx} [{f.get('severity')}] {f.get('title')}"
        elements.append(Paragraph(f_title, ParagraphStyle("FindingTitle", parent=styles["Heading3"], fontSize=11, fontName="Helvetica-Bold", textColor=c_graphite)))
        elements.append(Paragraph(f"<b>Detector:</b> {f.get('detector')} | <b>Category:</b> {f.get('category')}", body_style))
        elements.append(Paragraph(f"<b>Description:</b> {f.get('description')}", body_style))
        elements.append(Paragraph(f"<b>Impact:</b> {f.get('impact')}", body_style))
        elements.append(Paragraph(f"<b>Remediation:</b> {f.get('remediation')}", body_style))
        elements.append(Spacer(1, 8))

    elements.append(Spacer(1, 15))
    elements.append(Paragraph(
        "DISCLAIMER: Automated security analysis does not replace a complete manual smart-contract security audit. "
        "The findings presented herein represent algorithmic heuristic, static, and symbolic evaluations. "
        "Neither CONTRAX nor its developers assume liability for security vulnerabilities not identified by automated scans.",
        disclaimer_style
    ))

    try:
        doc.build(elements)
    except Exception as e:
        logger.error(f"PDF build error: {e}")

    return output_path
