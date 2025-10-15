"""
PDF Report Generation Service
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from datetime import datetime
import io
from storage_service import storage_service

class ReportService:
    def generate_pdf_report(self, audits: list, filters) -> str:
        """Generate PDF report from audit data"""
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=1
        )
        elements.append(Paragraph("Asset Inspection Report", title_style))
        elements.append(Spacer(1, 0.25*inch))
        
        # Report Info
        info_style = styles['Normal']
        elements.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", info_style))
        elements.append(Paragraph(f"<b>Date Range:</b> {filters.start_date} to {filters.end_date}", info_style))
        elements.append(Paragraph(f"<b>Total Audits:</b> {len(audits)}", info_style))
        elements.append(Spacer(1, 0.5*inch))
        
        # Table
        table_data = [['Asset', 'Date', 'Status', 'Urgency', 'Inspector', 'Summary', 'Structured Output']]
        
        for audit in audits:
            table_data.append([
                Paragraph(f"<b>{audit[1]}</b><br/>{audit[2]}", styles['Normal']),
                audit[4].strftime('%Y-%m-%d'),
                audit[5],
                audit[6],
                audit[8],
                Paragraph(audit[7], styles['Normal']),
                Paragraph(audit[9], styles['Normal'])
            ])
        
        table = Table(table_data, colWidths=[1.2*inch, 0.8*inch, 0.6*inch, 0.6*inch, 1*inch, 1.8*inch, 1.5*inch], repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ('FONTSIZE', (0, 1), (-1, -1), 7)
        ]))
        
        elements.append(table)
        doc.build(elements)
        
        # Upload to blob storage
        pdf_buffer.seek(0)
        blob_name = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        report_url = storage_service.upload_report(pdf_buffer.read(), blob_name)
        
        return report_url

report_service = ReportService()