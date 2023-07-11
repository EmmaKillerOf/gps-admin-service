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
  const lastRecord = await devialar.findAll({
    where: {
      devideal: payload.devideal,
      deallati: payload.deallati,
      deallong: payload.deallong
    },
    order: [['devideal', 'DESC']],
    limit: 2
  });
  let aux = positions.filter(x => x.dealtime == payload.dealtime && x.devideal == payload.devideal);
  if (valid || aux.length != 0) {
    console.log('Registro duplicado. No se realizará la inserción.');
    return;
  }
  if (lastRecord.length < 2) {
    if (aux.length == 0) {
      positions.push(payload);
      await new Promise((resolve) => {
        setTimeout(async () => {
          const getAdress = await getDirections(payload.deallati, payload.deallong);
          payload.delodire = getAdress[0];
          payload.delobarri = getAdress[1];
          await devialar.create({ ...payload })
          resolve();
        }, 1100);
      });

    } else {
      positions = [];
    }
  } else if (lastRecord.length >= 2) {
    return await devialar.update(
      {
        dealtime: payload.dealtime,
        delotinude: payload.delotinude,
        delotinu: payload.delotinu
      },
      {
        where: { devideal: lastRecord[0].devideal }
      }
    );
  }
}

const getDirections = async (latitude, longitude) => {
  let address = ' ';
  let suburb = ' ';
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    const data = response.data;
    if (data) {
      address = data.display_name;
      if(data.address.neighbourhood){
        suburb = data.address.neighbourhood;
        return [address, suburb];
      }
      if(data.address.village){
        suburb = data.address.village;
        return [address, suburb];
      }
      if(data.address.suburb){
        suburb = data.address.suburb;
        return [address, suburb];
      }
      if(data.address.county){
        suburb = data.address.county;
        return [address, suburb];
      }
    }
    return [address, suburb];
  } catch (error) {
    console.log('Error en la solicitud de geocodificación inversa:', error);
    return [address, suburb];
  }
}

module.exports = {
  createAlarm
}