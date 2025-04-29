const socket = io();

function joinGame() {
  const teamName = document.getElementById('teamName').value.trim();
  if (teamName) {
    socket.emit('joinGame', teamName);
    window.location.href = '/lobby.html';
  }
}

function startQuiz() {
  socket.emit('startQuiz');
}

socket.on('setQuizMaster', () => {
  const startBtn = document.getElementById('startQuizBtn');
  if (startBtn) {
    startBtn.style.display = 'block';
  }
});

socket.on('updateLobby', (teams) => {
  const playerList = document.getElementById('playerList');
  if (playerList) {
    playerList.innerHTML = '<h2>Teams:</h2><ul>' +
      teams.map(name => `<li>${name}</li>`).join('') +
      '</ul>';
  }
});

socket.on('startQuiz', () => {
  window.location.href = '/quiz.html';
});

socket.on('newQuestion', (questionData) => {
  const qArea = document.getElementById('questionArea');
  const aButtons = document.getElementById('answerButtons');
  if (qArea && aButtons) {
    qArea.innerHTML = `<h2>${questionData.question}</h2>`;
    aButtons.innerHTML = questionData.answers.map((ans, index) =>
      `<button onclick="submitAnswer('${ans}')">${ans}</button>`
    ).join('');
  }
});

function submitAnswer(answer) {
  socket.emit('submitAnswer', answer);
}

socket.on('showResults', ({ correct, incorrect, noAnswer, correctAnswer }) => {
  const qArea = document.getElementById('questionArea');
  const aButtons = document.getElementById('answerButtons');
  const resultsArea = document.getElementById('resultsArea');
  const nextBtn = document.getElementById('nextQuestionBtn');

  if (qArea && aButtons && resultsArea && nextBtn) {
    qArea.innerHTML = `<h2>Correct Answer: ${correctAnswer}</h2>`;
    aButtons.innerHTML = '';
    resultsArea.style.display = 'block';
    resultsArea.innerHTML = `
      <p>Correct: ${correct}</p>
      <p>Incorrect: ${incorrect}</p>
      <p>No Answer: ${noAnswer}</p>
    `;
    nextBtn.style.display = 'block';
  }
});

function nextQuestion() {
  socket.emit('nextQuestion');
}

socket.on('readyForNext', () => {
  const qArea = document.getElementById('questionArea');
  const aButtons = document.getElementById('answerButtons');
  const resultsArea = document.getElementById('resultsArea');
  const nextBtn = document.getElementById('nextQuestionBtn');

  if (qArea && aButtons && resultsArea && nextBtn) {
    qArea.innerHTML = '<h2>Waiting for next question...</h2>';
    aButtons.innerHTML = '';
    resultsArea.style.display = 'none';
    nextBtn.style.display = 'none';
  }
});
