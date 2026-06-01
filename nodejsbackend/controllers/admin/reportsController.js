const fs = require('fs');
const path = require('path');
const { prisma } = require('@database'); // Import prisma client
const PDFDocument = require('pdfkit');
const excel = require('exceljs');

const DEFAULT_PDF_FONT = 'Helvetica';
const DEFAULT_PDF_FONT_BOLD = 'Helvetica-Bold';

const formatDate = (value, fallback = '—') => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString();
};

const formatDateTime = (value, fallback = '—') => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleString();
};

const getCourseLabel = (course) => {
  if (!course) {
    return '';
  }

  if (typeof course === 'string') {
    return course;
  }

  return course.title || course.name || '';
};

const getDisplayName = (entity, fallback) => {
  if (!entity) {
    return fallback;
  }

  return entity.title || entity.name || entity.fullName || entity.username || entity.email || fallback;
};

const fetchReportDataByType = async (type, dateFilter) => {
  switch (type) {
    case 'exams':
      return prisma.exam.findMany({
        where: dateFilter,
        include: { course: true }
      });
    case 'students':
      return prisma.student.findMany({
        where: dateFilter,
        include: { exams: true }
      });
    case 'courses':
      return prisma.course.findMany({
        where: dateFilter,
        include: { exams: true }
      });
    case 'results':
      return prisma.exam.findMany({
        where: dateFilter,
        include: {
          course: true,
          results: {
            include: { student: true }
          }
        }
      });
    case 'attendance':
      return prisma.exam.findMany({
        where: dateFilter,
        include: {
          course: true,
          attendances: {
            include: { student: true }
          }
        }
      });
    case 'all':
      return {
        exams: await prisma.exam.findMany({
          where: dateFilter,
          include: { course: true }
        }),
        students: await prisma.student.findMany({
          where: dateFilter,
          include: { exams: true }
        }),
        courses: await prisma.course.findMany({
          where: dateFilter,
          include: { exams: true }
        }),
        results: await prisma.exam.findMany({
          where: dateFilter,
          include: {
            course: true,
            results: {
              include: { student: true }
            }
          }
        }),
        attendance: await prisma.exam.findMany({
          where: dateFilter,
          include: {
            course: true,
            attendances: {
              include: { student: true }
            }
          }
        })
      };
    default:
      throw new Error('Invalid report type');
  }
};

const mapItemsForPdf = (type, data) => {
  switch (type) {
    case 'exams':
      return (data || []).map((exam, index) => ({
        title: getDisplayName(exam, `Exam ${index + 1}`),
        subtitle: getCourseLabel(exam.course),
        description: exam.description || '',
        meta: [
          `Date: ${formatDate(exam.date || exam.examDate)}`,
          `Duration: ${exam.duration ?? exam.time ?? '—'} mins`,
          `Students: ${exam.studentCount ?? exam.participants ?? '—'}`
        ]
      }));
    case 'students':
      return (data || []).map((student, index) => ({
        title: getDisplayName(student, `Student ${index + 1}`),
        subtitle: student.email || student.phone || '',
        description: student.bio || student.note || '',
        meta: [
          `Exams: ${student.exams?.length ?? 0}`,
          `Joined: ${formatDate(student.createdAt)}`
        ]
      }));
    case 'courses':
      return (data || []).map((course, index) => ({
        title: getDisplayName(course, `Course ${index + 1}`),
        subtitle: course.code || course.department || '',
        description: course.description || '',
        meta: [
          `Exams: ${course.exams?.length ?? 0}`,
          `Created: ${formatDate(course.createdAt)}`
        ]
      }));
    case 'results':
      return (data || []).flatMap((exam, examIndex) => {
        const results = exam.results || [];
        if (!results.length) {
          return [{
            title: getDisplayName(exam, `Exam ${examIndex + 1}`),
            subtitle: getCourseLabel(exam.course),
            description: 'No results recorded',
            meta: [
              `Date: ${formatDate(exam.date || exam.examDate)}`
            ]
          }];
        }

        return results.map((result, resultIndex) => ({
          title: getDisplayName(result.student, `Result ${resultIndex + 1}`),
          subtitle: getDisplayName(exam, `Exam ${examIndex + 1}`),
          description: result.notes || result.comment || '',
          meta: [
            `Course: ${getCourseLabel(exam.course)}`,
            `Score: ${result.score ?? result.marks ?? '—'}`,
            `Submitted: ${formatDateTime(result.createdAt)}`
          ]
        }));
      });
    case 'attendance':
      return (data || []).flatMap((exam, examIndex) => {
        const attendances = exam.attendances || [];
        if (!attendances.length) {
          return [{
            title: getDisplayName(exam, `Exam ${examIndex + 1}`),
            subtitle: getCourseLabel(exam.course),
            description: 'No attendance records',
            meta: [
              `Date: ${formatDate(exam.date || exam.examDate)}`
            ]
          }];
        }

        return attendances.map((attendance, attendanceIndex) => ({
          title: getDisplayName(attendance.student, `Attendance ${attendanceIndex + 1}`),
          subtitle: getDisplayName(exam, `Exam ${examIndex + 1}`),
          description: attendance.note || attendance.status || '',
          meta: [
            `Course: ${getCourseLabel(exam.course)}`,
            `Recorded: ${formatDateTime(attendance.createdAt)}`
          ]
        }));
      });
    default:
      return [];
  }
};

