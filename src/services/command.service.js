const { commands, stepscommand, execcomma, device, carrdevi, entityDevice, carrier, clasdevi, classvalue, deviloca } = require('../models');
const { Op, Sequelize } = require("sequelize");
const getExistCommand = async (payload) => {
  const results = await execcomma.findOne({
    where: {
      stepexec: payload.stepexec,
      deviexec: payload.deviexec,
      execacti: false
    }
  });
  return results;
}

/**
 * The function `getInfoCommand` retrieves information from a database using subqueries and returns the
 * results in ascending order based on the `stepid` attribute.
 * @param payload - The `payload` parameter is an object that contains the data needed for the function
 * to execute. It is not specified in the code snippet provided, so you would need to provide the
 * specific structure and properties of the `payload` object for further clarification.
 * @returns The function `getInfoCommand` returns the results of the final query, which is an array of
 * objects that match the conditions specified in the query.
 */
const getInfoCommand = async (payload) => {
  const subquery = await commands.findAll({
    attributes: ['commid'],
    include: [
      {
        model: stepscommand,
        as: 'stepscommand',
        where: {
          stepid: payload.stepexec,
        },
        attributes: ['stepid'],
      },
    ],
    raw: true,
  });

  // Obtener los commid de la subconsulta
  const commids = subquery.map((item) => item.commid);

  // Consulta final usando la subconsulta
  const results = await stepscommand.findAll({
    where: {
      commstep: commids,
    },
    order:
      [['stepid', 'ASC']]
  });

  const imei = await device.findOne({
    where: payload.deviexec,
    include: [
      {
        model: carrdevi,
        as: 'carrdevi',
        attributes: [],
        include: {
          model: carrier,
          as: 'carrier',
          attributes: []
        }
      },
    ],
    raw: true
  });
  return [results, imei];
}

const sendCommand = async (payload) => {
  return await execcomma.bulkCreate(payload)
}

const validateRespCommand = async (device, key) => {
  console.log(device, key);
  const results = await execcomma.findAll({
    where: {
      deviexec: device,
      execacti: 0
    },
    include: [
      {
        model: stepscommand,
        as: 'stepscommand',
        where: {
          stepresp: key,
        },
        attributes: []
      }
    ],
    raw: true
  });
  if (results.length>0) {
    const ids = results.map((objeto) => objeto.execid);
    await execcomma.update({ execacti: 1 }, {
      where: {
        execid: {
          [Op.in]: ids
        }
      }
    });
  }
}

module.exports = {
  getInfoCommand,
  sendCommand,
  getExistCommand,
  validateRespCommand
}