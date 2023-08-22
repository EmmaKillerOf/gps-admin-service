const { Op, Sequelize } = require("sequelize");
const { device, carrdevi, entityDevice, carrier, clasdevi, classvalue, deviloca, kmdevi, devialar, keywords } = require('../models');
const { getClassifier } = require("./classifier.service");

const getDevices = async (entityId, available, entityUserId = null) => {
  const query = entityUserId ? { '$entityDevice.userende$': entityUserId } : {}
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
    order: [
      ['devinuid', 'DESC'],
    ],
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
        model: clasdevi,
        as: 'clasdevi',
        include: {
          model: classvalue,
          as: 'classvalue'
        }
      },
      {
        model: kmdevi,
        as: 'kmdevi',
        order: [['kmdiacapt', 'DESC']],
        limit: 1
      },
      {
        model: deviloca,
        as: 'deviloca',
        where: {
          delosign: 'F'
        },
        separate: true, // <--- Run separate query
        order: [['delotinu', 'DESC'], ['delotime', 'DESC']],
        limit: 1
      },
      ...includes,
    ],
    raw: false,
    nest: true
  })

  /* const classifiersDevice = await getCassifierDevice(); */

  return devices
}

const myDevices = async (entityId, entityUserId = null) => {
  const query = entityUserId ? { '$entityDevice.userende$': entityUserId } : {}
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
    order: [
      'devinuid', 'DESC',
    ],
    attributes: ['devinuid'],
    raw: false,
    nest: true
  })
  return devices
}

const POSITION_KEYWORD = "position";

const getDateActually = () => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  return formattedDate;
}

const getDeviceLocation = async ({ devices, plate, startDate = getDateActually(), endDate = getDateActually(), isAlarm, isLocation = true, isEvent }) => {
  try {
    const includeArray = [];
    const minutesStart = hasTimeIncluded(startDate, 'start');
    const minutesEnd = hasTimeIncluded(endDate, 'end');
    const plateQuery = plate ? { [`$carrdevi.carrier.carrlice$`]: plate } : {}
    const dateQuery = {
      delotinude: {
        [Op.and]: {
          [Op.gte]: startDate + minutesStart,
          [Op.lte]: endDate + minutesEnd
        }
      }
    }
    if (isLocation) {
      includeArray.push(getLocationInclude(dateQuery));
    }
    if (isAlarm || isEvent) {
      includeArray.push(getAlarmInclude(dateQuery, isAlarm, isEvent));
    }
    includeArray.push({
      model: carrdevi,
      as: 'carrdevi',
      attributes: ['cadenuid'],
      include: {
        model: carrier,
        as: 'carrier',
      },
    });
    const deviceResult = await fetchDeviceData(devices, plateQuery, includeArray);
    const transformedEntries = processAndTransform(deviceResult);
    return transformedEntries;
  } catch (error) {
    console.log(error);
  }
};

const getLocationInclude = (dateQuery) => ({
  model: deviloca,
  as: 'deviloca',
  separate: true,
  where: {
    ...dateQuery,
    delosign: 'F'
  },
  order: [['delotinude', 'DESC']],
});

const getAlarmInclude = (dateQuery, isAlarm, isEvent) => ({
  model: devialar,
  as: 'devialar',
  separate: true,
  where: {
    ...dateQuery,
  },
  order: [['delotinude', 'DESC']],
  include: [
    {
      model: keywords,
      as: 'keywords',
      attributes: ['keywfunc', 'keytype', 'keyalarm', 'keyiconame', 'keyicoroute'],
      where: {
        [Op.and]: [
          (isAlarm && isEvent) ? { keytype: 1, [Op.or]: [{ keyalarm: 1 }, { keyalarm: 0 }] } : {},
          (!isAlarm && isEvent) ? { keyalarm: 0, keytype: 1 } : {},
          (isAlarm && !isEvent) ? { keyalarm: 1, keytype: 1 } : {},
        ],
      }
    }
  ]
});

async function fetchDeviceData(devices, plateQuery, includeArray) {
  return await device.findAll({
    where: {
      devinuid: {
        [Op.in]: devices
      },
      ...plateQuery
    },
    include: includeArray,
    raw: false,
    nest: true
  });
}

