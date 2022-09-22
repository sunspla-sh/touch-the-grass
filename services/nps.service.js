const axios = require('axios')

const NPS_API_KEY = process.env.NPS_API_KEY;

class NPSService {

  constructor(){
    this.axios = axios.create({
      baseURL: 'https://developer.nps.gov/api/v1',
      headers: {
        'X-Api-Key': NPS_API_KEY
      }
    });
  }

  getParks(skip, limit){
    return this.axios.get('/parks', {
      params: {
        start: skip,
        limit
      }
    });
  }

  getParkByCode(parkCode){
    return this.axios.get(`/parks`, {
      params: {
        parkCode
      }
    })
  }

}

module.exports = NPSService;