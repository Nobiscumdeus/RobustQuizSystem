// api/examApi.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  //baseURL: process.env.REACT_APP_API_URL || '/api',
 baseURL: 'http://localhost:5000/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      localStorage.removeItem('studentToken');
      window.location.href = '/student/login';
    }
    return Promise.reject(error);
  }
);

// Retry function for failed requests
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// ============= AUTHENTICATION =============
export const studentAuth = {
  // Student login with matric number and exam password
  login: async (matricNo, password) => {
    const response = await api.post('/exam/login', {
      matricNo,
      password: password
    });
    
    if (response.data.token) {
      localStorage.setItem('studentToken', response.data.token);
    }
    
    return response.data;
  },

  // Get student's available exams
  getAvailableExams: async (matricNo) => {
    const response = await api.get(`/student/${matricNo}/exams`);
    return response.data;
  },

  // Verify student session
  verifySession: async () => {
    const response = await api.get('/auth/student/verify');
    return response.data;
  }
};

// ============= EXAM SESSION MANAGEMENT =============
export const examSession = {
  // Fetch complete exam session data
  fetchExamSession: async (examId, studentId) => {
    const response = await api.get(`/exam/${examId}/session`, {
      params: { studentId }
    });
    return response.data;
  },

  // Start new exam session
  startSession: async (examId, studentId) => {
    const response = await api.post(`/exam/${examId}/start`, {
      studentId
    });
    return response.data;
  },

  // Check if exam session is still valid
  checkSessionStatus: async (sessionId) => {
    const response = await api.get(`/exam/session/${sessionId}/status`);
    return response.data;
  },

  // End exam session
  endSession: async (sessionId) => {
    const response = await api.post(`/exam/session/${sessionId}/end`);
    return response.data;
  }
};

// ============= QUESTION MANAGEMENT =============
export const questionManager = {
  // Load questions in batches (pagination)
  fetchQuestionBatch: async (examId, page = 1, batchSize = 5) => {
    const response = await api.get(`/exam/${examId}/questions`, {
      params: { page, limit: batchSize }
    });
    return response.data;
  },

  // Get single question by ID
  fetchQuestion: async (examId, questionId) => {
    const response = await api.get(`/exam/${examId}/questions/${questionId}`);
    return response.data;
  },

  // Preload next batch of questions
  preloadQuestions: async (examId, startIndex, count = 3) => {
    const response = await api.get(`/exam/${examId}/questions/preload`, {
      params: { startIndex, count }
    });
    return response.data;
  }
};

// ============= ANSWER MANAGEMENT =============
export const answerManager = {
  // Update single answer (auto-save)
  updateAnswer: async (sessionId, questionId, answer) => {
    return retryRequest(async () => {
      const response = await api.put(`/exam/session/${sessionId}/answer`, {
        questionId,
        answer,
        timestamp: new Date().toISOString()
      });
      return response.data;
    });
  },

  // Save multiple answers (batch save)
  saveAnswerBatch: async (sessionId, answers) => {
    return retryRequest(async () => {
      const response = await api.put(`/exam/session/${sessionId}/answers/batch`, {
        answers,
        timestamp: new Date().toISOString()
      });
      return response.data;
    });
  },

  // Get student's current answers
  getCurrentAnswers: async (sessionId) => {
    const response = await api.get(`/exam/session/${sessionId}/answers`);
    return response.data;
  }
};

// ============= EXAM SUBMISSION =============
export const examSubmission = {
  // Submit final exam
  submitExam: async (sessionId, answers, violations = []) => {
    const response = await api.post(`/exam/session/${sessionId}/submit`, {
      answers,
      violations,
      submittedAt: new Date().toISOString()
    });
    return response.data;
  },

  // Auto-submit (when time runs out)
  autoSubmitExam: async (sessionId, answers, reason = 'TIME_UP') => {
    const response = await api.post(`/exam/session/${sessionId}/auto-submit`, {
      answers,
      reason,
      submittedAt: new Date().toISOString()
    });
    return response.data;
  }
};

// ============= TIMER & SYNC =============
export const timerSync = {
  // Sync remaining time with server
  syncTimer: async (sessionId) => {
    const response = await api.get(`/exam/session/${sessionId}/time`);
    return response.data;
  },

  // Send heartbeat to keep session alive
  sendHeartbeat: async (sessionId) => {
    const response = await api.post(`/exam/session/${sessionId}/heartbeat`);
    return response.data;
  },

  // Check if exam is still active
  checkExamStatus: async (examId) => {
    const response = await api.get(`/exam/${examId}/status`);
    return response.data;
  }
};

// ============= PROCTORING & VIOLATIONS =============
export const proctoring = {
  // Log proctoring violation
  logViolation: async (sessionId, violationType, details) => {
    const response = await api.post(`/exam/session/${sessionId}/violation`, {
      type: violationType,
      details,
      timestamp: new Date().toISOString()
    });
    return response.data;
  },

  // Get violation history
  getViolations: async (sessionId) => {
    const response = await api.get(`/exam/session/${sessionId}/violations`);
    return response.data;
  }
};

// ============= CONNECTION & HEALTH =============
export const connectionManager = {
  // Check API health
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Test connection speed
  testConnection: async () => {
    const start = Date.now();
    await api.get('/ping');
    const end = Date.now();
    return { latency: end - start };
  }
};

// ============= OFFLINE SUPPORT =============
export const offlineManager = {
  // Queue answers for offline sync
  queueAnswer: (sessionId, questionId, answer) => {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    queue.push({
      sessionId,
      questionId,
      answer,
      timestamp: new Date().toISOString(),
      synced: false
    });
    localStorage.setItem('offline_queue', JSON.stringify(queue));
  },

  // Sync offline answers when online
  syncOfflineAnswers: async () => {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    const unsynced = queue.filter(item => !item.synced);
    
    for (const item of unsynced) {
      try {
        await answerManager.updateAnswer(item.sessionId, item.questionId, item.answer);
        item.synced = true;
      } catch (error) {
        console.error('Failed to sync offline answer:', error);
      }
    }
    
    localStorage.setItem('offline_queue', JSON.stringify(queue));
    return unsynced.length;
  }
};

// Export main API object (for backward compatibility)
export const examinationApi = {
  ...studentAuth,
  ...examSession,
  ...questionManager,
  ...answerManager,
  ...examSubmission,
  ...timerSync,
  ...proctoring,
  ...connectionManager,
  ...offlineManager
};

// Default export
export default examinationApi;