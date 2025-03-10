import { createSlice } from "@reduxjs/toolkit";


  
const initialState = {
    currentQuiz: null,
    //or questions:[...] spread operator 
    questions: [
        {
            id: 1,
            questionText: 'What is the capital of France?',
            points: 1,
            answers: [
                { id: 1, answerText: 'Paris', isCorrect: true },
                { id: 2, answerText: 'London', isCorrect: false },
                { id: 3, answerText: 'Berlin', isCorrect: false },
                { id: 4, answerText: 'Madrid', isCorrect: false }
            ]
        },
        {
            id: 2,
            questionText: 'Which of these is a runtime environment?',
            points: 1,
            answers: [
                { id: 1, answerText: 'PHP', isCorrect: false },
                { id: 2, answerText: 'Node.JS', isCorrect: true },
                { id: 3, answerText: 'ReactJS', isCorrect: false },
                { id: 4, answerText: 'Python', isCorrect: false }
            ]
        },
        {
            id: 3,
            questionText: 'Which of these is not an Integrated Development Environment (IDE)?',
            points: 1,
            answers: [
                { id: 1, answerText: 'Sublime Text', isCorrect: false },
                { id: 2, answerText: 'VSCode', isCorrect: true },
                { id: 3, answerText: 'Django', isCorrect: false },
                { id: 4, answerText: 'PyCharm', isCorrect: false }
            ]
        },
        {
            id: 4,
            questionText: 'Which programming language is typically used for iOS development?',
            points: 1,
            answers: [
                { id: 1, answerText: 'Java', isCorrect: false },
                { id: 2, answerText: 'Swift', isCorrect: true },
                { id: 3, answerText: 'Python', isCorrect: false },
                { id: 4, answerText: 'C#', isCorrect: false }
            ]
        },
        {
            id: 5,
            questionText: 'What does SQL stand for?',
            points: 1,
            answers: [
                { id: 1, answerText: 'Strong Query Language', isCorrect: false },
                { id: 2, answerText: 'Structured Query Language', isCorrect: true },
                { id: 3, answerText: 'Simple Query Language', isCorrect: false },
                { id: 4, answerText: 'System Query Language', isCorrect: false }
            ]
        },
        {
            id: 6,
            questionText: 'Which of these is NOT a JavaScript framework?',
            points: 1,
            answers: [
                { id: 1, answerText: 'Angular', isCorrect: false },
                { id: 2, answerText: 'Django', isCorrect: true },
                { id: 3, answerText: 'Vue', isCorrect: false },
                { id: 4, answerText: 'React', isCorrect: false }
            ]
        },
        {
            id: 7,
            questionText: 'What is the primary purpose of HTML?',
            points: 1,
            answers: [
                { id: 1, answerText: 'Styling web pages', isCorrect: false },
                { id: 2, answerText: 'Structuring web content', isCorrect: true },
                { id: 3, answerText: 'Database management', isCorrect: false },
                { id: 4, answerText: 'Server-side processing', isCorrect: false }
            ]
        },
        {
            id: 8,
            questionText: 'Which data structure follows the LIFO (Last In, First Out) principle?',
            points: 1,
            answers: [
                { id: 1, answerText: 'Queue', isCorrect: false },
                { id: 2, answerText: 'Stack', isCorrect: true },
                { id: 3, answerText: 'Array', isCorrect: false },
                { id: 4, answerText: 'Tree', isCorrect: false }
            ]
        },
        {
            id: 9,
            questionText: 'What is the purpose of Git?',
            points: 1,
            answers: [
                { id: 1, answerText: 'Database Management', isCorrect: false },
                { id: 2, answerText: 'Version Control', isCorrect: true },
                { id: 3, answerText: 'Web Hosting', isCorrect: false },
                { id: 4, answerText: 'Code Compilation', isCorrect: false }
            ]
        },
        {
            id: 10,
            questionText: 'Which of these is a NoSQL database?',
            points: 1,
            answers: [
                { id: 1, answerText: 'PostgreSQL', isCorrect: false },
                { id: 2, answerText: 'MongoDB', isCorrect: true },
                { id: 3, answerText: 'MySQL', isCorrect: false },
                { id: 4, answerText: 'Oracle', isCorrect: false }
            ]
        },
        {
            id: 11,
            questionText: 'What does API stand for?',
            points: 1,
            answers: [
                { id: 1, answerText: 'Advanced Programming Interface', isCorrect: false },
                { id: 2, answerText: 'Application Programming Interface', isCorrect: true },
                { id: 3, answerText: 'Automated Program Integration', isCorrect: false },
                { id: 4, answerText: 'Advanced Program Integration', isCorrect: false }
            ]
        }

    ],
    currentQuestion: 0,
    answers: {}, //Changed to object
    score: 0,
    loading: false,
    error: null,
    timeRemaining: 1800 // 30 minutes in seconds
};

const trial_quizSlice = createSlice({
    name: 'trial_quiz',
    initialState,
    reducers: {
        startQuiz: (state, action) => {
            state.currentQuiz = {
                id: action.payload.id,
                title: action.payload.title
            };
            state.currentQuestion = 0;
            state.answers = [];
            state.score = 0;
        },
        setQuestions(state, action) {
            state.questions = action.payload;
        },
        nextQuestion: (state) => {
            if (state.currentQuestion < state.questions.length - 1) {
                state.currentQuestion += 1;
            }
        },
        prevQuestion: (state) => {
            if (state.currentQuestion > 0) {
                state.currentQuestion -= 1;
            }
        },
        updateTimer: (state) => {
            if (state.timeRemaining > 0) {
                state.timeRemaining -= 1;
            }
        },
        submitAnswer: (state, action) => {
            // Debug logs
            console.log('Current Question Index:', state.currentQuestion);
            console.log('Question ID:', state.questions[state.currentQuestion].id);
            console.log('Previous Answers:', JSON.stringify(state.answers));
            
            // Store answer with question ID
            const currentQuestionId = state.questions[state.currentQuestion].id;
            state.answers = {
                ...state.answers,
                [currentQuestionId]: action.payload
            };
            
            // Debug log after update
            console.log('Updated Answers:', JSON.stringify(state.answers));
            
            // Update score
            if (action.payload.isCorrect) {
                state.score += 1;
            }
        },
        setCurrentQuiz(state, action) {
            state.currentQuiz = action.payload;
        },
        setCurrentQuestion: (state, action) => {
            state.currentQuestion = action.payload;
        },
        setAnswers(state, action) {
            state.answers = action.payload;
        },
        setScore(state, action) {
            state.score = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        }
    }
});

export const {
    setCurrentQuestion,
    startQuiz,
    setQuestions,
    nextQuestion,
    updateTimer,
    prevQuestion,
    submitAnswer,
    setCurrentQuiz,
    setAnswers,
    setScore,
    setLoading,
    setError
} = trial_quizSlice.actions;

export default trial_quizSlice.reducer;