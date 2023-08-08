const { devialar } = require('../models');
const axios = require('axios');
let positions = [];
const createAlarm = async (payload) => {
  const valid = await devialar.findOne({
    where: {
      devideal: payload.devideal,
      dealtime: payload.dealtime
    }
  });
  /* const lastRecord = await devialar.findAll({
    where: {
      devideal: payload.devideal,
      deallati: payload.deallati,
      deallong: payload.deallong
    },
    order: [['devideal', 'DESC'],['dealtime','desc']],
    limit: 2
  }); */
  let aux = positions.filter(x => x.dealtime == payload.dealtime && x.devideal == payload.devideal);
  if (valid || aux.length != 0) {
    console.log('Registro duplicado. No se realizará la inserción.');
    return;
  }
  /* if (lastRecord.length < 2) { */
    if (aux.length == 0) {
      positions.push(payload);
      await new Promise((resolve) => {
        setTimeout(async () => {
          const getAdress = await getDirections(payload.deallati, payload.deallong);
          payload.delodire = getAdress[0];
          payload.delobarri = getAdress[1];
          payload.delomuni = getAdress[2];
          payload.delodepa = getAdress[3];
          payload.delopais = getAdress[4];
          await devialar.create({ ...payload })
          resolve();
        }, 1100);
      });
    } else {
      positions = [];
    }
 /*  } */ /* else if (lastRecord.length >= 2) {
    await devialar.update(
      {
        dealtime: payload.dealtime,
        delotinude: payload.delotinude,
        delotinu: payload.delotinu
      },
      {
        where: { devideal: lastRecord[0].devideal }
      }
    );
  } */
}

const getDirections = async (latitude, longitude) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    const data = response.data;

    let address = data.display_name;
    let suburb = findFirstProperty(data.address, ['neighbourhood', 'village', 'suburb', 'residential', 'county']);
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
  createAlarm
}