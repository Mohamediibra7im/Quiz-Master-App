import { startQuiz, selectAnswer, nextQuestion, resetQuiz } from './quiz.js';

let elements = {};

export function initUI() {
  elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultsScreen: document.getElementById('results-screen'),
    
    startQuizBtn: document.getElementById('start-quiz-btn'),
    nextBtn: document.getElementById('next-btn'),
    restartBtn: document.getElementById('restart-btn'),
    
    questionCounter: document.getElementById('question-counter'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    progressBar: document.getElementById('progress-bar'),
    timer: document.getElementById('timer'),
    
    finalScore: document.getElementById('final-score'),
    totalQuestions: document.getElementById('total-questions'),
    correctAnswers: document.getElementById('correct-answers'),
    incorrectAnswers: document.getElementById('incorrect-answers'),
    timeTaken: document.getElementById('time-taken'),
    scoreMessage: document.getElementById('score-message'),
    reviewContainer: document.getElementById('review-container')
  };
  
  elements.startQuizBtn.addEventListener('click', handleStartQuiz);
  elements.nextBtn.addEventListener('click', handleNextQuestion);
  elements.restartBtn.addEventListener('click', handleRestartQuiz);
}

function showScreen(screenId) {
  const screens = ['welcome-screen', 'quiz-screen', 'results-screen'];
  
  screens.forEach(screen => {
    const element = document.getElementById(screen);
    if (element.id === screenId) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  });
}

export function updateUI(data) {
  if (data.timeRemaining !== undefined) {
    elements.timer.textContent = data.timeRemaining;
    
    if (data.timeRemaining <= 10) {
      elements.timer.classList.add('timer-low');
    } else {
      elements.timer.classList.remove('timer-low');
    }
  }
  
  if (data.question) {
    elements.questionText.textContent = data.question.text;
    elements.questionCounter.textContent = `Question ${data.questionIndex + 1}/${data.totalQuestions}`;
    
    const progressPercentage = ((data.questionIndex) / data.totalQuestions) * 100;
    elements.progressBar.style.width = `${progressPercentage}%`;
    
    elements.optionsContainer.innerHTML = '';
    
    data.question.options.forEach((option, index) => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option';
      optionElement.textContent = option;
      optionElement.dataset.index = index;
      
      optionElement.addEventListener('click', () => handleOptionSelect(index));
      
      elements.optionsContainer.appendChild(optionElement);
    });
  }
  
  if (data.selectedAnswer !== undefined && data.selectedAnswer !== null) {
    elements.nextBtn.disabled = false;
    
    const options = elements.optionsContainer.querySelectorAll('.option');
    
    options.forEach((option, index) => {
      if (index === data.selectedAnswer) {
        option.classList.add(data.isCorrect ? 'correct' : 'incorrect');
      }
      
      if (!data.isCorrect && index === data.correctAnswer) {
        option.classList.add('correct');
      }
      
      option.removeEventListener('click', () => handleOptionSelect(index));
      option.classList.add('disabled');
    });
    
    if (data.timeExpired) {
      const timeExpiredMessage = document.createElement('div');
      timeExpiredMessage.className = 'time-expired-message';
      timeExpiredMessage.textContent = 'Time expired!';
      elements.questionContainer.appendChild(timeExpiredMessage);
    }
  }
}

export function showResults(results) {
  showScreen('results-screen');
  
  elements.finalScore.textContent = results.score;
  elements.totalQuestions.textContent = results.totalQuestions;
  elements.correctAnswers.textContent = results.correctAnswers;
  elements.incorrectAnswers.textContent = results.incorrectAnswers;
  elements.timeTaken.textContent = results.timeTaken;
  
  let message = '';
  const motivationalMessages = [
    "Every question is a stepping stone to knowledge! 🌟",
    "Your curiosity and effort are admirable! Keep growing! 🌱",
    "Learning is a journey, and you're making great progress! 🚀",
    "Your dedication to learning shines through! ✨",
    "Each quiz makes you stronger and wiser! 💪"
  ];
  
  if (results.percentage >= 90) {
    message = "Outstanding achievement! You're a true quiz master! 🏆";
  } else if (results.percentage >= 70) {
    message = "Impressive performance! You really know your stuff! 🌟";
  } else if (results.percentage >= 50) {
    message = "Good effort! You're on the right track! 🎯";
  } else {
    message = "Keep going! Every attempt brings new learning! 💫";
  }
  
  elements.scoreMessage.textContent = message;
  
  const motivationalMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  const motivationElement = document.createElement('p');
  motivationElement.className = 'motivation-message';
  motivationElement.textContent = motivationalMessage;
  elements.scoreMessage.appendChild(motivationElement);
  
  const reviewContainer = elements.reviewContainer;
  reviewContainer.innerHTML = '<h2>Review Your Answers</h2>';
  
  results.questions.forEach((question, index) => {
    const questionReview = document.createElement('div');
    questionReview.className = 'question-review';
    
    const questionHeader = document.createElement('h3');
    questionHeader.textContent = `Question ${index + 1}: ${question.text}`;
    
    const answerStatus = document.createElement('div');
    answerStatus.className = `answer-status ${question.isCorrect ? 'correct' : 'incorrect'}`;
    answerStatus.innerHTML = question.isCorrect ? '✓ Correct!' : '✗ Incorrect';
    
    const correctAnswer = document.createElement('div');
    correctAnswer.className = 'correct-answer';
    correctAnswer.innerHTML = `<strong>Correct answer:</strong> ${question.options[question.correctAnswer]}`;
    
    questionReview.appendChild(questionHeader);
    questionReview.appendChild(answerStatus);
    
    if (!question.isCorrect) {
      if (question.selectedAnswer !== null) {
        const yourAnswer = document.createElement('div');
        yourAnswer.className = 'your-answer';
        yourAnswer.innerHTML = `<strong>Your answer:</strong> ${question.options[question.selectedAnswer]}`;
        questionReview.appendChild(yourAnswer);
      } else {
        const noAnswer = document.createElement('div');
        noAnswer.className = 'your-answer';
        noAnswer.innerHTML = '<strong>No answer provided</strong>';
        questionReview.appendChild(noAnswer);
      }
    }
    
    questionReview.appendChild(correctAnswer);
    reviewContainer.appendChild(questionReview);
  });
  
  elements.resultsScreen.scrollTop = 0;
}

function handleStartQuiz() {
  showScreen('quiz-screen');
  startQuiz();
}

function handleOptionSelect(index) {
  const result = selectAnswer(index);
  if (result) {
    if (result.isCorrect) {
      playSound('correct');
    } else {
      playSound('incorrect');
    }
  }
}

function handleNextQuestion() {
  elements.nextBtn.disabled = true;
  nextQuestion();
}

function handleRestartQuiz() {
  resetQuiz();
  showScreen('welcome-screen');
}

function playSound(type) {
  console.log(`Playing ${type} sound`);
}