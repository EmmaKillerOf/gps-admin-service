const { devicone } = require('../models');

const createConexion = async (payload) => {
  return await devicone.create({...payload})
}

module.exports = {
  createConexion
}