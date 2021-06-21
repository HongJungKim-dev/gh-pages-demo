const express = require('express');
const http = require('http');
const mysql = require('mysql');
const app = express();
require('events').EventEmitter.prototype._maxListeners = 100;

var db = mysql.createConnection({ //mysql 연결 하는 부분
    host:'localhost', 
    user:'root',
    password:'', // 이거는 mysql 설치시 설정한 비번
    database:'wetube', //mysql db 만든 부분 
    multipleStatements: true
  });
  db.connect();

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
let room = [];
let dbIndex = 0;
db.query(`SELECT * from room`, function(error2, result2){
  if(error2){throw error2;}
for(; dbIndex<result2.length; dbIndex++){
  room.push({
	  roomTitle: result2[dbIndex].DbRoomTitle,
	  roomCode: result2[dbIndex].DbRoomCode,
	  hostName: result2[dbIndex].DbHostName,
  });
}
});  
const arr = [];
let i = 0;

/*app.post('/', async (req, res, next) => {
  const { roomTitle, roomCode, hostName } = null;
    const { roomTitle, roomCode, hostName } = req.body;
    const isHost = true;
    const roomInfo = { roomTitle, roomCode, hostName };
    room.push(roomInfo); // room에 정보 다 들어가 있음  객체를 배열안에 넣음 
  


    console.log("room : "+room.roomTitle);
    res.status(200).json({
      message: 'WeTube room create success!!!'+result,
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
*/
app.get('/user', async (req, res) => {
  res.status(200).json({
    message: 'get users data success',
    userSize: users.length,
    users,
  });
});

/*app.post('/user', async (req, res) => {
  const { user } = req.body;

  users.push({
    user,
  });

  console.log('post user: '+users);
  res.status(200).json({
    message: 'post users data success',
    result: users,
  });
});
*/
app.post('/media', async (req, res) => {
  const { roomCode, videoTitle, publisher, thumbnailUrl, videoId } = req.body;

  let newRoomIfon = {}
  room.forEach((roomInfo) => {
    if( roomInfo.roomCode == roomCode){
        newRoomInfo = { ...roomInfo,  videoTitle, publisher, thumbnailUrl, videoId }
    }
  })

  room = room.filter((roomInfo) => roomInfo.roomCode !== roomCode)
  room.push(newRoomInfo)

  res.status(200).json({
    message: 'post media data success',
    result: room,
  });
});

app.post('/user', async (req, res) => {
  const { userName, roomCode } = req.body;

  let newRoomInfo = {}
  room.forEach((roomInfo) => {
    if( roomInfo.roomCode == roomCode){
        newRoomInfo = { ...roomInfo, userName }
    }
  })

  room = room.filter((roomInfo) => roomInfo.roomCode !== roomCode)
  
  room.push(newRoomInfo)
  users.push({
    userName,
  });

  res.status(200).json({
    message: 'post users data success',
    result: newRoomInfo.userName,
  });
});

app.get('/room', async (req, res) => {
    try{

      db.query(`SELECT * from room`, function(error2, result2){
        if(error2){throw error2;}
      
	if(dbIndex < result2.length){
	  for(; dbIndex<result2.length; dbIndex++){
              room.push({
                roomTitle: result2[dbIndex].DbRoomTitle,
                roomCode: result2[dbIndex].DbRoomCode,
                hostName: result2[dbIndex].DbHostName,
  	      });

      	  }
	}
      });
      
	res.status(200).json({
		message: 'get users data success',
		roomSize: room.length,    //room
    room,

        
	});
  
} catch (error){
	console.log('방이 하나도 없음');
     }
});

app.post('/room', async (req, res) => {
  const { roomTitle, roomCode, hostName } = req.body;
  //const isHost = true;
  const roomInfo = { roomTitle, roomCode, hostName};


  db.query(`INSERT INTO room (DbRoomTitle, DbRoomCode, DbHostName) VALUES (?,?,?)`, [roomTitle, roomCode, hostName], function(error, result){
    if(error){ throw error; }
   
    });

    db.query(`SELECT * from room`, function(error2, room){
      if(error2){throw error2;}

    roomResult = room;
      console.log(roomResult);
      
    });   

  room.push(roomInfo);
  dbIndex++;
  res.status(200).json({
    message: 'WeTube room create success now',
    result: room,
  });
});

app.set('port', process.env.PORT || 3000 || 3001 || 3002);

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

  socket.on('syncData', (data) => {
    const syncData = JSON.parse(data)
    const isHost = syncData.isHost;
    const hostTimestamp = syncData.hostTimestamp;
    const videoId = syncData.videoId;
    const room_code = syncData.roomCode;

    socket.join(`${room_code}`)
    console.log(`hostTimestamp: ${hostTimestamp}`)
    socket.broadcast.to(`${room_code}`).emit('sync', JSON.stringify(syncData))
  })

  socket.on('pauseData', (data) => {
    const pauseData = JSON.parse(data)
    const isPaused = pauseData.isPaused;
    const room_code = pauseData.roomCode;
    socket.join(`${room_code}`)
    console.log(`host paused the video`)
    socket.broadcast.to(`${room_code}`).emit('pause', JSON.stringify(pauseData))
  })


  socket.on('exit', (data) => {
    const roomData = JSON.parse(data)
    const user_name = roomData.userName
    const room_code = roomData.roomCode

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


