var express = require('express');
var router = express.Router();

// Create custom homepage
// --------------------------------------------------
router.get('/', function(req, res, next) {
  const users = req.app.locals.users;

  res.render('index', { users } );
  
});
// --------------------------------------------------
router.get('/multiplayer', (req, res, next) => {
  // if (!req.isAuthenticated()) { 
  //   res.redirect('/auth/login');
  // }

  const users = req.app.locals.users;

 

res.render('multiplayer', { users });
  
});

router.get('/bot', (req, res, next) => {
    // if (!req.isAuthenticated()) { 
    //   res.redirect('/auth/login');
    // }

    const users = req.app.locals.users;

    res.render('bot', { users });
    
});
module.exports = router;
