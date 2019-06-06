const express = require('express');
const app = express();
const serv = require('http').Server(app);
 //-----------------------------------------------
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(2000);
console.log("Server started.");
 
let SOCKET_LIST = {};
 
const io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    socket.x = 0;
    socket.y = 0;
    socket.number = "" + Math.floor(10 * Math.random());
    SOCKET_LIST[socket.id] = socket;
 
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
    });
    //-----------------------------------------------
});
 
setInterval(function(){
    let pack = [];
    for(let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i];
        socket.x++;
        socket.y++;
        pack.push({
            x:socket.x,
            y:socket.y,
            number:socket.number
        });    
    }
    for(let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
   
   
   
   
},1000/25);
