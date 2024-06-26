const { Op, Sequelize } = require("sequelize");
const { device, carrdevi, entityDevice, carrier, clasdevi, classvalue, deviloca, kmdevi, devialar, keywords } = require('../models');
const { getClassifier } = require("./classifier.service");
const { forEach } = require("underscore");

const getDevicesToCalculate = async (entityId, available, entityUserId = null, userSelectedId = 'null', secondEntityUserId = null, entityUserSession = null, carrId) => {
  
  const attributes = [
    'devinuid',
    'entidevi',
    'deviimei',
    'devimark',
    'devimode',
    'deviphon',
    'devistat',
    'deviestacomma'
  ];

  if (userSelectedId == 'null' && !available) {
    attributes.push([Sequelize.literal('false'), 'check'])
  } else {
    attributes.push([Sequelize.literal('true'), 'check'])
  }
  const order = [['devinuid', 'DESC']];

  const devices = await device.findAndCountAll({
    where: {
      entidevi: entityId,
      //...queryUser,
    },
    attributes,
    order,
    raw: false,
    nest: true,
    logging: false
  });
  
  return devices;
}
const getDevices = async (entityId, available, entityUserId = null, userSelectedId = 'null', secondEntityUserId = null, entityUserSession = null, carrId) => {
  let query = {}, havingCondition = {};

  if (userSelectedId != 'null' && secondEntityUserId && entityUserSession && secondEntityUserId.enusrole != 'ADMIN' && entityUserSession.enusrole != 'ADMIN') {
    query = { [Op.or]: [{ '$entityDevice.userende$': secondEntityUserId.enusnuid }, { '$entityDevice.userende$': entityUserSession.enusnuid }] };
    havingCondition = Sequelize.where(Sequelize.fn('COUNT', Sequelize.col('deviende')), {
      [Op.gt]: 1
    });
  } else if (userSelectedId == 'null' && entityUserSession && entityUserSession.enusrole != 'ADMIN') {
    query = { '$entityDevice.userende$': entityUserSession.enusnuid }
  } else if (userSelectedId != 'null' && entityUserSession && entityUserSession.enusrole == 'ADMIN') {
    query = { '$entityDevice.userende$': secondEntityUserId.enusnuid }
  } else if (userSelectedId != 'null' && secondEntityUserId && secondEntityUserId.enusrole == 'ADMIN') {
    query = { '$entityDevice.userende$': entityUserSession.enusnuid }
  } else if (userSelectedId == 'null' && available && entityUserSession && entityUserSession.enusrole != 'ADMIN') {
    query = { '$entityDevice.userende$': entityUserSession.enusnuid }
  }
  const availableQuery = available ? { '$carrdevi.carrcade$': { [Op.eq]: carrId } } : {}
  let queryUser = {};
  if ((userSelectedId !== 'null' && entityUserSession.enusrole !== 'ADMIN') || (available && entityUserSession.enusrole != 'ADMIN')) {
    queryUser = {
      [Op.or]: [
        //{ '$entityDevice.userende$': entityUserSession.enusnuid },
        { '$entityDevice.userende$': entityUserSession.enusnuid },
      ]
    }
  };
  const includes = secondEntityUserId ? [
    {
      model: entityDevice,
      as: 'entityDevice',
      attributes: []
    }
  ] : []
  const includesClassifiers = userSelectedId == 'null' ? [
    {
      model: clasdevi,
      as: 'clasdevi',
      include: {
        model: classvalue,
        as: 'classvalue'
      }
    }
  ] : []
  const attributes = [
    'devinuid',
    'entidevi',
    'deviimei',
    'devimark',
    'devimode',
    'deviphon',
    'devistat',
    'deviestacomma'
  ];
  let combinedDevices = { rows: [] };

  if (userSelectedId == 'null' && !available) {
    attributes.push([Sequelize.literal('false'), 'check'])
  } else {
    attributes.push([Sequelize.literal('true'), 'check'])
  }
  const order = [['devinuid', 'DESC']];

  let commonInclude = [
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
      order: [['kmdiacapt', 'DESC']],
      limit: 1
    },
    {
      model: deviloca,
      as: 'deviloca',
      where: {
        delosign: 'F'
      },
      separate: true,
      order: [['delotinu', 'DESC'], ['delotime', 'DESC']],
      limit: 1
    },
    ...includes,
    ...includesClassifiers,

  ];
  const devices = await device.findAndCountAll({
    where: {
      entidevi: entityId,
      ...query,
      //...queryUser,
      ...availableQuery
    },
    attributes,
    order,
    include: commonInclude,
    group: userSelectedId != 'null' && secondEntityUserId && entityUserSession && secondEntityUserId.enusrole != 'ADMIN' && entityUserSession.enusrole != 'ADMIN' ? ['entityDevice.deviende'] : undefined,
    having: userSelectedId != 'null' && secondEntityUserId && entityUserSession && secondEntityUserId.enusrole != 'ADMIN' && entityUserSession.enusrole != 'ADMIN' ? havingCondition : undefined,
    raw: false,
    nest: true,
    logging: false
  });
  combinedDevices = {
    rows: [...devices.rows]
  };
  if (userSelectedId != 'null' || available) {
    const devicesAllEntityDistinct = await device.findAndCountAll({
      where: {
        entidevi: entityId,
        devinuid: {
          [Op.notIn]: devices.rows.map(device => device.devinuid),
        },
        ...queryUser,
      },
      attributes: [
        ...attributes.slice(0, -1), // Use the same attributes except 'check'
        [Sequelize.literal('false'), 'check']
      ],
      order,
      include: commonInclude,
      raw: false,
      nest: true
    });
    combinedDevices = {
      rows: [...devices.rows, ...devicesAllEntityDistinct.rows]
    };
  }
  combinedDevices.rows = combinedDevices.rows.map(convertCheckValue);
  const { getKmTravelTemp } = require("../controllers/travel.controller");
  let startDat = getDateActually(), endDat = getDateActually();
  let minutesStart = hasTimeIncluded(startDat, 'start');
  let minutesEnd = hasTimeIncluded(endDat, 'end');
  for (const e of combinedDevices.rows) {
    e.dataValues.today = await getKmTravelTemp(e.devinuid, startDat + minutesStart, endDat + minutesEnd);
  }
  return combinedDevices;
}