const mapSectionsForPdf = (type, data) => {
  if (type !== 'all') {
    return [
      {
        title: `${type.toUpperCase()} REPORT`,
        items: mapItemsForPdf(type, data)
      }
    ];
  }

  return [
    { title: 'EXAMS', items: mapItemsForPdf('exams', data.exams) },
    { title: 'STUDENTS', items: mapItemsForPdf('students', data.students) },
    { title: 'COURSES', items: mapItemsForPdf('courses', data.courses) },
    { title: 'RESULTS', items: mapItemsForPdf('results', data.results) },
    { title: 'ATTENDANCE', items: mapItemsForPdf('attendance', data.attendance) }
  ];
};

//Helper function to calculate date filter
const getDateFilter=(range)=>{
    const now=new Date()
    let startDate

    switch(range){
        case 'last-week':
            startDate=new Date(now.setDate(now.getDate()-7))
            break;
        case 'last-month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case 'last-quarter':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
        case 'last-year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        case 'custom':
            // We may need to implement custom date handling
            break;
        case 'all':
        default:
            return {}
    }

    return {createdAt : {gte:startDate}}

}

// Get report data (for preview)
exports.getReportData = async (req, res) => {
    try {
        const { type, range } = req.query;
        const dateFilter = getDateFilter(range);

        const data = await fetchReportDataByType(type, dateFilter);

        res.json(data);
    } catch (error) {
        console.error(error);
        const isInvalidType = error.message === 'Invalid report type';
        res.status(isInvalidType ? 400 : 500).json({
            error: isInvalidType ? 'Invalid report type' : 'Failed to fetch report data'
        });
    }
};


