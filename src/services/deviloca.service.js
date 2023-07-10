const { deviloca } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

const createLocation = async (payload) => {

  const valid = await deviloca.findOne({
    where: {
      devidelo: payload.devidelo,
      delotime: payload.delotime
    }
  });

  console.log(payload);
  console.log("--------------------------\n");

  const lastRecord = await deviloca.findAll({
    where: {
      devidelo: payload.devidelo,
      delolati: payload.delolati,
      delolong: payload.delolong
    },
    order: [['delonuid', 'DESC']],
    limit: 2
  });

  if (valid) {
    console.log('Registro duplicado. No se realizará la inserción.');
    return;
  }

  if (lastRecord.length < 2) {
    await new Promise((resolve) => {
      setTimeout(async () => {
        const getAdress = await getDirections(payload.delolati, payload.delolong);
        payload.delodire = getAdress[0];
        payload.delobarri = getAdress[1];
        console.log(getAdress[1] + " BARRIO");
        await deviloca.create(payload);
        resolve();
      }, 1100);
    });
  } else if (lastRecord.length >= 2) {
    return await deviloca.update(
      {
        delotime: payload.delotime,
        delotinude: payload.delotinude,
        delotinu: payload.delotinu
      },
      {
        where: { delonuid: lastRecord[0].delonuid }
      }
    );
  }
}

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
  createLocation,
  updateCalcKm,
  getRowsUpdate
}