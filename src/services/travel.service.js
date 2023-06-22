const { Sequelize } = require('sequelize');

const config = require('../config/environment')
const raw = new Sequelize(config.DB.database, config.DB.username, config.DB.password, {
  host: config.DB.host,
  dialect: config.DB.dialect
})
const getTravel = async (deviceId) => {
  const travels = 'call get_positions_vehicle()'
  const result = await raw.query(travels)
  return result
}

const getKmsTravel = async (origin, destination) => {
  const result = axios.get('https://maps.googleapis.com/maps/api/directions/json?origin=45.509166,-73.497897&destination=50.5027,-73.503455&waypoints=optimize:true|45.509196,-73.495494|45.511166,-73.493584|45.515887,-73.500751|45.516835,-73.507189|45.51497,-73.514892|45.507828,-73.515879|45.504038,-73.516008|45.508971,-73.505665|&sensor=false&API_KEY', {
    params: {
      key: 'AIzaSyCBHoWxKbqotxDbRLE6hzonzwXRV-QdpFM',
    }
  })
    .then(response => {
      console.log(response.data);
      return response
    })
    .catch(error => {
      console.error(error);
      return error
    });
  
}

module.exports = {
  getTravel
}