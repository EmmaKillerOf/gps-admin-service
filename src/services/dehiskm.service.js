const { Op, Sequelize } = require('sequelize');
const axios = require('axios');
const { dehiskm } = require('../models');

const config = require('../config/environment')
const raw = new Sequelize(config.DB.database, config.DB.username, config.DB.password, {
  host: config.DB.host,
  dialect: config.DB.dialect
})

const createHistKm = async (payload) => {
  return await dehiskm.bulkCreate([...payload]);
}

module.exports = {
  createHistKm
}