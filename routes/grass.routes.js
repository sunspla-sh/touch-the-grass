const express = require('express');
const router = express.Router();

/**
 *  Import NPSService
 */

const NPSService = require('../services/nps.service');
const myNPSService = new NPSService();

/**
 * Import isAuthenticated middleware
 */

const { isAuthenticated, isNotAuthenticated } = require('../middlewares/auth.middleware');

const TOTAL_PARKS = 467;

const PARKS_PER_PAGE = 24;

const TOTAL_PAGES = Math.floor((TOTAL_PARKS / PARKS_PER_PAGE) + 1);

router.get('/', async (req, res, next) => {

  const limit = 6;

  //Get 6 random parks from the total number of parks in the API - currently 467 available
  const skip = Math.floor(Math.random() * (TOTAL_PARKS - limit + 1));
  

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
      },
      address: {
        line1: element.addresses[0].line1,
        line2: element.addresses[0].line2,
        line3: element.addresses[0].line3,
        city: element.addresses[0].city,
        stateCode: element.addresses[0].stateCode,
        postalCode: element.addresses[0].postalCode,
      },
      parkCode: element.parkCode
    }));


    res.render('index.hbs', { parksArray });

  } catch (err) {
    console.log('error while retrieving park data ', err);
    res.json({ error: err })
  }

  
});

router.get('/national-grass', async (req, res, next) => {

  const { skip = 0, limit = PARKS_PER_PAGE } = req.query;
  
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
      },
      address: {
        line1: element.addresses[0].line1,
        line2: element.addresses[0].line2,
        line3: element.addresses[0].line3,
        city: element.addresses[0].city,
        stateCode: element.addresses[0].stateCode,
        postalCode: element.addresses[0].postalCode,
      },
      parkCode: element.parkCode
    }));

    const pageArray = [];

    for(let i = 0; i < TOTAL_PAGES; i++){
      pageArray.push({
        pageNumber: i + 1,
        skip: i * PARKS_PER_PAGE,
        limit: PARKS_PER_PAGE,
        active: +skip === i * PARKS_PER_PAGE
      });
    }

    res.render('national-grass.hbs', { parksArray, pageArray });

  } catch (err) {
    console.log('error while retrieving park data ', err);
    res.json({ error: err })
  }

});

router.get('/national-grass/:parkCode', async (req, res, next) => {

  const { parkCode } = req.params;

  const myParkResponse = await myNPSService.getParkByCode(parkCode);

  const myParkResponseData = myParkResponse.data.data[0];

  const myGrassData = {
    fullName: myParkResponseData.fullName,
    description: myParkResponseData.description,
    latitude: myParkResponseData.latitude,
    longitude: myParkResponseData.longitude,
    // image: {
    //   url: element.images[0].url,
    //   altText: element.images[0].altText
    // },
    address: {
      line1: myParkResponseData.addresses[0].line1,
      line2: myParkResponseData.addresses[0].line2,
      line3: myParkResponseData.addresses[0].line3,
      city: myParkResponseData.addresses[0].city,
      stateCode: myParkResponseData.addresses[0].stateCode,
      postalCode: myParkResponseData.addresses[0].postalCode,
    },
    parkCode: myParkResponseData.parkCode
  }
    
  res.render('single-grass.hbs', myGrassData);
});

router.get('/profile', isAuthenticated, (req, res, next) => {
  res.render('profile.hbs', { username: req.session.user.username });
});


module.exports = router;