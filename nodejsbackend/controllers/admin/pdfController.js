// Put this inside nodejsbackend/controllers/admin/reportsController.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generatePDFResponse(res, exams = [], options = {}) {
  const doc = new PDFDocument({ size: 'A4', margin: 50, autoFirstPage: false });

  // Stream headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${options.filename || 'exams-report'}.pdf"`);

  // Pipe to response
  doc.pipe(res);

  // Register fonts (ensure files exist at these paths)
  const fontsDir = path.join(__dirname, '..', '..', 'assets', 'fonts');
  try {
    doc.registerFont('Inter', path.join(fontsDir, 'Inter-Regular.ttf'));
    doc.registerFont('Inter-Bold', path.join(fontsDir, 'Inter-Bold.ttf'));
  } catch (err) {
    // fallback to built-in fonts if custom fonts missing
    // console.warn('Custom fonts missing, using default PDF fonts', err);
  }

  // Footer helper
  function drawFooter() {
    const bottom = doc.page.height - 40;
    doc.font('Inter').fontSize(9).fillColor('#666');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 50, bottom, { align: 'left' });
    doc.text(`Page ${doc.page.number}`, -50, bottom, { align: 'right' });
  }

  // Add first page and header setup
  function addNewPage() {
    doc.addPage();
    // Header
    const logoPath = path.join(__dirname, '..', '..', 'assets', 'images', 'logo.png');
    const headerY = 40;
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, headerY, { width: 60 });
      }
    } catch (e) {}
    doc.font('Inter-Bold').fontSize(20).fillColor('#111').text('EXAMS REPORT', 130, headerY + 6);
    doc.font('Inter').fontSize(10).fillColor('#666').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);
    // horizontal rule
    doc.moveTo(50, 120).lineTo(doc.page.width - 50, 120).strokeOpacity(0.08).stroke();
    // reserve start Y for body
    doc.y = 130;
  }

  // Add first page listener for footer on page add
  doc.on('pageAdded', () => {
    // draw footer for previous page? we draw footer when page is done below
  });

  // Create pages and layout content
  addNewPage();

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const cardGap = 12;
  const cardPadding = 10;
  const cardWidth = pageWidth;
  let cursorY = doc.y;
  const bottomLimit = doc.page.height - doc.page.margins.bottom - 60; // leave room for footer

  const renderExamCard = (ex) => {
    // compute height estimate then draw
    const x = doc.page.margins.left;
    let y = cursorY;

    // Estimate the text height by using a temporary text measure approach:
    doc.font('Inter-Bold').fontSize(14);
    const titleHeight = doc.heightOfString(ex.title || ex.name || 'Untitled', { width: cardWidth - cardPadding * 2 });
    doc.font('Inter').fontSize(10);
    const courseText = typeof ex.course === 'string' ? ex.course : (ex.course?.title || ex.course?.name || '');
    const courseHeight = doc.heightOfString(courseText || '', { width: cardWidth - cardPadding * 2 });
    const extraHeight = doc.heightOfString((ex.description || ''), { width: cardWidth - cardPadding * 2, align: 'left' });

    const cardHeight = Math.max(72, titleHeight + courseHeight + extraHeight + cardPadding * 2 + 18);

    // If not enough space on page, add new page
    if (y + cardHeight > bottomLimit) {
      // draw footer before adding page
      drawFooter();
      addNewPage();
      cursorY = doc.y;
      y = cursorY;
    }

    // Draw card background (light border + subtle fill)
    doc.roundedRect(x, y, cardWidth, cardHeight, 6).fillOpacity(0.03).fill('#000000');
    doc.roundedRect(x, y, cardWidth, cardHeight, 6).strokeOpacity(0.06).stroke('#000000');

    // Content
    const innerX = x + cardPadding;
    let innerY = y + cardPadding;

    doc.fillColor('#111').font('Inter-Bold').fontSize(14).text(ex.title || ex.name || 'Untitled', innerX, innerY, { width: cardWidth - cardPadding * 2 });
    innerY += titleHeight + 6;

    doc.font('Inter').fontSize(10).fillColor('#444').text(courseText || '', innerX, innerY, { width: cardWidth - cardPadding * 2 });
    innerY += courseHeight + 8;

    const dateStr = ex.date ? new Date(ex.date).toLocaleDateString() : (ex.examDate ? new Date(ex.examDate).toLocaleDateString() : '—');
    const durationStr = ex.duration ?? ex.time ?? '—';
    const studentsStr = (ex.studentCount ?? ex.participants) ?? '—';

    doc.font('Inter').fontSize(10).fillColor('#333')
      .text(`Date: ${dateStr}`, innerX, innerY, { continued: true })
      .text(`  •  Duration: ${durationStr} mins`, { continued: true })
      .text(`  •  Students: ${studentsStr}`);

    // Move cursor
    cursorY = y + cardHeight + cardGap;
    doc.y = cursorY;
  };

  // Add roundedRect helper (PDFKit <= no built-in roundedRect, implement helper)
  if (!doc.roundedRect) {
    PDFDocument.prototype.roundedRect = function (x, y, w, h, r) {
      // clamp radius
      r = Math.min(r || 0, w / 2, h / 2);
      this.moveTo(x + r, y)
        .lineTo(x + w - r, y)
        .quadraticCurveTo(x + w, y, x + w, y + r)
        .lineTo(x + w, y + h - r)
        .quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        .lineTo(x + r, y + h)
        .quadraticCurveTo(x, y + h, x, y + h - r)
        .lineTo(x, y + r)
        .quadraticCurveTo(x, y, x + r, y);
      return this;
    };
  }

  // Render each exam
  for (let i = 0; i < exams.length; i += 1) {
    const ex = exams[i];
    renderExamCard(ex);
  }

  // Final footer on last page
  drawFooter();

  // Finish PDF
  doc.end();
}

module.exports = {
  generatePDFResponse,
};