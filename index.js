var express = require('express')
var app = express()
app.use(express.static('public'))
const port = process.env.PORT || 5000
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const User = require('./model/user')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'azeaazeazjbhvegazjhekazaega#AZHA@ANEAZqssqd';
const mongoDB = "mongodb://localhost:27017/SuiviProjetDev"


mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Database Connected...'))
    .catch(err => console.log('Error connecting database',err));

http.listen(port,()=> { console.log('Connextion listen on 5000')})

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/register', function(req, res){
  res.sendFile(__dirname + '/public/register.html');
})

app.get('/game', function(req, res){
  res.sendFile(__dirname + '/public/tic-tac-toe.html');
})

app.get('/login', function(req, res){
  res.sendFile(__dirname + '/public/login.html');
})

app.use(bodyParser.json())

app.post('/api/login', async(req, res) => {
  
  const {email, password } = req.body

  const user = await User.findOne({email}).lean()

  if(!user) {
    return res.json({status: error, error: 'Invalid email or password'})
  }
  if(await bcrypt.compare(password, user.password))
      {
      const token = jwt.sign({ 
        id: user._id, 
        username: user.username
      }, 
      JWT_SECRET
    )
    return res.json({status: 'OK', data: token})
  }

})
app.post('/api/register', async(req, res) => {

  console.log(req.body)

  const { username, email, password: plainTextPassword } = req.body

  if(!username || typeof username !== 'string') {
    return res.json({status: error, error: 'Invalid username'})
  }

  if(!email || typeof email !== 'string') {
    return res.json({status: error, error: 'Invalid email'})
  }

  if(!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.json({status: error, error: 'Invalid password'})
  }

  if(plainTextPassword.length < 6) {
    return res.json({status: error, error: 'Password should be at least 6 characters'})
  }

  const password = await bcrypt.hash(plainTextPassword, 10)

  try {
    const response = await User.create({
      username,
      email,
      password
    })
    console.log('User created successfully:' , response)
  } catch(error) {
    if(error.code === 11000) {
      return res.json({ status: 'error', error: 'Username or Email already in use ' })
    }
    throw error
  
  }
  res.json({ status: 'OK' })
})
 
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
