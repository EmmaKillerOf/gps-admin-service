const { Op, Sequelize } = require('sequelize');
const axios = require('axios');
const { commands, execcomma, stepscommand } = require('../models');

const config = require('../config/environment')
const raw = new Sequelize(config.DB.database, config.DB.username, config.DB.password, {
  host: config.DB.host,
  dialect: config.DB.dialect
})

const getCommandsPendings = async (deviceId) => {
  const commands = await execcomma.findAll({
    attributes: ['execid', 'deviexec', 'execparam'],
    where: {
      deviexec: deviceId,
      execacti: false
    },
    raw : false,
    nest : true
  })
  return commands
}

const sendCommand = async (payload) => {
  return await execcomma.create({...payload})
}

module.exports = {
  getCommandsPendings,
  sendCommand
}