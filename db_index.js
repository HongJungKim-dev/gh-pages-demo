const express = require('express');
const http = require('http');
const mysql = require('mysql');
const app = express();

var db = mysql.createConnection({ //mysql 연결 하는 부분
    host:'localhost', 
    user:'root',
    password:'', // mysql 설치시 설정한 비번
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

let users = [];
let room = [];
//let dbIndex=0;
let i=0;

db.query(`SELECT * from room `, function(error2, result2){
  if(error2){throw error2;}
  room=[];
  for(let dbIndex =0; dbIndex<result2.length; dbIndex++){
    room.push({
            roomTitle: result2[dbIndex].DbRoomTitle,
            roomCode: result2[dbIndex].DbRoomCode,
            hostName: result2[dbIndex].DbHostName,
    });
  }
  
});  
const arr = [];



app.get('/user', async (req, res) => {

  db.query(`SELECT * from users`, function(error2, result2){
    if(error2){throw error2;}
    users =[];
    for(let dbIndex =0; dbIndex<result2.length; dbIndex++){
      users.push({
              userName: result2[dbIndex].Db_user,
              roomCode: result2[dbIndex].Db_roomCode,
              isHost: result2[dbIndex].Db_isHost,
      });
    }
    
  }); 
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

app.post('/user', async (req, res) => {
  const { userName, roomCode, isHost } = req.body;
  db.query(`INSERT INTO users (Db_roomCode, Db_user,Db_isHost) VALUES (?,?,?)`, [roomCode, userName, isHost], function(error, result3){
    if(error){ throw error; }
   
    });
    db.query(`SELECT * from users`, function(error3, result3){
      if(error3){throw error3;}

    roomResult = result3;
      console.log(roomResult);
      
    });   

  let newRoomInfo = {}
  
  users.push(
    ...users,
    userName,
  );

  room.forEach((roomInfo) => {
    if( roomInfo.roomCode == roomCode){
        newRoomInfo = { ...roomInfo, userName, users }
    }
  })

  room = room.filter((roomInfo) => roomInfo.roomCode !== roomCode)
  
  room.push(newRoomInfo)

  res.status(200).json({
    message: 'post users data success',
    result: newRoomInfo.userName,
  });
});

app.post('/delete', async(req, res) =>{
  const { userName, roomCode, isHost } = req.body;
  db.query(`DELETE FROM users WHERE Db_user = ? AND Db_roomCode = ?`,[userName, roomCode], function(error, result3){
    if(error){ throw error; }
   
    });
    if(isHost=="true"){
        db.query(`DELETE FROM room WHERE DbRoomCode = ?`,[roomCode], function(error, result3){
            if(error){ throw error; }
           
            });
    }
    db.query(`SELECT * from users`, function(error3, result3){
        if(error3){throw error3;}
  
      roomResult = result3;
        console.log(roomResult);
        
      });   
      db.query(`SELECT * from room`, function(error3, result2){
        if(error3){throw error3;}
        room=[];
  for(let dbIndex =0; dbIndex<result2.length; dbIndex++){
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
app.get('/room', async (req, res) => {
    try{

      db.query(`SELECT * from room`, function(error2, result2){
        if(error2){throw error2;}
        room=[];
        for(let dbIndex =0; dbIndex<result2.length; dbIndex++){
          room.push({
                  roomTitle: result2[dbIndex].DbRoomTitle,
                  roomCode: result2[dbIndex].DbRoomCode,
                  hostName: result2[dbIndex].DbHostName,
          });
        }
	/*if(dbIndex < result2.length){
        console.log(result.length);
        console.log(dbIndex);
	  for(; dbIndex<result2.length; dbIndex++){
              room.push({
                roomTitle: result2[dbIndex].DbRoomTitle,
                roomCode: result2[dbIndex].DbRoomCode,
                hostName: result2[dbIndex].DbHostName,
  	      });
      	  }
            
	}*/
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
  const isHost = "true";
  const roomInfo = { roomTitle, roomCode, hostName};

  db.query(`INSERT INTO users (Db_roomCode, Db_user,Db_isHost) VALUES (?,?,?)`, [roomCode, hostName, isHost], function(error, result3){
    if(error){ throw error; }
   
    });

    db.query(`SELECT * from users`, function(error3, result3){
      if(error3){throw error3;}

    roomResult = result3;
      console.log(roomResult);
      
    });   
  db.query(`INSERT INTO room (DbRoomCode, DbRoomTitle, DbHostName) VALUES (?,?,?)`, [roomCode, roomTitle, hostName], function(error, result){
    if(error){ throw error; }
   
    });

    db.query(`SELECT * from room`, function(error2, result2){
      if(error2){throw error2;}
    roomResult = result2;
      console.log(roomResult);
      room=[];
  for(let dbIndex =0; dbIndex<result2.length; dbIndex++){
    room.push({
            roomTitle: result2[dbIndex].DbRoomTitle,
            roomCode: result2[dbIndex].DbRoomCode,
            hostName: result2[dbIndex].DbHostName,
    });
  }
      
    });   

  //room.push(roomInfo);
 // dbIndex++;
  res.status(200).json({
    message: 'WeTube room create success now',
    result: room,
  });
});

app.delete('/room', async (req, res) => {
  const { roomCode, hostName } = req.body;
  let targetIndex = 0;
  let index = 0;

  room.forEach((roomInfo) => {
    if( roomInfo.roomCode === roomCode && room.hostName === hostName){
        // host이름을 가진 방의 인덱스 저장
        targetIndex = index;
    }
    index += 1
  });
  room.splice(targetIndex, 1); // 퇴장한 hostName의 인덱스를 이용하여 해당 room1개 삭제
});

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
    result: newRoomInfo,
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
