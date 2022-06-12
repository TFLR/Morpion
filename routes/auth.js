const express = require('express');
const router = express.Router();
const authUtils = require('../utils/auth');
const passport = require('passport');

router.get('/login', (req, res, next) => {
  
    const messages = req.flash();
    
    res.render('login', { messages });
})

router.post('/login', passport.authenticate('local', 
{ failureRedirect: '/auth/login', 
failureFlash: 'Wrong username or password'}),
(req, res, next) => {
  const registrationParams = req.body;
  console.log(registrationParams.username);
  console.log(registrationParams.password);
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
   
    const registrationParams = req.body;
    
    const users = req.app.locals.users;
 
    const payload = {
      username: registrationParams.nameof,
      email: registrationParams.emailof,
      password: authUtils.hashPassword(registrationParams.passwordof),
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