function processAndTransform(deviceResult) {
  const allEntries = [];
  deviceResult.forEach(device => {
    if (device.deviloca) {
      const devilocaEntries = device.deviloca.map(entry => ({
        ...entry.dataValues,
        keywords: { keywfunc: POSITION_KEYWORD, keytypenomb: POSITION_KEYWORD },
        source: 'deviloca'
      }));
      allEntries.push(...devilocaEntries);
    }
    if (device.devialar) {
      const devialarEntries = device.devialar.map(entry => {
        const transformedEntry = {
          ...entry.dataValues,
          source: 'devialar'
        };
        if (entry.dataValues.keywords.dataValues && entry.dataValues.keywords.dataValues.keytype && entry.dataValues.keywords.dataValues.keyalarm) {
          transformedEntry.keywords.dataValues.keytypenomb = 'alarm';
        } else {
          transformedEntry.keywords.dataValues.keytypenomb = 'event';
        }
        return transformedEntry;
      });
      allEntries.push(...devialarEntries);
    }
  });
  const transformedEntries = allEntries
    .sort((a, b) => b.delotinude.localeCompare(a.delotinude))
    .map(transformEntry);
  return transformedEntries;
}

function transformEntry(entry) {
  const { source, ...rest } = entry;
  if (propertyMapping[source]) {
    const mapping = propertyMapping[source];
    const transformedEntry = { ...rest, source };
    for (const [oldProp, newProp] of Object.entries(mapping)) {
      if (transformedEntry.hasOwnProperty(oldProp)) {
        transformedEntry[newProp] = transformedEntry[oldProp];
        delete transformedEntry[oldProp];
      }
    }
    return transformedEntry;
  }
  return entry;
}

const propertyMapping = {
  devialar: {
    dealfesi: 'delofesi',
    dealtime: 'delotime',
    deallati: 'delolati',
    deallong: 'delolong',
    /*delodire: 'delodire',
     delobarri: 'delobarri',
    delomuni: 'delomuni',
    delodepa: 'delodepa',
    delopais: 'delopais', */
    dealspee: 'delospee',
    dealtinu: 'delotinu',
    devideal: 'devidelo',
    dealloor: 'deloloor',
    deallaor: 'delolaor',
    dealhour: 'delohour',
    dealsign: 'delosign',
    keywdeal: 'delokeyw',

  },
};

const getDeviceAlerts = async ({ devices, plate, startDate, endDate }) => {
  try {
    let minutesStart = hasTimeIncluded(startDate, 'start');
    let minutesEnd = hasTimeIncluded(endDate, 'end');
    const dateQuery = {
      delotinude: {
        [Op.and]: {
          [Op.gte]: startDate + minutesStart,
          [Op.lte]: endDate + minutesEnd
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
          separate: true,
          where: {
            ...dateQuery
          },
          order: [['delotinude', 'DESC']],
        },
        {
          model: carrdevi,
          as: 'carrdevi',
          attributes: ['cadenuid'],
          include: {
            model: carrier,
            as: 'carrier',
          }
        },
      ],
      raw: false,
      nest: true
    })

    return deviceResult
  } catch (error) {
    console.log(error)
  }
}

const hasTimeIncluded = (dateString, origin) => {
  let minutes = '';
  if (dateString.length == 10) {
    switch (origin) {
      case 'start':
        minutes = ' 00:00:00';
        break;
      case 'end':
        minutes = ' 23:59:59';
        break;
    }
  }
  return minutes;
}

const getDevice = async (query) => {
  const deviceResult = await device.findOne({
    where: {
      ...query
    }
  })
  let classifiers
  if (query.devinuid) {
    const classifiersResult = await getCassifierDevice(query.devinuid);
    classifiers = classifiersResult ? { classifiers: classifiersResult } : {}
  }
  return deviceResult ? { ...deviceResult, ...classifiers } : deviceResult
}

const getDeviceById = async (entityId, deviceId) => {
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
    include: {
      model: carrdevi,
      as: 'carrdevi',
    },
    raw: false,
    nest: true
  })
  return devices
}

const createDevice = async (payload) => {
  const deviceResult = await device.create({ ...payload })
  return deviceResult
}

const updateDevice = async (deviceId, payload) => {
  await device.update(
    { ...payload },
    {
      where: {
        devinuid: deviceId
      },
      raw: false,
    }
  )
  const deviceUpdated = await device.findOne({ where: { devinuid: deviceId } })

  return deviceUpdated
}

const getCassifierDevice = async (deviceId) => {
  const classifiers = await clasdevi.findAll({
    where: {
      deviclde: deviceId,
    },
    include: {
      model: classvalue,
      as: 'classvalue',
      attributes: ['clvanuid', 'clvadesc', 'clvastat'],
    },
    raw: false,
    nest: true
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
  console.log({ payload })
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