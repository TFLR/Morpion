const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

router.get('/login', (req, res, next) => {
    const messages = req.flash();
    res.render('login', { messages });
})

router.post('/login', passport.authenticate('local', 
{ failureRedirect: '/auth/login', failureFlash: 'Wrong username or password'}),
(req, res, next) => {
    res.redirect('/');
});


router.get('/register', (req, res, next) => {
  const messages = req.flash();
  res.render('register', { messages });
});
  // --------------------------------------------------
  
  
  // Handle register request
  // --------------------------------------------------
  router.post('/register', (req, res, next) => {
    console.log("hello");
    const registrationParams = req.body;
    console.log(req.body);
    console.log('pseudo: ', JSON.stringify(registrationParams.nameof));
    console.log('email: ', JSON.stringify(registrationParams.emailof));
    console.log('password: ', JSON.stringify(registrationParams.passwordof));
    const users = req.app.locals.users;
 
    const payload = {
      username: JSON.stringify(registrationParams.nameof),
      email: JSON.stringify(registrationParams.emailof),
      password: JSON.stringify(registrationParams.passwordof),
      victory: 0,
      loses: 0,
      draws: 0,
    };

   
  
    users.insertOne(payload, (err) => {
      if (err) {
        req.flash('error', 'User account already exists.');
      } else {
        req.flash('success', 'User account registered successfully.');
      }
  
      res.redirect('/auth/register');
    })
  });

  router.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
  });
  
  module.exports = router;