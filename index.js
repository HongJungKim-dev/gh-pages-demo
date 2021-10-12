const express = require('express');
const http = require('http');
const mysql = require('mysql');//
const app = express();
require('events').EventEmitter.prototype._maxListeners = 100;

let db = mysql.createConnection({ //mysql 연결 하는 부분
  host: 'localhost',
  user: 'root',
  password: 'Navihoney135*', // mysql 설치시 설정한 비번
  database: 'wetube', //mysql db 만든 부분 
  multipleStatements: true
});
db.connect();

app.use(express.json());
console.log('안녕');
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

let users = [];// users 테이블 정보를 받아서 안드로이드로 전달할때 해당 배열을 저장했다가 안드로이드로 전달합니다.
let room = [];//room 테이블 정보를 받아서 안드로이드로 전달할때 해당 배열을 저장했다가 안드로이드로 전달합니다.
let roominfo = [];//roominfo 테이블 정보를 받아서 안드로이드로 전달할때 해당 배열을 저장했다가 안드로이드로 전달합니다.

db.query(`SELECT * from room `, function (error2, result2) { //어플이 처음 실행 될때 room 테이블에서 갖고 있던 정보를 어플에 초기화 실키때 사용, room 테이블 모든 정보 가져온다
  if (error2) { throw error2; }
  room = [];
  for (let dbIndex = 0; dbIndex < result2.length; dbIndex++) {// 가져온 정보를 room 배열에 저장
    room.push({
      roomTitle: result2[dbIndex].DbRoomTitle,
      roomCode: result2[dbIndex].DbRoomCode,
      hostName: result2[dbIndex].DbHostName,
    });
  }
});

app.get('/user', async (req, res) => {// getData url user일때 호출되어 안드로이드에 데이터 전달
  db.query(`SELECT * from users`, function (error2, result2) {//users의 모든 데이터 뽑아서
    if (error2) { throw error2; }
    users = [];
    for (let dbIndex = 0; dbIndex < result2.length; dbIndex++) {// users 배열에 저장한다음에
      users.push({
        userName: result2[dbIndex].Db_user,
        roomCode: result2[dbIndex].Db_roomCode,
        isHost: result2[dbIndex].Db_isHost,
      });
    }
  });
  res.status(200).json({
    message: 'get users data success',
    userSize: users.length,//배열 사이즈랑 배열 전달 
    users,
  });
});

app.post('/user', async (req, res) => { //postUser 호출되면 
  const { userName, roomCode, isHost } = req.body; // 안드로이드에서 보낸 값 받아서 
  db.query(`INSERT INTO users (Db_roomCode, Db_user,Db_isHost) VALUES (?,?,?)`, [roomCode, userName, isHost], function (error, result3) { //uers 테이블에 저장
    if (error) {
      throw error;
    }
  });
  db.query(`SELECT * from users`, function (error3, result3) { // 유저 테이블 condole로 확인 
    if (error3) {
      throw error3;
    }

    roomResult = result3; //
    console.log(roomResult);
  });

  let newRoomInfo = {} // 사용 X

  users.push(
    ...users,
    userName,
  );

  room.forEach((roomInfo) => {//사용 X
    if (roomInfo.roomCode == roomCode) {
      newRoomInfo = { ...roomInfo, userName, users }
    }
  })

  room = room.filter((roomInfo) => roomInfo.roomCode !== roomCode)//사용 X

  room.push(newRoomInfo)//사용 X

  res.status(200).json({
    message: 'post users data success',
    result: newRoomInfo.userName,
  });
});

app.post('/delete', async (req, res) => {//postDelete 함수 호출되면 안드로이에서 보낸 값 받아서 
  const { userName, roomCode, isHost } = req.body;
  db.query(`DELETE FROM users WHERE Db_user = ? AND Db_roomCode = ?`, [userName, roomCode], function (error, result3) {//안드로이드로 부터 받은 값의 user와 roomcode와 일치하는 users 테이블의 값을 삭제한다
    if (error) {
      throw error;
    }
  });
  if (isHost == "true") { // 유저가 호스트일 경우는 해당 방도 삭제한다
    db.query(`DELETE FROM room WHERE DbRoomCode = ?`, [roomCode], function (error, result3) {
      if (error) {
        throw error;
      }
    });
  }
  db.query(`SELECT * from users`, function (error3, result3) { // 테이블 cosole 출력으로 확인용
    if (error3) {
      throw error3;
    }
    roomResult = result3;
    console.log(roomResult);

  });
  db.query(`SELECT * from room`, function (error3, result2) {// 테이블 cosole 출력으로 확인용
    if (error3) {
      throw error3;
    }
    room = [];
    for (let dbIndex = 0; dbIndex < result2.length; dbIndex++) {
      room.push({
        roomTitle: result2[dbIndex].DbRoomTitle,
        roomCode: result2[dbIndex].DbRoomCode,
        hostName: result2[dbIndex].DbHostName,
      });
    }
    roomResult = result2;
    console.log(roomResult);


  });
})
app.get('/room', async (req, res) => {//getData url room이 호출되었을때 사용된다
  try {
    db.query(`SELECT * from room`, function (error2, result2) { //room 테이블의 데이터를 다 뽑아서
      if (error2) {
        throw error2;
      }
      room = [];
      for (let dbIndex = 0; dbIndex < result2.length; dbIndex++) {//room 배열에 넣는다
        room.push({
          roomTitle: result2[dbIndex].DbRoomTitle,
          roomCode: result2[dbIndex].DbRoomCode,
          hostName: result2[dbIndex].DbHostName,
        });
      }
    });

    res.status(200).json({
      message: 'get users data success',
      roomSize: room.length,    //room이랑 room 사이즈를 안드로이드에 전달한다
      room,
    });

  } catch (error) {
    console.log('방이 하나도 없음');
  }
});

