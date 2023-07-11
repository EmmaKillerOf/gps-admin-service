const { devinoalarm } = require('../models');
let positions = [];
const createRegister = async (payload) => {
  const valid = await devinoalarm.findOne({
    where: {
      devinodevi: payload.devinodevi,
      devinotime: payload.devinotime
    }
  });
  let aux = positions.filter(x => x.devinotime == payload.devinotime && x.devinodevi == payload.devinodevi);
  if (valid || aux.length != 0) {
    console.log('Registro duplicado. No se realizará la inserción.');
    return;
  }
  if (aux.length == 0) {
    positions.push(payload);
    await devinoalarm.create(payload);
  } else {
    positions = [];
  }
}

module.exports = {
  createRegister
}