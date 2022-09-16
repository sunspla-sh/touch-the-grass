

const express = require('express');

/**
 * Import mongoose and connect
 */
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/touch-grass')
  .then(x => console.log('mongoose connected to ' + x.connections[0].name))
  .catch(err => console.log('mongoose connect error', err));

/**
 * Import middlewares
 */
const hbs = require('hbs');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const { isAuthenticated, isNotAuthenticated } = require('./middlewares/auth.middleware');

const app = express();


app.set('views', __dirname + '/views')
app.set('view engine', hbs);
app.set('trust proxy', 1);

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60000
    }, // ADDED code below !!!
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost/touch-grass'

      // ttl => time to live
      // ttl: 60 * 60 * 24 // 60sec * 60min * 24h => 1 day
    })
  })
);

app.get('/', (req, res, next) => {
  res.render('index.hbs');
});

app.get('/profile', isAuthenticated, (req, res, next) => {
  res.render('profile.hbs', { username: req.session.user.username });
});


const authRoutes = require('./routes/auth.routes');
app.use('/', isNotAuthenticated, authRoutes);


module.exports = app;

