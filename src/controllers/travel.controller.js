
const travelService = require('../services/travel.service')
const devilocaService = require('../services/deviloca.service');
const deviceService = require('../services/device.service');
const dehiskmService = require('../services/dehiskm.service');
const entityService = require('../services/entity.service');

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

const getTravelMonthly = async (req, res) => {
  try {
    const { deviceIds, month, year } = req.body;
    const travelsCalculates = await travelService.getTravelMonthly(deviceIds, month, year);
    return res.status(200).json({
      response: travelsCalculates
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error
    });
  }
}

const getKmTravelTemp = async (deviceId, dateInit, dateFinal) => {
  try {
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
    return DistanceTotal;
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error
    });
  }
}

const hasTimeIncluded = (dateString, origin) => {
  let minutes = '';
  if (dateString.length == 10) {
    switch (origin) {
      case 'start':
        minutes = ' 00:00:00';
        break;
      case 'end':
        minutes = ' 23:59:59';
        break;
    }
  }
  return minutes;
}

const getDateActually = () => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  return formattedDate;
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
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  const anio = currentDate.getFullYear();
  const mes = currentDate.getMonth() + 1;
  const dia = currentDate.getDate();
  // Formatear la cadena de la fecha
  const fechaFormateada = `${anio}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
  const entities = await entityService.getEntities();
  for (let i = 0; i < entities.rows.length; i++) {
    const element = entities.rows[i];
    const devices = await deviceService.getDevices(element.entinuid);
    const datosDevice = devices.rows.map(objeto => objeto.dataValues);
    for (let j = 0; j < datosDevice.length; j++) {
      const e = datosDevice[j];
      getTravel({
        params: {
          deviceId: e.devinuid, dateSelected: fechaFormateada
        }
      });
    }
  }
}



module.exports = {
  getTravel,
  getKmTravelTemp,
  workCalculateAllDevices,
  getTravelMonthly
}