app.post('/room', async (req, res) => {//postRoom호출시 사용된다 방생성시 호출
  const { roomTitle, roomCode, hostName } = req.body; //안드로이드에서 보내준 데이터를 받고
  const isHost = "true";//호스트 사용자로 가정

  db.query(`INSERT INTO users (Db_roomCode, Db_user,Db_isHost) VALUES (?,?,?)`, [roomCode, hostName, isHost], function (error, result3) {// 받은데이터 users테이블에 입력
    if (error) {
      throw error;
    }
  });

  db.query(`SELECT * from users`, function (error3, result3) {// console롤 출력해서 확인
    if (error3) {
      throw error3;
    }

    roomResult = result3;
    console.log(roomResult);

  });
  db.query(`INSERT INTO room (DbRoomCode, DbRoomTitle, DbHostName) VALUES (?,?,?)`, [roomCode, roomTitle, hostName], function (error, result) {//받은 데이터 room테이블에 입력
    if (error) {
      throw error;
    }
  });

  db.query(`SELECT * from room`, function (error2, result2) { // rom 데이터 room 배열에 입력  확인용  
    if (error2) {
      throw error2;
    }

    roomResult = result2;
    console.log(roomResult);
    room = [];
    for (let dbIndex = 0; dbIndex < result2.length; dbIndex++) {
      room.push({
        roomTitle: result2[dbIndex].DbRoomTitle,
        roomCode: result2[dbIndex].DbRoomCode,
        hostName: result2[dbIndex].DbHostName,
      });
    }
  });
  res.status(200).json({
    message: 'WeTube room create success now',
    result: room,
  });
});

app.delete('/room', async (req, res) => { // app.delete 사용 X
  const { roomCode, hostName } = req.body;
  let targetIndex = 0;
  let index = 0;

  room.forEach((roomInfo) => {
    if (roomInfo.roomCode === roomCode
      && room.hostName === hostName) {
      // host이름을 가진 방의 인덱스 저장
      targetIndex = index;
    }
    index += 1
  });
  room.splice(targetIndex, 1); // 퇴장한 hostName의 인덱스를 이용하여 해당 room1개 삭제
});

app.post('/media', async (req, res) => { // postmedia호출시 사용됨, 재생목록 추가시 사용
  const { roomCode, videoTitle, publisher, thumbnailUrl, videoId } = req.body;//안드로이드에서 보내준 정보 받아서 

  db.query(`INSERT INTO roominfo (Db_roomCode, Db_title, Db_publisher, Db_thumbnailUrl, Db_videoId) VALUES (?,?,?,?,?)`, [roomCode, videoTitle, publisher, thumbnailUrl, videoId], function (error, result) {//roominfo 테이블에 입력
    if (error) {
      throw error;
    }
  });

  db.query(`SELECT * from roominfo`, function (error3, result3) { //확인용 콘솔 출력
    if (error3) {
      throw error3;
    }

    roomResult = result3;
    console.log(roomResult);

  });

  room.forEach((roomInfo) => { //사용X
    if (roomInfo.roomCode == roomCode) {
      newRoomInfo = { ...roomInfo, videoTitle, publisher, thumbnailUrl, videoId }
    }
  })

  room = room.filter((roomInfo) => roomInfo.roomCode !== roomCode) //사용 X
  room.push(newRoomInfo)

  res.status(200).json({
    message: 'post media data success',
    result: newRoomInfo,
  });
});
app.get('/media', async (req, res) => {// getData url이 media일때 사용 
  db.query(`SELECT * from roominfo`, function (error2, result2) { //roominfo 테이블의 데이터 뽑아서
    if (error2) {
      throw error2;
    }
    roominfo = [];
    for (let dbIndex = 0; dbIndex < result2.length; dbIndex++) {//roominfo 배열에 저장
      roominfo.push({
        roomCode: result2[dbIndex].Db_roomCode,
        title: result2[dbIndex].Db_title,
        publisher: result2[dbIndex].Db_publisher,
        thumbnailUrl: result2[dbIndex].Db_thumbnailUrl,
        videoId: result2[dbIndex].Db_videoId
      });
    }
  });
  res.status(200).json({
    message: 'get users data success',
    roominfoSize: roominfo.length, //roominfo 배열과 배열 사이즈 안드로이드한테 전달
    roominfo,
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
      type: "ENTER",
      content: `${user_name}님이 입장하셨습니다.`
    }
    socket.broadcast.to(`${room_code}`).emit('update', JSON.stringify(enterData))
  })

  socket.on('syncData', (data) => {
    const syncData = JSON.parse(data)
    const hostTimestamp = syncData.hostTimestamp;
    const room_code = syncData.roomCode;

    socket.join(`${room_code}`)
    console.log(`hostTimestamp: ${hostTimestamp}`)
    socket.broadcast.to(`${room_code}`).emit('sync', JSON.stringify(syncData))
  })

  socket.on('pauseData', (data) => {
    const pauseData = JSON.parse(data)
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
      type: "EXIT",
      content: `${user_name}님이 퇴장하셨습니다.`
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
