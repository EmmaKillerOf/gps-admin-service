const { devialar } = require('../models');
const axios = require('axios');
const createAlarm = async (payload) => {
  const lastRecord = await devialar.findAll({
    where: {
      devideal: payload.devideal,
      deallati: payload.deallati,
      deallong: payload.deallong
    },
    order: [['devideal', 'DESC']],
    limit: 2
  });

  const valid = await devialar.findOne({
    where: {
      devideal: payload.devideal,
      dealtime: payload.dealtime
    }
  });

  if (lastRecord.length < 2 && !valid) {
    setTimeout(async () => {
      const getAdress = await getDirections(payload.deallati, payload.deallong);
      payload.delodire = getAdress[0];
      payload.delobarri = getAdress[1];
      return await devialar.create({...payload})
    }, 1500);
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
      suburb = data.address.suburb;
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