// Predefined security questions for password reset
const SECURITY_QUESTIONS = [
  {
    id: 1,
    question: 'What is the name of your first pet?',
    category: 'personal'
  },
  {
    id: 2,
    question: 'What city were you born in?',
    category: 'personal'
  },
  {
    id: 3,
    question: 'What is your mother\'s maiden name?',
    category: 'family'
  },
  {
    id: 4,
    question: 'What is the name of your best friend in high school?',
    category: 'personal'
  },
  {
    id: 5,
    question: 'What was the name of your first teacher?',
    category: 'education'
  },
  {
    id: 6,
    question: 'What is your favorite movie?',
    category: 'preference'
  },
  {
    id: 7,
    question: 'What street did you live on in third grade?',
    category: 'personal'
  },
  {
    id: 8,
    question: 'What is the make and model of your first car?',
    category: 'personal'
  },
  {
    id: 9,
    question: 'What is your favorite book?',
    category: 'preference'
  },
  {
    id: 10,
    question: 'What was your first job?',
    category: 'career'
  }
];

module.exports = {
  SECURITY_QUESTIONS,
  getQuestionById: (id) => SECURITY_QUESTIONS.find(q => q.id === id),
  getRandomQuestions: (count = 3) => {
    const shuffled = [...SECURITY_QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
};
