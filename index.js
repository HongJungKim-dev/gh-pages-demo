const express = require('express');
const http = require('http');

const app = express();

app.use(express.json());

app.get('/', async (req, res, next) => {
  res.writeHead('200', { 'Content-Type': 'text/html;charset=utf-8' });
  res.end('<h1>서버에서 응답한 결과입니다</h1>');
});

app.get('/read', async (req, res, next) => {
  res.status(200).json({
    message: 'WeTube room read success',
  });
});

const users = [];
const room = [];
const arr = [];

app.post('/create', async (req, res, next) => {
  const { data } = req.body;

  arr.push(data);
  res.status(200).json({
    message: 'WeTube room create success',
    result: arr,
  });
});

app.get('/user', async (req, res) => {
  res.status(200).json({
    message: 'get users data success',
    result: users,
  });
});

app.post('/user', async (req, res) => {
  const { user } = req.body;

  users.push({
    user,
  });

  res.status(200).json({
    message: 'post users data success',
    result: users,
  });
});

app.get('/room', async (req, res) => {
  res.status(200).json({
    message: 'get users data success',
    result: room,
  });
});

app.post('/room', async (req, res) => {
  const { roomInfo } = req.body;

  room.push(roomInfo);

  res.status(200).json({
    message: 'WeTube room create success',
    result: room,
  });
});

app.set('port', process.env.PORT || 3000);

http.createServer(app).listen(app.get('port'), () => {
  app.get('port');
});
