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

module.exports = {
  getTravel
}