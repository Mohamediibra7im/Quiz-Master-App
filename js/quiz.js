import { updateUI, showResults } from './ui.js';

// Quiz state
let state = {
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  selectedAnswer: null,
  answeredQuestions: 0,
  isQuizActive: false,
  timer: null,
  timeRemaining: 30,
  startTime: null,
  endTime: null,
  questionResults: []
};

// Initialize the quiz with questions
export function initQuiz(questions) {
  state.questions = questions;
  resetQuiz();
}

// Reset quiz to initial state
export function resetQuiz() {
  state = {
    ...state,
    currentQuestionIndex: 0,
    score: 0,
    selectedAnswer: null,
    answeredQuestions: 0,
    isQuizActive: false,
    timeRemaining: 30,
    startTime: null,
    endTime: null,
    questionResults: []
  };
}

// Start the quiz
export function startQuiz() {
  state.isQuizActive = true;
  state.startTime = new Date();
  loadQuestion(0);
}

// Load a specific question
export function loadQuestion(index) {
  if (index >= state.questions.length) {
    endQuiz();
    return;
  }

  state.currentQuestionIndex = index;
  state.selectedAnswer = null;
  state.timeRemaining = 30;
  startTimer();

  updateUI({
    questionIndex: index,
    totalQuestions: state.questions.length,
    question: state.questions[index],
    selectedAnswer: null,
    timeRemaining: state.timeRemaining
  });
}

// Handle answer selection
export function selectAnswer(answerIndex) {
  if (state.selectedAnswer !== null) return;

  state.selectedAnswer = answerIndex;
  state.answeredQuestions++;

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCorrect = answerIndex === currentQuestion.correctAnswer;

  if (isCorrect) {
    state.score++;
  }

  // Store question result
  state.questionResults.push({
    text: currentQuestion.text,
    options: currentQuestion.options,
    correctAnswer: currentQuestion.correctAnswer,
    selectedAnswer: answerIndex,
    isCorrect: isCorrect
  });

  clearInterval(state.timer);

  updateUI({
    questionIndex: state.currentQuestionIndex,
    totalQuestions: state.questions.length,
    question: currentQuestion,
    selectedAnswer: answerIndex,
    isCorrect
  });

  return {
    isCorrect,
    correctAnswer: currentQuestion.correctAnswer
  };
}

// Load the next question
export function nextQuestion() {
  loadQuestion(state.currentQuestionIndex + 1);
}

// End the quiz and show results
export function endQuiz() {
  state.isQuizActive = false;
  state.endTime = new Date();
  clearInterval(state.timer);

  // Calculate time taken
  const timeTaken = Math.floor((state.endTime - state.startTime) / 1000);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Calculate results
  const results = {
    score: state.score,
    totalQuestions: state.questions.length,
    correctAnswers: state.score,
    incorrectAnswers: state.answeredQuestions - state.score,
    unansweredQuestions: state.questions.length - state.answeredQuestions,
    timeTaken: formattedTime,
    percentage: Math.round((state.score / state.questions.length) * 100),
    questions: state.questionResults
  };

  // Save score to local storage if it's a high score
  saveScoreIfHighest(results.score);

  // Show results screen
  showResults(results);
}

// Start timer for current question
function startTimer() {
  clearInterval(state.timer);
  
  state.timer = setInterval(() => {
    state.timeRemaining--;
    
    updateUI({
      timeRemaining: state.timeRemaining
    });
    
    if (state.timeRemaining <= 0) {
      clearInterval(state.timer);
      
      // If no answer selected, treat as incorrect
      if (state.selectedAnswer === null) {
        const currentQuestion = state.questions[state.currentQuestionIndex];
        
        // Store question result for unanswered question
        state.questionResults.push({
          text: currentQuestion.text,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.correctAnswer,
          selectedAnswer: null,
          isCorrect: false
        });
        
        updateUI({
          questionIndex: state.currentQuestionIndex,
          totalQuestions: state.questions.length,
          question: currentQuestion,
          selectedAnswer: -1, // No answer selected
          isCorrect: false,
          correctAnswer: currentQuestion.correctAnswer,
          timeExpired: true
        });
        
        state.answeredQuestions++;
      }
    }
  }, 1000);
}

// Save score to local storage if it's a high score
function saveScoreIfHighest(score) {
  const highScore = localStorage.getItem('quizHighScore') || 0;
  
  if (score > highScore) {
    localStorage.setItem('quizHighScore', score);
    return true;
  }
  
  return false;
}

// Get the current quiz state
export function getQuizState() {
  return { ...state };
}