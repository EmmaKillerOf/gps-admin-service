const { Op, Sequelize } = require('sequelize');
const axios = require('axios');
const { kmdevi } = require('../models');

const config = require('../config/environment')
const raw = new Sequelize(config.DB.database, config.DB.username, config.DB.password, {
  host: config.DB.host,
  dialect: config.DB.dialect
})
const getTravel = async (deviceId, dateSelected) => {
  const travels = `call get_positions_vehicle(${deviceId}, '${dateSelected}')`
  const result = await raw.query(travels)
  return result
}

const getKmsTravel = async (latOrigin, lonOrigin, latDest, lonDest, waypoints) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${latOrigin},${lonOrigin}`,
        destination: `${latDest},${lonDest}`,
        waypoints: `optimize:true|${waypoints}|`,
        sensor: false,
        key: 'AIzaSyCBHoWxKbqotxDbRLE6hzonzwXRV-QdpFM',
      }
    });
    /* console.log(response); */
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
}

const getKmsCalculates = async (deviceId, dateSelected) => {
  const kmsTemp = await kmdevi.findAll({
    where: {
      kmdevice: deviceId,
      kmdiacapt: dateSelected
    },
    raw : false,
    nest : true
  })
  return kmsTemp
}

const createKm = async (payload) => {
  return await kmdevi.create({...payload})
}

module.exports = {
  getTravel,
  getKmsTravel,
  getKmsCalculates,
  createKm
}