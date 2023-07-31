const { deviloca, devialar, keywords } = require('../models');
const devialarmService = require('./devialar.service');
const { Op } = require('sequelize');
const axios = require('axios');
let positions = [];
const createLocation = async (payload) => {
  const { devidelo, delotime, delolati, delolong, deloacc, delospee, delotinude, delotinu, delodoor, delosigc } = payload;

  // Consulta para verificar la validez
  const valid = await deviloca.findOne({
    where: { devidelo, delotime }
  });

  // Consulta para obtener los últimos registros de ubicación
  const lastRecords = await deviloca.findAll({
    where: { devidelo },
    order: [['delotime', 'DESC']],
    limit: 2
  });

  // Consulta para verificar eventos en la tabla devialar
  const validateEvent = await devialar.findOne({
    where: {
      devideal: devidelo,
      [Op.or]: [{ '$keywords.keywcodi$': 'on_ralenti' }, { '$keywords.keywcodi$': 'end_ralenti' }]
    },
    order: [['dealtime', 'DESC']],
    include: [{ model: keywords, as: 'keywords' }],
    raw: true,
    nest: true,
  });

  // Consulta para verificar eventos de estacionamiento en la tabla devialar
  const validateEventPark = await devialar.findOne({
    where: {
      devideal: devidelo,
      [Op.or]: [{ '$keywords.keywcodi$': 'on_parking' }, { '$keywords.keywcodi$': 'end_parking' }]
    },
    order: [['dealtime', 'DESC']],
    include: [{ model: keywords, as: 'keywords' }],
    raw: true,
    nest: true,
  });

  console.log(validateEvent);

  // Verificar si ya existe un registro válido o si hay duplicados
  const hasValidRecord = valid || positions.some(x => x.delotime === delotime && x.devidelo === devidelo);
  if (hasValidRecord) {
    return;
  }

  // Verificar si se cumple la condición para crear la alarma
  const isConditionMet = lastRecords.length === 2 && lastRecords[0].delospee === '0' && lastRecords[1].delospee === '0' && delospee === 0;

  // Función para crear alarmas si la condición se cumple
  const createAlarmIfValid = async (condition, alarmType) => {
    if (condition) {
      const newPayloadAlarm = await createPayloadAlarm(payload, alarmType);
      await devialarmService.createAlarm(newPayloadAlarm);
    }
  };

  if (isConditionMet) {
    const parseLat = parseFloat(delolati.toString().replace(/\./g, ''));
    const parseLon = parseFloat(delolong.toString().replace(/\./g, ''));
    const parseLatSearch = parseFloat(lastRecords[0].delolati.toString().replace(/\./g, ''));
    const parseLonSearch = parseFloat(lastRecords[0].delolong.toString().replace(/\./g, ''));
    const validate = calculateDifference(parseLat, parseLatSearch, parseLon, parseLonSearch, 100);

    // Crear alarma según la condición
    if (deloacc === 1 && (!validateEvent || validateEvent.keywords.keywcodi === 'end_ralenti')) {
      await createAlarmIfValid(true, 22);
    } else if (deloacc === 0 && validateEvent && validateEvent.keywords.keywcodi === 'on_ralenti') {
      await createAlarmIfValid(true, 23);
    }
    /* if(devidelo == 10){
      console.log(lastRecords[0]);
      console.log("---------------------");
      console.log(validateEventPark);
    } */
    
    if (deloacc === 0 && lastRecords[0].deloacc === '0' && (!validateEventPark || validateEventPark.keywords.keywcodi === 'end_parking')) {
      await createAlarmIfValid(true, 20);
    } else if (deloacc === 1 && validateEventPark && validateEventPark.keywords.keywcodi === 'on_parking') {
      await createAlarmIfValid(true, 21);
    }

    // Actualizar deviloca si la validación se cumple
    if (validate) {
      return await deviloca.update(
        {
          delotime, delotinude, delotinu, deloacc, delodoor, delosigc
        },
        {
          where: { delonuid: lastRecords[0].delonuid }
        }
      );
    }
  } else {
    // Crear alarma según la condición si no se cumple la condición isConditionMet
    await createAlarmIfValid(validateEvent && validateEvent.keywords.keywcodi === 'on_ralenti', 23);
    await createAlarmIfValid(validateEventPark && validateEventPark.keywords.keywcodi === 'on_parking', 21);
  }

  // Agregar posición a la lista si no hay duplicados
  if (lastRecords.length < 2) {
    if (!positions.some(x => x.delotime === delotime && x.devidelo === devidelo)) {
      positions.push(payload);
      await new Promise((resolve) => {
        setTimeout(async () => {
          const getAdress = await getDirections(delolati, delolong);
          payload.delodire = getAdress[0];
          payload.delobarri = getAdress[1];
          payload.delomuni = getAdress[2];
          payload.delodepa = getAdress[3];
          payload.delopais = getAdress[4];
          await deviloca.create(payload);
          resolve();
        }, 1100);
      });
    } else {
      positions = [];
    }
  } else if (lastRecords.length >= 2) {
    // Actualizar deviloca si hay más de dos registros
    return await deviloca.update(
      {
        delotime, delotinude, delotinu, deloacc, delodoor, delosigc
      },
      {
        where: { delonuid: lastRecords[0].delonuid }
      }
    );
  }
};

