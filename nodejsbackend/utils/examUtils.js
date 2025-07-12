const crypto = require('crypto');
const prisma=require('../database')

const generateExamPassword = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Real-time exam monitoring
const examTimeTracker = new Map();

const startExamTimer = (studentId, examId, duration) => {
  const key = `${studentId}_${examId}`;
  const startTime = Date.now();
  const endTime = startTime + (duration * 60 * 1000);
  
  examTimeTracker.set(key, {
    startTime,
    endTime,
    duration
  });
  
  // Auto-submit after duration
  setTimeout(async () => {
    await autoSubmitExam(studentId, examId);
  }, duration * 60 * 1000);
};

const autoSubmitExam = async (studentId, examId) => {
  try {
    const result = await prisma.examResult.findFirst({
      where: {
        studentId,
        examId,
        status: 'IN_PROGRESS'
      }
    });

    if (result) {
      await prisma.examResult.update({
        where: { id: result.id },
        data: {
          status: 'COMPLETED',
          submittedAt: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Auto-submit error:', error);
  }
};

module.exports = {
  generateExamPassword,
  startExamTimer,
  examTimeTracker
};
