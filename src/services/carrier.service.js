const { carrier, carrdevi, device } = require('../models');
const { Op } = require("sequelize");

const getCarriers = async (entityId, pagination={}) => {
  const carriers = await carrier.findAndCountAll({
    where: {
      enticarr: entityId,
    },
    order:[
      ['carrnuid', 'DESC']
    ],
    include: {
      model: carrdevi,
      as: 'carrdevi',
      attributes:['cadenuid'],
      include:{
        model: device,
        as: 'device',
      }
    },
    raw : true ,
    nest : true
  })
  return carriers
}

const getCarrier = async (query) => {
  const carrierResult = await carrier.findOne({
    where: {
      ...query
    },
    include: {
      model: carrdevi,
      as: 'carrdevi',
      attributes:['cadenuid'],
      include:{
        model: device,
        as: 'device',
        attributes:['deviimei']
      }
    },
    raw : true ,
    nest : true
  })
  return carrierResult
}

const createCarrier = async (payload) => {
  const carrierResult = await carrier.create({...payload})
  return carrierResult
}

const updateCarrier = async (carrierId, payload) => {
  const carrierResult = await carrier.update(
    {...payload},
    {
      where: {
        carrnuid: carrierId
      }
    },
  )
  return await carrier.findOne({ where: { carrnuid: carrierId }})
}

const deleteCarrier = async (deviceId) => {
  const carrierResult = await carrier.destroy({
      where: {
        carrnuid: deviceId
      }
  })
  return carrierResult
}

const deleteCarrierDevice = async (carrierId) => {
  const response = await carrdevi.destroy({
      where: {
        carrcade: carrierId
      }
  })
  return response
}

const getCarriDevi = async (query) => {
  const carrierResult = await carrdevi.findOne({
    where: {
      ...query
    }
  })
  console.log({carrierResult})
  return carrierResult
}

const createCarriDevi = async (payload) => {
  return await carrdevi.create({...payload})
}

const updateCarriDevi = async (carrierId, payload) => {
  return await carrdevi.update(
    {...payload},
    {
      where: {
        cadenuid: carrierId
      }
    }
  )
}

module.exports = {
  getCarriers,
  getCarrier,
  createCarrier,
  updateCarrier,
  deleteCarrier,
  deleteCarrierDevice,
  createCarriDevi,
  updateCarriDevi,
  getCarriDevi
}