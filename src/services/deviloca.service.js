const { deviloca, devialar, keywords, device } = require('../models');
const devialarmService = require('./devialar.service');
const { Op } = require('sequelize');
const axios = require('axios');
let positions = [];
let events = [];
const createLocation = async (payload) => {
  let { devidelo, delotime, delolati, delolong, deloacc, delospee, delotinude, delotinu, delodoor, delosigc, delosign } = payload;
  /* delospee = 0;
  deloacc = 0;
  payload.delospee = 0;
  payload.deloacc = 0; */
  // Consulta para verificar la validez
  const valid = await deviloca.findOne({
    where: { devidelo, delotime }
  });

  const lastRecords = await findLastLocationRecords(devidelo, delolati, delolong, 2);

  const lastRecordPark = await findLastParkingRecords(payload.devidelo, 2);

  const validateEvent = await findLastEvent(devidelo, [
    { '$keywords.keywcodi$': 'on_ralenti' },
    { '$keywords.keywcodi$': 'end_ralenti' }
  ]);

  const validateEventPark = await findLastEvent(devidelo, [
    { '$keywords.keywcodi$': 'on_parking' },
    { '$keywords.keywcodi$': 'end_parking' }
  ]);

  const validateDevice = await findDevice(devidelo);

  // Verificar si ya existe un registro válido o si hay duplicados
  const hasValidRecord = valid || positions.some(x => x.delotime === delotime && x.devidelo === devidelo);
  if (hasValidRecord) {
    return;
  }

  if (delospee != 0 && deloacc == '0') {
    await createAlarmIfValid(true, 33, payload, false);
  }

  // Verificar si se cumple la condición para evitar puntos cercanos de parqueo
  const isConditionMet = lastRecordPark.length === 2 && lastRecordPark[0].delospee === '0' && lastRecordPark[1].delospee === '0' && delospee === 0;

  if (delosign == 'L') {
    await createAlarmIfValid(true, 32, payload, true, lastRecordPark);
  }
  await processRalentiCondition(lastRecordPark, delospee, deloacc, validateDevice, validateEvent, payload);

  if (isConditionMet) {
    const parseLat = parseFloat(delolati.toString().replace(/\./g, ''));
    const parseLon = parseFloat(delolong.toString().replace(/\./g, ''));
    const parseLatSearch = parseFloat(lastRecordPark[0].delolati.toString().replace(/\./g, ''));
    const parseLonSearch = parseFloat(lastRecordPark[0].delolong.toString().replace(/\./g, ''));
    const validate = calculateDifference(parseLat, parseLatSearch, parseLon, parseLonSearch, 100);

    await processParkingCondition(deloacc, lastRecordPark, validateEventPark, payload);

    // Actualizar deviloca si la validación se cumple
    if (validate) {
      return await deviloca.update(
        {
          delotime, delotinude, delotinu, deloacc, delodoor, delosigc
        },
        {
          where: { delonuid: lastRecordPark[0].delonuid }
        }
      );
    }
  } else {
    // Crear alarma según la condición si no se cumple la condición isConditionMet
    await createAlarmIfValid(validateEventPark && validateEventPark.keywords.keywcodi === 'on_parking', 21, payload);
  }

  // Agregar posición a la lista si no hay duplicados
  if (lastRecords.length < 2) {
    if (!positions.some(x => x.delotime === delotime && x.devidelo === devidelo)) {
      positions.push(payload);
      await new Promise((resolve) => {
        setTimeout(async () => {
          /* const getAdress = await getDirections(delolati, delolong);
          payload.delodire = getAdress[0];
          payload.delobarri = getAdress[1];
          payload.delomuni = getAdress[2];
          payload.delodepa = getAdress[3];
          payload.delopais = getAdress[4]; */
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

const findLastLocationRecords = async (devidelo, delolati, delolong, limit) => {
  return await deviloca.findAll({
    where: { devidelo, delolati, delolong, delosign: 'F' },
    order: [['delotime', 'DESC']],
    limit: limit
  });
};

const findLastParkingRecords = async (devidelo, limit) => {
  return await deviloca.findAll({
    where: {
      devidelo: devidelo,
      delosign: 'F'
    },
    order: [['delotime', 'DESC']],
    limit: limit
  });
};

const findLastEvent = async (devideal, keywordsConditions) => {
  return await devialar.findOne({
    where: {
      devideal: devideal,
      [Op.or]: keywordsConditions
    },
    order: [['dealtime', 'DESC']],
    include: [{ model: keywords, as: 'keywords' }],
    raw: true,
    nest: true,
  });
};

const findDevice = async (devidelo) => {
  return await device.findOne({
    where: {
      devinuid: devidelo,
    },
    raw: true,
    nest: true,
  });
};

const createAlarmIfValid = async (condition, alarmType, payload, customPayload = null, lastRecordPark) => {
  let newPayloadAlarm;
  if (condition && !customPayload) {
    newPayloadAlarm = await createPayloadAlarm(payload, alarmType, true);
  } else if (condition && customPayload) {
    newPayloadAlarm = await createPayloadAlarm(lastRecordPark[0], alarmType, false);
  }
  if (newPayloadAlarm) {
    await devialarmService.createAlarm(newPayloadAlarm);
  }
};

const processRalentiCondition = async (lastRecordPark, delospee, deloacc, validateDevice, validateEvent, payload) => {
  const isConditionMetRalenti = lastRecordPark.length == 2 && lastRecordPark[0].delospee == '0' && delospee == 0;
  if (isConditionMetRalenti) {
    if (deloacc == '1' && validateDevice && validateDevice.deviestacomma == 1 && (!validateEvent || validateEvent.keywords.keywcodi == 'end_ralenti')) {
      await createAlarmIfValid(true, 22, payload);
    } else if (deloacc == '0' && validateEvent && validateEvent.keywords.keywcodi == 'on_ralenti') {
      if (!events.some(x => x.keywdeal == 23)) {
        const auxNewPayloadAlarm = await createPayloadAlarm(payload, 23, false);
        events.push(auxNewPayloadAlarm);
        await createAlarmIfValid(true, 23, payload);
      } else {
        events = [];
      }
    }
  } else {
    await createAlarmIfValid(validateEvent && validateEvent.keywords.keywcodi == 'on_ralenti', 23, payload);
    if (validateEvent && validateEvent.keywords.keywcodi == 'on_ralenti') {
      events.push(auxNewPayloadAlarm);
    } else {
      events = [];
    }
  }
};

const processParkingCondition = async (deloacc, lastRecordPark, validateEventPark, payload) => {
  if (deloacc == '0' && lastRecordPark[0].deloacc == '0' && (!validateEventPark || validateEventPark.keywords.keywcodi == 'end_parking')) {
    await createAlarmIfValid(true, 20, payload, true, lastRecordPark);
  } else if (deloacc == '1' && validateEventPark && validateEventPark.keywords.keywcodi == 'on_parking') {
    if (!events.some(x => x.keywdeal == 21)) {
      const auxNewPayloadAlarm = await createPayloadAlarm(payload, 21, false);
      events.push(auxNewPayloadAlarm);
      await createAlarmIfValid(true, 21, payload, true, lastRecordPark);
    } else {
      events = [];
    }
  }
};

const createPayloadAlarm = async (payload, typeIdAlarm, getDirection = false) => {
  if (getDirection) {
    //const getAdress = await getDirections(payload.delolati, payload.delolong);
    const getAdress = ["","","","","",""];
    payload.delodire = getAdress[0];
    payload.delobarri = getAdress[1];
    payload.delomuni = getAdress[2];
    payload.delodepa = getAdress[3];
    payload.delopais = getAdress[4];
  }
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
    dealacc: payload.deloacc,
    dealdoor: payload.delodoor,
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