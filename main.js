import './css/main.css';
import './css/animations.css';
import './css/responsive.css';

import { initQuiz } from './js/quiz.js';
import { initUI } from './js/ui.js';
import { questions } from './data/questions.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();

  initQuiz(questions);
  
  console.log('QuizMaster initialized successfully!');
});