function convertCheckValue(obj) {
  if (obj.dataValues.check === 1) {
    obj.dataValues.check = true;
  } else if (obj.dataValues.check === 0) {
    obj.dataValues.check = false;
  }
  return obj;
}
/* 
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
} */

const POSITION_KEYWORD = "position";

const getDateActually = () => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  return formattedDate;
}

// Función asincrónica para obtener la ubicación del dispositivo
const getDeviceLocation = async ({ devices, plate, startDate = getDateActually(), endDate = getDateActually(), isAlarm, isLocation = true, isEvent, typeReport }) => {
  try {
    // Arreglo para almacenar las inclusiones
    const includeArray = [];

    // Obtiene los minutos de inicio y fin
    const minutesStart = hasTimeIncluded(startDate, 'start');
    const minutesEnd = hasTimeIncluded(endDate, 'end');

    // Consulta condicional para placa
    const plateQuery = plate ? { [`$carrdevi.carrier.carrlice$`]: plate } : {}

    // Determina los límites para el tipo de informe
    const limits = typeReport != 3 ? 1 : null; 
    let dateQuery = {};
    if (typeReport != 2) {
      // Consulta de fecha para filtrar por rango de fechas
      dateQuery = {
        delotinude: {
          [Op.and]: {
            [Op.gte]: startDate + minutesStart,
            [Op.lte]: endDate + minutesEnd
          }
        }
      }
    }
    
    // Si es ubicación y no es tipo de informe 4, incluye la ubicación
    if (isLocation && typeReport != 4) {
      console.log(dateQuery);
      includeArray.push(getLocationInclude(dateQuery, limits));
    }

    // Si es alarma o evento, incluye la alarma
    if (isAlarm || isEvent) {
      includeArray.push(getAlarmInclude(dateQuery, isAlarm, isEvent));
    }

    // Incluye información del dispositivo y el transportista
    includeArray.push({
      model: carrdevi,
      as: 'carrdevi',
      attributes: ['cadenuid'],
      include: {
        model: carrier,
        as: 'carrier',
      }
    });

    // Incluye información de kilometraje con fecha dentro del rango
    includeArray.push({
      model: kmdevi,
      as: 'kmdevi',
      attributes: ['kmdiacapt', 'kmcapt'],
      where: {
        kmdiacapt: {
          [Op.and]: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        }
      },
      separate: true
    });

    // Obtiene los datos del dispositivo
    const deviceResult = await fetchDeviceData(devices, plateQuery, includeArray);

    // Procesa y transforma los datos obtenidos
    const transformedEntries = processAndTransform(deviceResult);

    // Calcula los kilómetros totales
    const kmTotally = calculateKmTemp(transformedEntries, startDate + minutesStart, endDate + minutesEnd);

    // Devuelve los kilómetros totales
    return kmTotally;
  } catch (error) {
    // Manejo de errores
    console.log(error);
  }
};


