const path = require('path');
const express = require('express');

/**
 * Import mongoose and connect
 */
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/touch-grass')
  .then(x => console.log('mongoose connected to ' + x.connections[0].name))
  .catch(err => console.log('mongoose connect error', err));

/**
 *  Import NPSService
 */

const NPSService = require('./services/nps.service');
const myNPSService = new NPSService();

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

app.use(express.static(path.resolve(__dirname, './public')))

app.get('/', (req, res, next) => {
  res.render('index.hbs');
});

app.get('/parks', async (req, res, next) => {

  const { skip = 0, limit = 50 } = req.query;
  
  try {

    let myParkResponse = await myNPSService.getParks(skip, limit);

    let parksArray = myParkResponse.data.data.map(element => ({
      fullName: element.fullName,
      description: element.description,
      latitude: element.latitude,
      longitude: element.longitude,
      image: {
        url: element.images[0].url,
        altText: element.images[0].altText
      }
    }));

    res.render('parks.hbs', { parksArray })

  } catch (err) {
    console.log('error while retrieving park data ', err);
    res.json({ error: err })
  }
});

app.get('/profile', isAuthenticated, (req, res, next) => {
  res.render('profile.hbs', { username: req.session.user.username });
});


const authRoutes = require('./routes/auth.routes');
app.use('/auth', isNotAuthenticated, authRoutes);


module.exports = app;