// Generate PDF report
// Generate PDF report
const generatePDFResponse = (res, data, type, options = {}) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const pdfDate = new Date();
    const filename = options.filename || `report-${type}-${pdfDate.toISOString().split('T')[0]}`;
    const title = options.title || `${type.toUpperCase()} REPORT`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

    doc.pipe(res);

    const fontsDir = path.join(__dirname, '..', '..', 'assets', 'fonts');
    let bodyFont = DEFAULT_PDF_FONT;
    let titleFont = DEFAULT_PDF_FONT_BOLD;

    if (fs.existsSync(path.join(fontsDir, 'Inter-Regular.ttf')) && fs.existsSync(path.join(fontsDir, 'Inter-Bold.ttf'))) {
        try {
            doc.registerFont('Inter', path.join(fontsDir, 'Inter-Regular.ttf'));
            doc.registerFont('Inter-Bold', path.join(fontsDir, 'Inter-Bold.ttf'));
            bodyFont = 'Inter';
            titleFont = 'Inter-Bold';
        } catch (error) {
            // ignore font errors
        }
    }

    const logoPath = path.join(__dirname, '..', '..', 'assets', 'images', 'logo.png');
    
    const roundedRect = (x, y, w, h, r) => {
        const radius = Math.min(r || 0, w / 2, h / 2);
        doc.moveTo(x + radius, y)
            .lineTo(x + w - radius, y)
            .quadraticCurveTo(x + w, y, x + w, y + radius)
            .lineTo(x + w, y + h - radius)
            .quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
            .lineTo(x + radius, y + h)
            .quadraticCurveTo(x, y + h, x, y + h - radius)
            .lineTo(x, y + radius)
            .quadraticCurveTo(x, y, x + radius, y);
        return doc;
    };

    // Draw header on current page
    const drawHeader = (pageTitle) => {
        const headerY = 36;
        
        // Draw logo
        if (fs.existsSync(logoPath)) {
            try {
                doc.image(logoPath, 50, headerY, { width: 48 });
            } catch (error) {
                // ignore logo errors
            }
        }

        // Draw title and date
        doc.font(titleFont).fontSize(20).fillColor('#111').text(title, 120, headerY + 4);
        doc.font(bodyFont).fontSize(10).fillColor('#666').text(`Generated on: ${pdfDate.toLocaleDateString()}`, 120, headerY + 28);
        
        // Draw page title if provided
        if (pageTitle) {
            doc.font(titleFont).fontSize(12).fillColor('#111').text(pageTitle, 50, 92);
            doc.y = 126;
        } else {
            doc.y = 112;
        }

        // Draw separator line
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).lineWidth(0.5).strokeOpacity(0.08).stroke();
        doc.y += 12;
    };

    // Draw footer on current page
    const drawFooter = () => {
        const bottom = doc.page.height - 35;
        doc.save();
        doc.font(bodyFont).fontSize(9).fillColor('#666');
        doc.text(`Generated: ${formatDateTime(pdfDate)}`, 50, bottom, { align: 'left' });
        doc.text(`Page ${doc.page.number}`, doc.page.width - 50, bottom, { align: 'right' });
        doc.restore();
    };

    const renderItemCard = (item) => {
        const x = doc.page.margins.left;
        const cardWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const cardPadding = 12;
        const cardGap = 12;
        const contentWidth = cardWidth - cardPadding * 2;
        const subtitle = item.subtitle || '';
        const description = item.description || '';
        const metaLines = Array.isArray(item.meta) ? item.meta.filter(Boolean) : [];

        // Calculate heights
        doc.font(titleFont).fontSize(14);
        const titleHeight = doc.heightOfString(item.title || 'Untitled', { width: contentWidth });
        doc.font(bodyFont).fontSize(10);
        const subtitleHeight = subtitle ? doc.heightOfString(subtitle, { width: contentWidth }) : 0;
        const descriptionHeight = description ? doc.heightOfString(description, { width: contentWidth }) : 0;
        const metaHeight = metaLines.length ? doc.heightOfString(metaLines.join('   •   '), { width: contentWidth }) : 0;
        const cardHeight = Math.max(76, cardPadding * 2 + titleHeight + subtitleHeight + descriptionHeight + metaHeight + 20);

        // Check if we need a new page
        const bottomLimit = doc.page.height - doc.page.margins.bottom - 60;
        if (doc.y + cardHeight > bottomLimit) {
            drawFooter();
            doc.addPage();
            drawHeader(options.pageTitle || title);
        }

        const y = doc.y;
        
        // Draw card background
        doc.save();
        roundedRect(x, y, cardWidth, cardHeight, 8);
        doc.fillOpacity(0.035).fill('#000000');
        roundedRect(x, y, cardWidth, cardHeight, 8);
        doc.strokeOpacity(0.08).stroke('#000000');
        doc.restore();

        // Draw card content
        const innerX = x + cardPadding;
        let innerY = y + cardPadding;

        doc.font(titleFont).fontSize(14).fillColor('#111').text(item.title || 'Untitled', innerX, innerY, { width: contentWidth });
        innerY += titleHeight + 4;

        if (subtitle) {
            doc.font(bodyFont).fontSize(10).fillColor('#444').text(subtitle, innerX, innerY, { width: contentWidth });
            innerY += subtitleHeight + 4;
        }

        if (description) {
            doc.font(bodyFont).fontSize(10).fillColor('#555').text(description, innerX, innerY, { width: contentWidth });
            innerY += descriptionHeight + 4;
        }

        if (metaLines.length) {
            doc.font(bodyFont).fontSize(9).fillColor('#333').text(metaLines.join('   •   '), innerX, innerY, { width: contentWidth });
        }

        doc.y = y + cardHeight + cardGap;
    };

    // Draw initial header
    drawHeader(options.pageTitle || title);

    // Process all sections
    const sections = mapSectionsForPdf(type, data);
    
    sections.forEach((section) => {
        if (!section.items || !section.items.length) {
            // Draw "no records" message
            doc.font(titleFont).fontSize(12).fillColor('#111').text(section.title, 50, doc.y, { width: doc.page.width - 100 });
            doc.font(bodyFont).fontSize(10).fillColor('#666').text('No records found', 50, doc.y + 18, { width: doc.page.width - 100 });
            doc.y += 36;
            return;
        }

        // Draw section title for 'all' report type
        if (type === 'all') {
            // Check if we need a new page for section title
            const bottomLimit = doc.page.height - doc.page.margins.bottom - 60;
            if (doc.y + 28 > bottomLimit) {
                drawFooter();
                doc.addPage();
                drawHeader(options.pageTitle || title);
            }
            
            doc.font(titleFont).fontSize(13).fillColor('#111').text(section.title, 50, doc.y, { width: doc.page.width - 100 });
            doc.y += 20;
        }

        // Render all items in this section
        section.items.forEach((item) => {
            renderItemCard(item);
        });

        // Add spacing between sections
        if (type === 'all') {
            doc.y += 12;
        }
    });

    // Draw footer on the last page
    drawFooter();
    doc.end();
};


  // Generate Excel report
