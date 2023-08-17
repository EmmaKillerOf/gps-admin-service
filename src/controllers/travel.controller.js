
const travelService = require('../services/travel.service')
const devilocaService = require('../services/deviloca.service');
const deviceService = require('../services/device.service');
const dehiskmService = require('../services/dehiskm.service');

const getTravel = async (req, res) => {
  try {
    const { deviceId, dateSelected } = req.params;
    const travelsCalculatesOld = await travelService.getKmsCalculates(deviceId, dateSelected);
    const travels = await travelService.getTravel(deviceId, dateSelected);

    let DistanceTotal = 0, DistanceOld = 0;

    if (travels.length > 0) {
      for (let i = 0; i < travels.length - 1; i++) {
        const punto1 = travels[i];
        const punto2 = travels[i + 1];
        DistanceTotal += haversineDistance(
          punto1.delolati,
          punto1.delolong,
          punto2.delolati,
          punto2.delolong
        );
      }

      const { delonuid } = travels[0];
      const { delonuid: lastDelonuid } = travels[travels.length - 1];

      const payload = kmMapping([deviceId, delonuid, lastDelonuid, dateSelected, DistanceTotal]);
      const kmHistoId = await travelService.createKm(payload);

      if (kmHistoId) {
        await devilocaService.updateCalcKm(deviceId, delonuid, lastDelonuid);
        const rowsUpdates = await devilocaService.getRowsUpdate(deviceId, delonuid, lastDelonuid);
        const result = rowsUpdates.map(obj => ({ dehideloca: obj.delonuid, dehikmcalc: kmHistoId.dataValues.kmid }));
        await dehiskmService.createHistKm(result);
      }
    }

    if (travelsCalculatesOld.length > 0) {
      DistanceOld = travelsCalculatesOld.reduce((total, obj) => total + obj.kmcapt, 0);
    }

    DistanceTotal += DistanceOld;
    DistanceTotal = Math.ceil(DistanceTotal);
    if (res) {
      res.status(200).json({
        response: DistanceTotal
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error
    });
  }
}

const getTravelTemp = async (req, res) => {
  try {
    const { deviceId, dateInit, dateFinal } = req.params;
    const travels = await travelService.getTravelTemp(deviceId, dateInit, dateFinal);

    let DistanceTotal = 0;

    if (travels.length > 0) {
      for (let i = 0; i < travels.length - 1; i++) {
        const punto1 = travels[i];
        const punto2 = travels[i + 1];
        DistanceTotal += haversineDistance(
          punto1.delolati,
          punto1.delolong,
          punto2.delolati,
          punto2.delolong
        );
      }
    }
    DistanceTotal = Math.ceil(DistanceTotal);
    res.status(200).json({
      response: DistanceTotal
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error
    });
  }
}

/* function splitArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
} */

const kmMapping = (data) => {
  const payload = {
    kmdevice: data[0],
    kmdeloini: data[1],
    kmdelofin: data[2],
    kmdiacapt: `${data[3]}`,
    kmcapt: data[4],
  }
  return payload
}

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
}

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
}

const workCalculateAllDevices = async (req, res) => {
  const fechaActual = new Date();
  const anio = fechaActual.getFullYear();
  const mes = fechaActual.getMonth() + 1; // Los meses van de 0 a 11, por lo que se suma 1
  const dia = fechaActual.getDate()-1;

  // Formatear la cadena de la fecha
  const fechaFormateada = `${anio}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

  const devices = await deviceService.getDevices(1);
  const datosDevice = devices.rows.map(objeto => objeto.dataValues);
  for (let index = 0; index < datosDevice.length; index++) {
    const e = datosDevice[index];
    getTravel({
      params: {
        deviceId: e.devinuid, dateSelected: fechaFormateada
      }
    });
  }
  res.status(400).json({
    devices
  });
}



module.exports = {
  getTravel,
  getTravelTemp,
  workCalculateAllDevices
}