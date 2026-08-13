const { prisma } = require('../../database');



/*
exports.getStudentResults = async (req, res) => {
  const studentId = req.student.studentId;
  
  try {
    const results = await prisma.examResult.findMany({
      where: { 
        studentId: parseInt(studentId),
        status: { in: ['COMPLETED', 'ARCHIVED'] }
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            course: {
              select: {
                code: true,
                title: true
              }
            },
            examiner: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            passingScore: true
          }
        },
        studentAnswers: {
          include: {
            question: {
              select: {
                questionText: true,
                questionType: true,
                correctAnswer: true
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Calculate grade and performance
    const formattedResults = results.map(result => {
      const totalQuestions = result.totalQuestions || result.studentAnswers.length;
      const correctCount = result.studentAnswers.filter(a => a.isCorrect === true).length;
      const percentage = result.percentage || (totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0);
      
      return {
        id: result.id,
        exam: result.exam,
        score: result.score,
        percentage: parseFloat(percentage.toFixed(2)),
        correctAnswers: correctCount,
        totalQuestions: totalQuestions,
        status: result.status,
        submittedAt: result.submittedAt,
        timeSpent: result.timeSpent,
        grade: calculateGrade(percentage, result.exam.passingScore || 60),
        isPassed: percentage >= (result.exam.passingScore || 60),
        answers: result.studentAnswers.map(answer => ({
          question: answer.question.questionText,
          questionType: answer.question.questionType,
          studentAnswer: answer.studentResponse,
          correctAnswer: answer.question.correctAnswer,
          isCorrect: answer.isCorrect
        }))
      };
    });

    res.status(200).json({
      success: true,
      studentId,
      totalResults: results.length,
      results: formattedResults
    });
  } catch (err) {
    console.error('❌ Get student results error:', err);
    res.status(500).json({
      message: 'Failed to fetch results',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
*/
exports.getStudentResults = async (req, res) => {
  const studentId = req.student.studentId;
  
  try {
    const results = await prisma.examResult.findMany({
      where: { 
        studentId: parseInt(studentId),
        status: { in: ['COMPLETED', 'ARCHIVED'] }
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            course: {
              select: {
                code: true,
                title: true
              }
            },
            examiner: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            passingScore: true,
            // Include the actual questions to know how many of each type
            questions: {
              select: {
                id: true,
                questionType: true
              }
            }
          }
        },
        studentAnswers: {
          include: {
            question: {
              select: {
                questionText: true,
                questionType: true,
                correctAnswer: true,
                // Include options for multiple choice
                options: true
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Process each result
    const formattedResults = results.map(result => {
      // Get actual total questions from the exam
      const actualTotalQuestions = result.exam.questions.length;
      
      // Grade each answer properly
      const gradedAnswers = result.studentAnswers.map(answer => {
        let isCorrect = false;
        const questionType = answer.question.questionType;
        const studentResponse = answer.studentResponse?.trim() || '';
        const correctAnswer = answer.question.correctAnswer?.trim() || '';

        switch (questionType) {
          case 'MULTIPLE_CHOICE':
            // Exact match for multiple choice
            isCorrect = studentResponse === correctAnswer;
            break;

          case 'TRUE_FALSE':
            // Normalize case for true/false
            isCorrect = studentResponse.toLowerCase() === correctAnswer.toLowerCase();
            break;

          case 'SHORT_ANSWER':
            // Semantic comparison for short answers
            // Option 1: Exact match (case insensitive)
            // isCorrect = studentResponse.toLowerCase() === correctAnswer.toLowerCase();
            
            // Option 2: Contains key phrases (more flexible)
            const keywords = correctAnswer.toLowerCase().split(/\s+/);
            const studentWords = studentResponse.toLowerCase().split(/\s+/);
            const matchCount = keywords.filter(word => 
              studentWords.some(sw => sw.includes(word) || word.includes(sw))
            ).length;
            // Consider correct if 80% of keywords match
            isCorrect = matchCount / keywords.length >= 0.8;
            
            // Option 3: Use Levenshtein distance or other similarity metrics
            // const similarity = calculateSimilarity(studentResponse, correctAnswer);
            // isCorrect = similarity >= 0.7;
            break;

          case 'ESSAY':
            // Essays are typically graded manually
            // Use the existing isCorrect from database if graded
            isCorrect = answer.isCorrect || false;
            break;

          case 'FILL_BLANK':
            // Case insensitive exact match
            isCorrect = studentResponse.toLowerCase() === correctAnswer.toLowerCase();
            break;

          case 'MATCHING':
            // Could be complex - use database value
            isCorrect = answer.isCorrect || false;
            break;

          default:
            isCorrect = answer.isCorrect || false;
        }

        return {
          ...answer,
          isCorrect: isCorrect,
          gradedAt: new Date().toISOString()
        };
      });

      // Count correct answers
      const correctCount = gradedAnswers.filter(a => a.isCorrect === true).length;
      
      // Calculate percentage based on ALL questions in the exam
      const percentage = actualTotalQuestions > 0 
        ? (correctCount / actualTotalQuestions) * 100 
        : 0;

      // Update the result with the correct counts
      return {
        id: result.id,
        exam: {
          ...result.exam,
          questionCount: actualTotalQuestions
        },
        score: result.score || correctCount,
        percentage: parseFloat(percentage.toFixed(2)),
        correctAnswers: correctCount,
        totalQuestions: actualTotalQuestions,
        status: result.status,
        submittedAt: result.submittedAt,
        timeSpent: result.timeSpent,
        grade: calculateGrade(percentage, result.exam.passingScore || 60),
        isPassed: percentage >= (result.exam.passingScore || 60),
        answers: gradedAnswers.map(answer => ({
          question: answer.question.questionText,
          questionType: answer.question.questionType,
          studentAnswer: answer.studentResponse,
          correctAnswer: answer.question.correctAnswer,
          isCorrect: answer.isCorrect,
          options: answer.question.options
        })),
        // Summary by question type
        summary: {
          totalQuestions: actualTotalQuestions,
          correctCount: correctCount,
          byType: gradedAnswers.reduce((acc, answer) => {
            const type = answer.question.questionType;
            if (!acc[type]) {
              acc[type] = { total: 0, correct: 0 };
            }
            acc[type].total++;
            if (answer.isCorrect) acc[type].correct++;
            return acc;
          }, {})
        }
      };
    });

    res.status(200).json({
      success: true,
      studentId,
      totalResults: results.length,
      results: formattedResults
    });
  } catch (err) {
    console.error('❌ Get student results error:', err);
    res.status(500).json({
      message: 'Failed to fetch results',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Helper function for similarity calculation (optional)
function calculateSimilarity(str1, str2) {
  // Levenshtein distance or other similarity metric
  // This is a simple implementation - you might want to use a library
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  let costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
}

/**
 * Get detailed result for a specific exam
 */
exports.getExamResultDetails = async (req, res) => {
  const studentId = req.student.studentId;
  const { examId } = req.params;
  
  try {
    const result = await prisma.examResult.findFirst({
      where: { 
        studentId: parseInt(studentId),
        examId: parseInt(examId)
      },
      include: {
        exam: {
          include: {
            course: true,
            examiner: true,
            examQuestions: {
              include: {
                question: {
                  include: {
                    studentAnswers: {
                      where: { examResultId: parseInt(examId) }
                    }
                  }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        },
        studentAnswers: {
          include: {
            question: {
              select: {
                questionText: true,
                questionType: true,
                options: true,
                correctAnswer: true,
                points: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!result) {
      return res.status(404).json({ 
        message: 'Result not found for this exam' 
      });
    }

    // Detailed analysis
    const detailedAnalysis = result.exam.examQuestions.map((examQuestion, index) => {
      const studentAnswer = result.studentAnswers.find(
        sa => sa.questionId === examQuestion.question.id
      );
      
      return {
        questionNumber: index + 1,
        question: examQuestion.question.questionText,
        questionType: examQuestion.question.questionType,
        options: examQuestion.question.options,
        correctAnswer: examQuestion.question.correctAnswer,
        studentAnswer: studentAnswer?.studentResponse || 'Not answered',
        isCorrect: studentAnswer?.isCorrect || false,
        points: examQuestion.points || 1,
        timeSpent: studentAnswer?.timeSpent || null
      };
    });

    const totalScore = detailedAnalysis.reduce((sum, q) => 
      sum + (q.isCorrect ? q.points : 0), 0
    );
    const totalPossible = detailedAnalysis.reduce((sum, q) => sum + q.points, 0);
    const percentage = (totalScore / totalPossible) * 100;

    res.status(200).json({
      success: true,
      result: {
        id: result.id,
        exam: {
          title: result.exam.title,
          course: result.exam.course,
          examiner: result.exam.examiner,
          passingScore: result.exam.passingScore || 60
        },
        score: totalScore,
        totalPossible: totalPossible,
        percentage: parseFloat(percentage.toFixed(2)),
        grade: calculateGrade(percentage, result.exam.passingScore || 60),
        isPassed: percentage >= (result.exam.passingScore || 60),
        submittedAt: result.submittedAt,
        timeSpent: result.timeSpent,
        totalQuestions: detailedAnalysis.length,
        correctAnswers: detailedAnalysis.filter(q => q.isCorrect).length,
        wrongAnswers: detailedAnalysis.filter(q => !q.isCorrect && q.studentAnswer !== 'Not answered').length,
        unanswered: detailedAnalysis.filter(q => q.studentAnswer === 'Not answered').length,
        questionAnalysis: detailedAnalysis
      }
    });
  } catch (err) {
    console.error('❌ Get exam result details error:', err);
    res.status(500).json({
      message: 'Failed to fetch result details',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Get performance statistics
 */
exports.getPerformanceStats = async (req, res) => {
  const studentId = req.student.studentId;
  
  try {
    const results = await prisma.examResult.findMany({
      where: { 
        studentId: parseInt(studentId),
        status: 'COMPLETED'
      },
      include: {
        exam: {
          include: {
            course: true
          }
        }
      }
    });

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalExams: 0,
          averageScore: 0,
          passRate: 0,
          byCourse: {},
          recentPerformance: []
        }
      });
    }

    // Calculate statistics
    const totalExams = results.length;
    const passedExams = results.filter(r => {
      const percentage = r.percentage || (r.score / r.totalQuestions) * 100;
      return percentage >= (r.exam.passingScore || 60);
    }).length;
    
    const averageScore = results.reduce((sum, r) => {
      const percentage = r.percentage || (r.score / r.totalQuestions) * 100;
      return sum + percentage;
    }, 0) / totalExams;

    // Group by course
    const byCourse = {};
    results.forEach(result => {
      const courseName = result.exam.course.code;
      const percentage = result.percentage || (result.score / result.totalQuestions) * 100;
      
      if (!byCourse[courseName]) {
        byCourse[courseName] = {
          course: result.exam.course.title,
          code: courseName,
          totalExams: 0,
          averageScore: 0,
          scores: []
        };
      }
      
      byCourse[courseName].totalExams++;
      byCourse[courseName].scores.push(percentage);
      byCourse[courseName].averageScore = 
        byCourse[courseName].scores.reduce((a, b) => a + b, 0) / 
        byCourse[courseName].totalExams;
    });

    // Recent performance (last 5 exams)
    const recentPerformance = results
      .slice(0, 5)
      .map(r => ({
        examId: r.examId,
        examTitle: r.exam.title,
        score: r.score,
        percentage: r.percentage || (r.score / r.totalQuestions) * 100,
        submittedAt: r.submittedAt,
        isPassed: (r.percentage || (r.score / r.totalQuestions) * 100) >= (r.exam.passingScore || 60)
      }));

    res.status(200).json({
      success: true,
      stats: {
        totalExams,
        passedExams,
        passRate: parseFloat(((passedExams / totalExams) * 100).toFixed(2)),
        averageScore: parseFloat(averageScore.toFixed(2)),
        byCourse: Object.values(byCourse).map(course => ({
          ...course,
          averageScore: parseFloat(course.averageScore.toFixed(2))
        })),
        recentPerformance,
        totalQuestionsAnswered: results.reduce((sum, r) => sum + (r.totalQuestions || 0), 0),
        totalCorrectAnswers: results.reduce((sum, r) => sum + (r.correctAnswers || 0), 0)
      }
    });
  } catch (err) {
    console.error('❌ Get performance stats error:', err);
    res.status(500).json({
      message: 'Failed to fetch performance stats',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Helper function
function calculateGrade(percentage, passingScore = 60) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= passingScore) return 'C';
  if (percentage >= passingScore - 10) return 'D';
  return 'F';
}