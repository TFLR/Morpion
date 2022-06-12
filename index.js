var express = require('express')
var app = express()
app.use(express.static('public'))
var path = require('path');
const port = process.env.PORT || 5000
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const authRouter = require('./routes/auth');
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const hbs = require('hbs');
const mongoDB = "mongodb://localhost:27017/SuiviProjetDev"

app.use(express.json())
app.use(express.static(__dirname + '/public'))
app.use(session({
  secret: 'secret session',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs')

hbs.registerPartials(path.join(__dirname, 'views/_partials'));

mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  

http.listen(port, () => {
  console.log('Connextion listen on 5000')
})

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  if(err) {
    throw err;

    
  }
  console.log('Database Connected...');
  const db = client.db('SuiviProjetDev');
  const users = db.collection('users');
  app.locals.users = users;
})

passport.use(new Strategy(
  (username, password, done) => {
    app.locals.users.findOne({ username }, (err, user) => {
      if(err) {
        return done(err);
      }

      if(!user) {
        return done(null, false);
      }

      if( bcrypt.compare(password, user.password)) {
        return done(null, false);
      }

      return done(null, user);
    })
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);

});

passport.deserializeUser((id, done) => {
done(null, { id });
});


app.get('/', function (req, res) {
 
    res.render('index')
 
});

app.get('/game', function (req, res) {
  res.sendFile(__dirname + '/public/tic-tac-toe.html');
})
app.get('/bot', function (req, res) {
  res.sendFile(__dirname + '/public/bot.html');
})

app.use('/auth', authRouter);

app.use(bodyParser.json());


var players = {},
  unmatched;

io.sockets.on("connection", function (socket) {
  console.log("socket connected")
  socket.emit('connect', {
    msg: "hello"
  })
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