const generateExcel = async (res, data, type) => {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Report');
  
    // Add headers and data based on report type
    switch (type) {
      case 'exams':
        worksheet.columns = [
          { header: 'Exam ID', key: 'id', width: 10 },
          { header: 'Title', key: 'title', width: 30 },
          { header: 'Course', key: 'course', width: 20 },
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Duration', key: 'duration', width: 10 },
        ];
        worksheet.addRows(data.map(exam => ({
          id: exam.id,
          title: exam.title,
          course: exam.course.title,
          date: exam.date.toLocaleDateString(),
          duration: exam.duration
        })));
        break;
      // Add other cases as needed
    }
  
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=report-${type}-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  
    await workbook.xlsx.write(res);
    res.end();
  };
  


  // Generate CSV report
const generateCSV = async (res, data, type) => {
    let csvContent = '';
    
    // Add headers
    switch (type) {
      case 'exams':
        csvContent += 'ID,Title,Course,Date,Duration\n';
        data.forEach((exam) => {
          csvContent += `${exam.id},${exam.title},${exam.course.title},${exam.date.toISOString()},${exam.duration}\n`;
        });
        break;
      // Add other cases as needed
    }
  
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=report-${type}-${new Date().toISOString().split('T')[0]}.csv`
    );
    res.send(csvContent);
  };
  
// Generate report file
exports.generateReport = async (req, res) => {
    try {
        const { type, range, format } = req.query;
        const dateFilter = getDateFilter(range);

        const data = await fetchReportDataByType(type, dateFilter);

        switch (format) {
            case 'pdf':
                generatePDFResponse(res, data, type, {
                    filename: `report-${type}-${new Date().toISOString().split('T')[0]}`,
                    pageTitle: `${type.toUpperCase()} REPORT`
                });
                break;
            case 'csv':
                await generateCSV(res, data, type);
                break;
            case 'excel':
                await generateExcel(res, data, type);
                break;
            default:
                return res.status(400).json({ error: 'Invalid format' });
        }
    } catch (error) {
        console.error(error);
        const isInvalidType = error.message === 'Invalid report type';
        res.status(isInvalidType ? 400 : 500).json({
            error: isInvalidType ? 'Invalid report type' : 'Failed to generate report'
        });
    }
};