const createPayloadAlarm = async (payload, typeIdAlarm) => {
  const getAdress = await getDirections(payload.delolati, payload.delolong);
  payload.delodire = getAdress[0];
  payload.delobarri = getAdress[1];
  payload.delomuni = getAdress[2];
  payload.delodepa = getAdress[3];
  payload.delopais = getAdress[4];
  return {
    devideal: payload.devidelo,
    keywdeal: typeIdAlarm,
    dealstat: true,
    dealtinu: payload.delotinu,
    dealtime: payload.delotime,
    dealsign: payload.delosigc,
    dealhour: payload.delohour,
    deallati: payload.delolati,
    deallaor: payload.delolaor,
    deallong: payload.delolong,
    dealloor: payload.deloloor,
    dealspee: payload.delospee,
    delotinude: payload.delotinude,
    delodire: payload.delodire,
    delobarri: payload.delobarri,
    delomuni: payload.delomuni,
    delodepa: payload.delodepa,
    delopais: payload.delopais,
  };
};


const alarmMapping = () => {
  const latDiff = Math.abs(lat1 % 1000 - lat2 % 1000);
  const lonDiff = Math.abs(lon1 % 1000 - lon2 % 1000);
  if (latDiff <= rango || lonDiff <= rango) {
    return true;
  }
  return false;
};

const calculateDifference = (lat1, lat2, lon1, lon2, rango) => {
  const latDiff = Math.abs(lat1 % 1000 - lat2 % 1000);
  const lonDiff = Math.abs(lon1 % 1000 - lon2 % 1000);
  if (latDiff <= rango || lonDiff <= rango) {
    return true;
  }
  return false;
};

const updateCalcKm = async (deviceId, init, fin) => {
  return await deviloca.update(
    { delocalcu: true },
    {
      where: {
        delonuid: {
          [Op.gte]: init,
          [Op.lte]: fin
        },
        devidelo: deviceId
      }
    }
  );
}

const getRowsUpdate = async (deviceId, init, fin) => {
  return await deviloca.findAll(
    {
      where: {
        delocalcu: true,
        delonuid: {
          [Op.gte]: init,
          [Op.lte]: fin
        },
        devidelo: deviceId
      }
    }
  );
}

const getDirections = async (latitude, longitude) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    const data = response.data;

    let address = data.display_name;
    let suburb = findFirstProperty(data.address, ['neighbourhood', 'village', 'suburb', 'residential', 'county', 'town']);
    let muni = findFirstProperty(data.address, ['city', 'town', 'county']);
    let dpto = data.address.state || '';
    let pais = data.address.country || '';

    return [address, suburb, muni, dpto, pais];
  } catch (error) {
    console.log('Error en la solicitud de geocodificación inversa:', error);
    return ['', '', '', '', ''];
  }
};

const findFirstProperty = (obj, properties) => {
  for (const property of properties) {
    if (obj[property]) {
      return obj[property];
    }
  }
  return '';
};

module.exports = {
  createLocation,
  updateCalcKm,
  getRowsUpdate
}