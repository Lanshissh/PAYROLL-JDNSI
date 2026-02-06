import PDFDocument from 'pdfkit';
import { pdfDocToBuffer } from './pdfBuffer';

type MinutesBreakdown = {
  regular: number;
  overtime: number;
  nightDiff: number;
  holiday: number;
  restDay: number;
};

export type PayslipPdfInput = {
  companyName: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  employeeCode: string;
  employeeName: string;
  agencyName?: string;
  minutes: MinutesBreakdown;
  generatedAt: Date;
};

function minutesToHours(mins: number): number {
  if (!Number.isFinite(mins) || mins <= 0) return 0;
  return mins / 60;
}

function fmtHours(mins: number): string {
  const hours = minutesToHours(mins);
  return hours.toFixed(2);
}

function fmtDateISO(dateISO: string): string {
  // Expect YYYY-MM-DD; keep simple and stable for now.
  return dateISO;
}

function fmtGeneratedAt(date: Date): string {
  return date.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export async function buildPayslipPdf(input: PayslipPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    info: {
      Title: `Payslip - ${input.employeeName}`,
      Author: input.companyName
    }
  });

  const pageWidth = doc.page.width;
  const left = doc.page.margins.left;
  const right = pageWidth - doc.page.margins.right;

  // Base typography
  doc.font('Helvetica');
  doc.fontSize(10);

  // ----- Header -----
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(input.companyName, left, doc.y, {
      width: right - left,
      align: 'left'
    });

  doc
    .moveDown(0.2)
    .fontSize(12)
    .font('Helvetica')
    .text('Payslip', {
      width: right - left,
      align: 'left'
    });

  doc
    .moveDown(0.2)
    .fontSize(10)
    .fillColor('#444444')
    .text(`Payroll Period: ${fmtDateISO(input.periodStart)} to ${fmtDateISO(input.periodEnd)}`, {
      width: right - left,
      align: 'left'
    })
    .fillColor('black');

  doc
    .moveDown(0.8)
    .moveTo(left, doc.y)
    .lineTo(right, doc.y)
    .lineWidth(1)
    .strokeColor('#E5E7EB')
    .stroke()
    .strokeColor('black');

  doc.moveDown(1);

  // ----- Employee block -----
  const blockTop = doc.y;
  const blockPadding = 12;
  const blockWidth = right - left;
  const blockHeight = 86;

  doc
    .roundedRect(left, blockTop, blockWidth, blockHeight, 8)
    .fillOpacity(1)
    .fillAndStroke('#F9FAFB', '#E5E7EB');

  doc.fillColor('black');

  const contentLeft = left + blockPadding;
  const contentTop = blockTop + blockPadding;
  const colGap = 24;
  const colWidth = (blockWidth - blockPadding * 2 - colGap) / 2;

  // Left column
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Employee', contentLeft, contentTop, { width: colWidth });
  doc
    .font('Helvetica')
    .fontSize(11)
    .text(input.employeeName, contentLeft, doc.y + 2, { width: colWidth });
  doc
    .fontSize(10)
    .fillColor('#444444')
    .text(`Code: ${input.employeeCode}`, contentLeft, doc.y + 6, { width: colWidth })
    .fillColor('black');

  // Right column
  const rightColLeft = contentLeft + colWidth + colGap;
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Agency', rightColLeft, contentTop, { width: colWidth });
  doc
    .font('Helvetica')
    .fontSize(11)
    .text(input.agencyName ?? '—', rightColLeft, doc.y + 2, { width: colWidth });

  doc.y = blockTop + blockHeight + 18;

  // ----- Attendance summary table -----
  doc.font('Helvetica-Bold').fontSize(11).text('Attendance Summary', left, doc.y);
  doc.moveDown(0.6);

  const tableLeft = left;
  const tableRight = right;
  const tableWidth = tableRight - tableLeft;
  const rowHeight = 22;

  const col1 = Math.floor(tableWidth * 0.58);
  const col2 = tableWidth - col1;

  function drawRow(label: string, value: string, y: number, isHeader = false): void {
    const bg = isHeader ? '#F3F4F6' : '#FFFFFF';
    doc
      .rect(tableLeft, y, tableWidth, rowHeight)
      .fillAndStroke(bg, '#E5E7EB');

    doc.fillColor('black');
    doc
      .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(10)
      .text(label, tableLeft + 10, y + 6, { width: col1 - 20, align: 'left' });
    doc
      .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(10)
      .text(value, tableLeft + col1, y + 6, { width: col2 - 10, align: 'right' });
  }

  const startY = doc.y;
  let y = startY;

  drawRow('Type', 'Hours', y, true);
  y += rowHeight;

  const rows: Array<{ label: string; mins: number }> = [
    { label: 'Regular', mins: input.minutes.regular },
    { label: 'Overtime', mins: input.minutes.overtime },
    { label: 'Night Differential', mins: input.minutes.nightDiff },
    { label: 'Holiday', mins: input.minutes.holiday },
    { label: 'Rest Day', mins: input.minutes.restDay }
  ];

  for (const r of rows) {
    drawRow(r.label, fmtHours(r.mins), y);
    y += rowHeight;
  }

  const totalMinutes =
    input.minutes.regular +
    input.minutes.overtime +
    input.minutes.nightDiff +
    input.minutes.holiday +
    input.minutes.restDay;

  drawRow('Total', fmtHours(totalMinutes), y, true);
  y += rowHeight;

  doc.y = y + 18;

  // ----- Notes (placeholder for future pay components) -----
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#444444')
    .text(
      'Note: This payslip currently reflects attendance breakdown. Monetary computations (rates, deductions, net pay) can be added once payroll line items are stored.',
      left,
      doc.y,
      { width: right - left, align: 'left' }
    )
    .fillColor('black');

  // ----- Footer -----
  const footerText = `Generated ${fmtGeneratedAt(input.generatedAt)}`;
  const footerY = doc.page.height - doc.page.margins.bottom + 16;
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#6B7280')
    .text(footerText, left, footerY, { width: right - left, align: 'left' })
    .text('Page 1 of 1', left, footerY, { width: right - left, align: 'right' })
    .fillColor('black');

  doc.end();
  return await pdfDocToBuffer(doc);
}