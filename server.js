/**
 * Import dotenv
 */
 require('dotenv/config');

 const app = require('./app');


 app.listen(process.env.PORT || 3000, () => {
  console.log('yo the server is listening');
 });