const { Op, Sequelize } = require('sequelize');
const axios = require('axios');
const { kmdevi, device, carrdevi, carrier, devialar } = require('../models');

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

const getTravelTemp = async (deviceId, dateInit, dateFinal) => {
  const travels = `call get_positions_vehicle_temp(${deviceId}, '${dateInit}', '${dateFinal}')`
  const result = await raw.query(travels)
  return result
}

const getTravelTimes = async (deviceId, dateInit, dateFinal) => {
  const travels = await devialar.findAll({
    where: {
      devideal: {
        [Op.in]: [18,19, 22, 23]
      },
      devideal: deviceId,
      delotinude: {
        [Op.and]: {
          [Op.gte]: dateInit,
          [Op.lte]: dateFinal 
        }
      }
    },
    raw: true,
    nest: true
  });
  return travels
}

const getTravelMonthly = async (deviceIds, month, year) => {
  const results = await device.findAll({
    attributes: ['devinuid', 'deviimei'],
    where: {
      devinuid: deviceIds
    },
    include: [
      {
        model: carrdevi,
        as: 'carrdevi',
        attributes: ['cadenuid'],
        include: {
          model: carrier,
          as: 'carrier',
        }
      },
      {
        model: kmdevi,
        as: 'kmdevi',
        attributes: ['kmdevice', [Sequelize.fn('SUM', Sequelize.col('kmcapt')), 'total_kmcapt']],
        where: {
          [Op.and]: [
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('kmdiacapt')), parseInt(month)),
            Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('kmdiacapt')), parseInt(year)),
            //{ kmdevice: deviceIds }
          ]
        },
        group: ['kmdevice'],
        separate: true
      }
    ],
    raw: false,
    nest: true
  });
  console.log(results);
  return results;
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
    raw: false,
    nest: true
  })
  return kmsTemp
}

const createKm = async (payload) => {
  return await kmdevi.create({ ...payload })
}

module.exports = {
  getTravel,
  getKmsTravel,
  getKmsCalculates,
  getTravelTemp,
  createKm,
  getTravelMonthly,
  getTravelTimes
}