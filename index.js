var express = require('express')
var app = express()
app.use(express.static('public'))
const port = process.env.PORT || 5000
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const mongoose = require('mongoose');

const mongoDB = "mongodb://localhost:27017/SuiviProjetDev"

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database Connected...'))
    .catch(err => console.log('Error connecting database',err));

http.listen(port,()=> { console.log('Connextion listen on 5000')})

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


var players = {},
  unmatched;


io.sockets.on("connection", function (socket) {
    console.log("socket connected")
  socket.emit('connect',{msg:"hello"})
  joinGame(socket);

  if (getOpponent(socket)) {
    socket.emit("game.begin", {
      symbol: players[socket.id].symbol,
    });
    getOpponent(socket).emit("game.begin", {
      symbol: players[getOpponent(socket).id].symbol,
    });
  }

  socket.on("make.move", function (data) {
    if (!getOpponent(socket)) {
      return;
    }
    socket.emit("move.made", data);
    getOpponent(socket).emit("move.made", data);
  });

  socket.on("disconnect", function () {
    if (getOpponent(socket)) {
      getOpponent(socket).emit("opponent.left");
    }
  });
});

function joinGame(socket) {
  players[socket.id] = {
    opponent: unmatched,

    symbol: "X",
    // The socket that is associated with this player
    socket: socket,
  };
  if (unmatched) {
    players[socket.id].symbol = "O";
    players[unmatched].opponent = socket.id;
    unmatched = null;
  } else {
    unmatched = socket.id;
  }
}

function getOpponent(socket) {
  if (!players[socket.id].opponent) {
    return;
  }
  return players[players[socket.id].opponent].socket;
}
