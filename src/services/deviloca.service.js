const { deviloca } = require('../models');

const createLocation = async (payload) => {
  return await deviloca.create({...payload})
}

module.exports = {
  createLocation
}