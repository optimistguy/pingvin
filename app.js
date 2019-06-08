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
 
let socketList = {};
let playerList = {};

let Player = function(id){
    let self = {
        x:250,
        y:250,
        id:id,
        number: "" + Math.floor(10 * Math.random()),        
        pressingRightArrow: false,
        pressingLeftArrow: false,
        pressingUpArrow: false,
        pressingDownArrow: false,
        maxSpd: 10,
    }
    self.updatePosition = function() {
        if(self.pressingRightArrow)
            self.x += self.maxSpd;
        if(self.pressingLeftArrow)
            self.x -= self.maxSpd;
        if(self.pressingUpArrow)
            self.y -= self.maxSpd;
        if(self.pressingDownArrow)
            self.y += self.maxSpd;
    }
    return self;
}
const io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    socketList[socket.id] = socket;
    let player = Player(socket.id);
    playerList[socket.id] = player;
    socket.on('disconnect',function(){
        delete socketList[socket.id];
        delete playerList[socket.id];
    });

    socket.on('keyPress',function(data){
        if(data.inputId === 'leftArrow')
            player.pressingLeftArrow = data.state;
        if(data.inputId === 'rightArrow')
            player.pressingRightArrow = data.state;
        if(data.inputId === 'upArrow')
            player.pressingUpArrow = data.state;
        if(data.inputId === 'downArrow')
            player.pressingDownArrow = data.state;
    });
//-----------------------------------------------   
});
 
setInterval(function(){
    let pack = [];
    for(let i in playerList){
        let player = playerList[i];
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number
        });    
    }
    for(let i in socketList){
        let socket = socketList[i];
        socket.emit('newPositions', pack);
    }
   
   
   
   
},1000/25);
