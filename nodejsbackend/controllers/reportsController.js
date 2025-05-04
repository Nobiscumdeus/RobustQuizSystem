const express=require('express');
const { prisma } = require('../database'); // Import prisma client
const PDFDocument =require('pdfkit');
const excel =require('exceljs');

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
  
      let data;
  
      switch (type) {
        case 'exams':
          data = await prisma.exam.findMany({
            where: dateFilter,
            include: { course: true }
          });
          break;
        case 'students':
          data = await prisma.student.findMany({
            where: dateFilter,
            include: { exams: true }
          });
          break;
        case 'courses':
          data = await prisma.course.findMany({
            where: dateFilter,
            include: { exams: true }
          });
          break;
        case 'results':
          data = await prisma.exam.findMany({
            where: dateFilter,
            include: { 
              course: true,
              results: {
                include: { student: true }
              }
            }
          });
          break;
        case 'attendance':
          data = await prisma.exam.findMany({
            where: dateFilter,
            include: { 
              course: true,
              attendances: {
                include: { student: true }
              }
            }
          });
          break;
        case 'all':
          data = {
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
            })
          };
          break;
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }
  
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch report data' });
    }
  };

  

  //Generate PDF report 
  const generatePDF=async(res,data,type)=>{
    const doc=new PDFDocument();
    res.setHeader('Content-Type','application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment;filename=report-${type}-${new Date().toISOString().split('T')[0]}.pdf`

    )

    doc.pipe(res);
    
  // Add title
  doc.fontSize(20).text(`${type.toUpperCase()} REPORT`, { align: 'center' });
  doc.moveDown();

  // Add date
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
  doc.moveDown();

   // Add content based on report type
   switch (type) {
    case 'exams':
      // Add exam data table
      doc.fontSize(14).text('Exams List', { underline: true });
      data.forEach((exam) => {
        doc.fontSize(12)
          .text(`Title: ${exam.title}`)
          .text(`Course: ${exam.course.title}`)
          .text(`Date: ${exam.date.toLocaleDateString()}`)
          .text(`Duration: ${exam.duration} minutes`)
          .moveDown();
      });
      break;
    // Add other cases as needed
  }

  doc.end();

  }


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
  
      let data;
  
      // Fetch data based on type
      switch (type) {
        case 'exams':
          data = await prisma.exam.findMany({
            where: dateFilter,
            include: { course: true }
          });
          break;
        case 'students':
          data = await prisma.student.findMany({
            where: dateFilter,
            include: { exams: true }
          });
          break;
        case 'courses':
          data = await prisma.course.findMany({
            where: dateFilter,
            include: { exams: true }
          });
          break;
        case 'results':
          data = await prisma.exam.findMany({
            where: dateFilter,
            include: { 
              course: true,
              results: {
                include: { student: true }
              }
            }
          });
          break;
        case 'attendance':
          data = await prisma.exam.findMany({
            where: dateFilter,
            include: { 
              course: true,
              attendances: {
                include: { student: true }
              }
            }
          });
          break;
        case 'all':
          data = await prisma.exam.findMany({
            where: dateFilter,
            include: { 
              course: true,
              results: {
                include: { student: true }
              }
            }
          });
          break;
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }
  
      // Generate the report based on format
      switch (format) {
        case 'pdf':
          await generatePDF(res, data, type);
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
      res.status(500).json({ error: 'Failed to generate report' });
    }
  };