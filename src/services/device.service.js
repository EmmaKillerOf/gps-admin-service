const { Op, Sequelize } = require("sequelize");
const { device, carrdevi, entityDevice, carrier, clasdevi, classvalue, deviloca } = require('../models');
const { getClassifier } = require("./classifier.service");

const getDevices = async (entityId, available, entityUserId = null) => {
  const query = entityUserId ? { '$entityDevice.userende$': entityUserId }: {}
  const availableQuery = available ? { '$carrdevi.devicade$': { [Op.eq]: null } } : {}
  const includes = entityUserId ? [
    {
      model: entityDevice,
      as: 'entityDevice',
      attributes: []
    }
  ] : []
  const devices = await device.findAndCountAll({
    where: {
      entidevi: entityId,
      ...query,
      ...availableQuery
    },
    order:[
      ['devinuid', 'DESC'],
    ],
    include:[
      {
        model: carrdevi,
        as: 'carrdevi',
        attributes:['cadenuid'],
        include:{
          model: carrier,
          as: 'carrier',
        }
      }, 
      {
        model: clasdevi,
        as: 'clasdevi',
        include: {
          model:classvalue,
          as:'classvalue'
        }
      },
      {
        model: deviloca,
        as: 'deviloca',
        separate : true, // <--- Run separate query
        order: [['delotinu', 'DESC'],['delotime', 'DESC']],
        limit: 1
      },
      ...includes,
    ],
    raw : false ,
    nest : true
  })
  return devices
}

const myDevices = async (entityId, entityUserId = null) => {
  const query = entityUserId ? { '$entityDevice.userende$': entityUserId }: {}
  const includes = entityUserId ? [
    {
      model: entityDevice,
      as: 'entityDevice',
      attributes: []
    }
  ] : []
  const devices = await device.findAll({
    where: {
      entidevi: entityId,
      ...query,
    },
    order:[
      'devinuid', 'DESC',
    ],
    attributes: ['devinuid'],
    raw : false ,
    nest : true
  })
  return devices
}

const getDeviceLocation = async ({devices, plate, startDate, endDate}) => {

  try {
    const plateQuery = plate ? {[`$carrdevi.carrier.carrlice$`]: plate } : {}
    const dateQuery = {
      delotinu: { 
        [Op.and]:{
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      } 
    }

    const deviceResult = await device.findAll({
      where: {
        devinuid: {
          [Op.in]: devices
        },
        ...plateQuery
      },
      include: [
        {
          model: deviloca, 
          as: 'deviloca',
          separate : true,
          where:{ 
            ...dateQuery,
          },
          order:[['delotime', 'DESC']],
        },
        {
          model: carrdevi,
          as: 'carrdevi',
          attributes:['cadenuid'],
          include:{
            model: carrier,
            as: 'carrier',
          }
        }, 
      ],
      raw : false ,
      nest : true
    })
    
    return deviceResult
  } catch (error) {
    console.log(error)
  }

}

const getDeviceAlerts = async ({devices, plate, startDate, endDate}) => {
  console.log(devices)
  try {
    const dateQuery = {
      delotinu: { 
        [Op.and]:{
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      } 
    }

    const deviceResult = await device.findAll({
      where: {
        devinuid: {
          [Op.in]: devices
        },
        // ...dateQuery
      },
      //order:[['delotime', 'DESC']],
      include: [
        {
          model: devialar, 
          as: 'devialar',
          separate : true,
          where:{ 
            ...dateQuery
          }
        },
        {
          model: carrdevi,
          as: 'carrdevi',
          attributes:['cadenuid'],
          include:{
            model: carrier,
            as: 'carrier',
          }
        }, 
      ],
      raw : false ,
      nest : true
    })
    
    return deviceResult
  } catch (error) {
    console.log(error)
  }

}

const getDevice = async (query) => {
  const deviceResult = await device.findOne({
    where: {
      ...query
    }
  })
  let classifiers
  if(query.devinuid){
    const classifiersResult = await getCassifierDevice(query.devinuid);  
    classifiers = classifiersResult ? {classifiers: classifiersResult} : {}
  }
  return deviceResult ? {...deviceResult, ...classifiers} : deviceResult
}

const getDeviceById = async (entityId,deviceId) => {
  const devices = await device.findOne({
    where: {
      entidevi: entityId,
      devinuid: deviceId
    }
  })
  return devices
}

const getDeviceByCarrier = async (entityId, carrierId) => {
  const devices = await device.findOne({
    where: {
      entidevi: entityId,
      '$carrdevi.carrcade$': carrierId
    },
    include:{
      model: carrdevi, 
      as: 'carrdevi',
    },
    raw : false ,
    nest : true
  })
  return devices
}

const createDevice = async (payload) => {
  const deviceResult = await device.create({...payload})
  return deviceResult
}

const updateDevice = async (deviceId, payload) => {
  await device.update(
    {...payload},
    {
      where: {
        devinuid: deviceId
      },
      raw : false,
    }
  )
  const deviceUpdated = await device.findOne({ where:{ devinuid: deviceId }})
  
  return deviceUpdated
}

const getCassifierDevice = async (deviceId) => {
  const classifiers = await clasdevi.findAll({
    where: {
      deviclde: deviceId,
    },
    include:{
      model: classvalue,
      as: 'classvalue',
      attributes:['clvanuid','clvadesc', 'clvastat'],
    },
    raw : false ,
    nest : true
  })
  return classifiers
}

const deleteDevice = async (deviceId) => {
  const response = await device.destroy({
      where: {
        devinuid: deviceId
      }
  })
  return response
}

const deleteUserDevice = async (deviceId) => {
  const response = await entityDevice.destroy({
      where: {
        deviende: deviceId
      }
  })
  return response
}

const deleteCarrierDevice = async (deviceId) => {
  const response = await carrdevi.destroy({
      where: {
        devicade: deviceId
      }
  })
  return response
}

const createClasdevi = async (payload) => {
  console.log({payload})
  const deviceResult = await clasdevi.bulkCreate(payload)
  return deviceResult
}


const deleteClasdevi = async (deviceId) => {
  const response = await clasdevi.destroy({
      where: {
        deviclde: deviceId
      }
  })
  return response
}

module.exports = {
  getDevices,
  getDevice,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  deleteUserDevice,
  deleteCarrierDevice,
  deleteClasdevi,
  createClasdevi,
  getDeviceLocation,
  getDeviceByCarrier,
  getDeviceAlerts
}