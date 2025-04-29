const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = {};
let quizMasterId = null;
let currentQuestion = null;
let currentAnswers = {};
let questionTimer = null;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinGame', (teamName) => {
    if (!quizMasterId) {
      quizMasterId = socket.id;
      players[socket.id] = { name: teamName, isQuizMaster: true };
      socket.emit('setQuizMaster');
    } else {
      players[socket.id] = { name: teamName, isQuizMaster: false };
    }
    io.emit('updateLobby', Object.values(players).map(p => p.name));
  });

  socket.on('startQuiz', () => {
    io.emit('startQuiz');
  });

  socket.on('sendQuestion', (questionData) => {
    currentQuestion = questionData;
    currentAnswers = {};
    io.emit('newQuestion', questionData);
  });

  socket.on('submitAnswer', (answer) => {
    if (!currentAnswers[socket.id]) {
      currentAnswers[socket.id] = answer;
    }
  });

  socket.on('showResults', () => {
    let correct = 0, incorrect = 0, noAnswer = 0;
    Object.keys(players).forEach(id => {
      if (!currentAnswers[id]) {
        noAnswer++;
      } else if (currentAnswers[id] === currentQuestion.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    io.emit('showResults', { correct, incorrect, noAnswer, correctAnswer: currentQuestion.correctAnswer });
  });

  socket.on('nextQuestion', () => {
    io.emit('readyForNext');
  });

  socket.on('disconnect', () => {
    if (players[socket.id]) {
      if (socket.id === quizMasterId) {
        quizMasterId = null;
      }
      delete players[socket.id];
    }
    io.emit('updateLobby', Object.values(players).map(p => p.name));
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
