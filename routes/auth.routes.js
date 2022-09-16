const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');


const User = require('../models/User.model');


router.get('/signup', (req, res, next) => {
  res.render('signup.hbs')
})

router.post('/signup', (req, res, next) => {
  const { username, password } = req.body;

  if(!username || !password ){
    res.render('signup.hbs', { errorMessage: 'please enter a username and password' });
    return;
  }

  User.findOne({ username })
    .then(foundUser => {
      if(foundUser){
        res.render('signup.hbs', { errorMessage: 'username already exists' })
        return;
      }

      return User.create({
        username,
        password: bcryptjs.hashSync(password)
      });
    })
    .then(createdUser => {
      console.log('user successfully created', createdUser);

      const myUser = { username: createdUser.username, _id: createdUser._id };

      req.session.user = myUser;

      res.redirect('/profile');
      return;

    })
    .catch(err => {
      res.render('signup.hbs', { errorMessage: 'Sorry an error occurred while attempting to create the user: ' + JSON.stringify(err)})
    })
})

router.get('/login', (req, res, next) => {
  res.render('login.hbs')
})

router.post('/login', (req, res, next) => {

  const { username, password } = req.body;

  if(!username || !password ){
    res.render('login.hbs', { errorMessage: 'please enter a username and password' });
    return;
  }

  User.findOne({ username })
    .then(foundUser => {

      if(!foundUser){
        res.render('login.hbs', { errorMessage: 'incorrect username or password' })
        return;
      }

      const isValidPassword = bcryptjs.compareSync(password, foundUser.password);

      if(!isValidPassword){
        res.render('login.hbs', { errorMessage: 'incorrect username or password' })
        return;
      }

      const myUser = { username: foundUser.username, _id: foundUser._id };

      req.session.user = myUser;

      res.redirect('/profile'); 
      return;

    })
    .catch(err => {
      res.render('login.hbs', { errorMessage: 'Sorry an error occurred while attempting to log in: ' + JSON.stringify(err)})
    })

})


module.exports = router;