const express = require('express');
const router = new express.Router();
const authUtils = require('../utils/auth');
const passport = require('passport');
const flash = require('connect-flash');

// --------------------------------------------------
router.get('/login', (req, res, next) => {
  if (req.isAuthenticated()) { 
    res.redirect('/');
  }
  const messages = req.flash();
  res.render('login', { messages });
});
// --------------------------------------------------
// Handle login request
// --------------------------------------------------
router.post('/login', passport.authenticate('local', 
  { failureRedirect: '/auth/login', 
    failureFlash: 'Wrong username or password'}), (req, res, next) => {
  res.redirect('/');
});
// --------------------------------------------------


router.get('/register', (req, res, next) => {
  if (req.isAuthenticated()) { 
    res.redirect('/');
  }
  const messages = req.flash();
  
  res.render('register', { messages });
});
  // --------------------------------------------------
  
  
  // Handle register request
  // --------------------------------------------------
  router.post('/register', (req, res, next) => {
    
    const registrationParams = req.body;
    const users = req.app.locals.users;
    console.log('take2');
 
    const payload = {
      username: registrationParams.username,
      email: registrationParams.email,
      password: authUtils.hashPassword(registrationParams.password),
      victory: 0,
      loses: 0,
      draws: 0,
    };
    console.log('take3');

   
  
    users.insertOne(payload, (err) => {
      if (err) {
        req.flash('error', 'User account already exists.');
      } else {
        console.log('take4');
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