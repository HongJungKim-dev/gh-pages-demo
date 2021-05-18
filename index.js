const express = require('express');
const http = require('http');

const app = express();

app.use(express.json());

app.get('/', async (req, res, next) => {
  res.writeHead('200', { 'Content-Type': 'text/html;charset=utf-8' });
  console.log('서버 응답');
  console.log('안녕');
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
let i = 0;

app.post('/', async (req, res, next) => {
    const { roomTitle, roomCode, hostName } = req.body;
    const isHost = true;
    const roomInfo = { roomTitle, roomCode, hostName };
    room.push(roomInfo);

    console.log("room : "+room.roomTitle);
    res.status(200).json({
      message: 'WeTube room create success!!!',
      result: room,
    });
  });

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
    try{
        res.status(200).json({
                message: 'get users data success',
                roomTitle: room[0].roomTitle,
                hostName: room[0].hostName,
                roomCode: room[0].roomCode,
        });
     } catch (error){
        console.log('방이 하나도 없음');
     }
});

app.post('/room', async (req, res) => {
  const { roomTitle, roomCode, hostName } = req.body;
  const isHost = true;
  const roomInfo = { roomTitle, roomCode, hostName, isHost};

  room.push(roomInfo);

  res.status(200).json({
    message: 'WeTube room create success now',
    result: room,
  });
});

app.set('port', process.env.PORT || 3000);

const server = http.createServer(app);

// http Server를 socket.io 서버로 업그레이드
const io = require('socket.io')(server);
io.sockets.on('connection', (socket) => {
  console.log(`socket ${socket.id} connected: `)

  socket.on('enter', (data) => {
    const roomData = JSON.parse(data)
    const user_name = roomData.userName
    const room_code = roomData.roomCode

    socket.join(`${room_code}`)

    console.log(`${user_name} entered room:${room_code}`)

    const enterData = {
      type : "ENTER",
      content : `${user_name}님이 입장하셨습니다.`
    }
    socket.broadcast.to(`${room_code}`).emit('update', JSON.stringify(enterData))
  })

  socket.on('exit', (data) => {
    const roomData = JSON.parse(data)
    const user_name = roomData.user_name
    const room_code = roomData.room_code

    socket.leave(`${room_code}`)

    console.log(`${user_name} exits room:${room_code}`)

    const exitData = {
      type : "EXIT",
      content : `${user_name}님이 퇴장하셨습니다.`
    }
    socket.broadcast.to(`${room_code}`).emit('update', JSON.stringify(exitData))
  })

  socket.on('newMessage', (data) => {
    const messageData = JSON.parse(data)
    console.log(`room code: ${messageData.to} / from: ${messageData.from} / ${messageData.content}`)
    socket.broadcast.to(`${messageData.to}`).emit('update', JSON.stringify(messageData))
  })

  socket.on('disconnect', () => {
    console.log(`socket ${socket.id} disconnected`)
  })
})

server.listen(app.get('port'), () => {
  app.get('port');
});