const calculateKmTemp = async (deviceResult, startDate, endDate) => {
  const { getKmTravelTemp, getTimes, getKmTravelTempByDay } = require("../controllers/travel.controller");
  let startDat = getDateActually(), endDat = getDateActually();
  let minutesStart = hasTimeIncluded(startDat, 'start');
  let minutesEnd = hasTimeIncluded(endDat, 'end');
  for (const e of deviceResult) {
    const calculateKm = await getKmTravelTempByDay(e.devinuid, startDate, endDate);
    const roundedDistanceByDay = roundKmTotally(calculateKm);
    const adjustedKmTotalPerDay = adjustKmTotalPerDay(roundedDistanceByDay);
    const sumKmTotalPerDay = adjustedKmTotalPerDay.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.value;
    }, 0);
    e.kmTotalPerDay = adjustedKmTotalPerDay;
    e.kmTotally = sumKmTotalPerDay;
    e.times = await getTimes(e.devinuid, startDate, endDate);
    e.today = await getKmTravelTemp(e.devinuid, startDat + minutesStart, endDat + minutesEnd);
  }
  return deviceResult;
}

const roundKmTotally = (data) => {
  if (typeof data === 'object') {
    const roundedData = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (typeof data[key] === 'object') {
          roundedData[key] = {};
          for (const subKey in data[key]) {
            if (data[key].hasOwnProperty(subKey)) {
              roundedData[key][subKey] = Math.ceil(data[key][subKey]);
            }
          }
        } else {
          roundedData[key] = Math.ceil(data[key]);
        }
      }
    }
    return roundedData;
  } else {
    return data;
  }
};

const adjustKmTotalPerDay = (kmTotalPerDay) => {
  const adjustedData = [];
  for (const date in kmTotalPerDay) {
    if (kmTotalPerDay.hasOwnProperty(date)) {
      adjustedData.push({ date, value: kmTotalPerDay[date] });
    }
  }
  return adjustedData;
};

const getLocationInclude = (dateQuery, limits) => ({
  model: deviloca,
  as: 'deviloca',
  separate: true,
  where: {
    ...dateQuery,
    delosign: 'F'
  },
  limit: limits,
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
  let infoDevices = [];
  deviceResult.forEach(device => {
    const { deviloca, devialar, ...rest } = device.dataValues;
    infoDevices.push(rest);
    if (device.deviloca) {
      const devilocaEntries = device.deviloca.map(entry => ({
        ...entry.dataValues,
        keywords: {
          keywfunc: entry.dataValues.delospee != "0" ? 'En movimiento' : 'Sin movimiento',
          keytypenomb: POSITION_KEYWORD
        },
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
  let transformedEntries = allEntries
    .sort((a, b) => b.delotinude.localeCompare(a.delotinude))
    .map(transformEntry);
  infoDevices.forEach(e => {
    e.locations = transformedEntries.filter(x => x.devidelo == e.devinuid);
  });
  return infoDevices;
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
    dealnuid: 'delonuid',
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
  getDeviceAlerts,
  getDevicesToCalculate
}