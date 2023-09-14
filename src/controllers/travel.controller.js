
const travelService = require('../services/travel.service')
const devilocaService = require('../services/deviloca.service');
const deviceService = require('../services/device.service');
const dehiskmService = require('../services/dehiskm.service');
const entityService = require('../services/entity.service');
const moment = require('moment-timezone');

const getTravel = async (req, res) => {
  try {
    const { deviceId, dateSelected, device } = req.params;
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

      const payload = kmMapping([deviceId, delonuid, lastDelonuid, dateSelected, DistanceTotal, calculateConsum(DistanceTotal, device.carrdevi.carrier.carrrendi)]);
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
  }
}

function calculateConsum(distance, rend, captanque) {
  if (rend <= 0) {
    return 0; // Prevent division by zero
  }

  const consum = distance / rend;

  return consum;
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

const getKmTravelTempRoute = async (req, res) => {
  try {
    const { deviceId, dateInit, dateFinal } = req.params
    const minutesStart = hasTimeIncluded(dateInit, 'start');
    const minutesEnd = hasTimeIncluded(dateFinal, 'end');
    const result = await getTimes(deviceId, dateInit + minutesStart, dateFinal + minutesEnd);
    res.status(200).json({
      response: result
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error
    });
  }
}

const getTimes = async (deviceId, dateInit, dateFinal) => {
  try {
    const times = await travelService.getTravelTimes(deviceId, dateInit, dateFinal);
    const filterOperation = times.filter(item => item.keywdeal === 18 || item.keywdeal === 19);
    const filterRalenti = times.filter(item => item.keywdeal === 22 || item.keywdeal === 23);
    const timeOperation = calculateTime(filterOperation, 18, 19);
    const timeRalenti = calculateTime(filterRalenti, 22, 23);
    const timeMovement = timeMovementsByDay(timeOperation, timeRalenti);
    return { timeOperation, timeRalenti, timeMovement };
  } catch (error) {
    console.log(error);
  }
}

function reorganizeDates(obj) {
  const reorganizedObj = {};
  for (const date in obj) {
    if (obj.hasOwnProperty(date)) {
      const dateObj = obj[date];
      dateObj.date = date;
      reorganizedObj[date] = dateObj;
    }
  }
  return Object.values(reorganizedObj);
}

function calculateTime(times, codeIni, codeFin) {
  const durationPerDay = {};
  let startTime = null;
  let currentDate = null;
  times.forEach(item => {
    if (item.keywdeal === codeIni) {
      startTime = moment.tz(item.delotinude, 'America/Bogota'); // 'America/Bogota' is the time zone for Colombia
      currentDate = startTime.format('YYYY-MM-DD'); // Get the date in the desired format
    } else if (item.keywdeal === codeFin && startTime !== null) {
      const endTime = moment.tz(item.delotinude, 'America/Bogota');
      const timeDifference = endTime - startTime;
      if (!durationPerDay[currentDate]) {
        durationPerDay[currentDate] = 0;
      }
      durationPerDay[currentDate] += timeDifference;
      startTime = null;
      currentDate = null;
    }
  });

  // Format the duration per day in the desired format
  const results = {};
  for (const date in durationPerDay) {
    if (durationPerDay.hasOwnProperty(date)) {
      const totalMilliseconds = durationPerDay[date];
      const formattedDuration = convertMilliseconds(totalMilliseconds);
      results[date] = formattedDuration;
    }
  }
  return reorganizeDates(results);
}

function convertMilliseconds(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return {
    hours: hours,
    minutes: remainingMinutes,
    seconds: remainingSeconds
  };
}

function timeMovementsByDay(time1, time2) {
  const result = {};

  // Obtén todas las fechas disponibles en ambos objetos
  const dates = [...new Set([...time1.map(item => item.date), ...time2.map(item => item.date)])];

  for (const date of dates) {
    const time1Obj = time1.find(item => item.date === date) || { hours: 0, minutes: 0, seconds: 0 };
    const time2Obj = time2.find(item => item.date === date) || { hours: 0, minutes: 0, seconds: 0 };

    const hours1 = time1Obj.hours;
    const minutes1 = time1Obj.minutes;
    const seconds1 = time1Obj.seconds;

    const hours2 = time2Obj.hours;
    const minutes2 = time2Obj.minutes;
    const seconds2 = time2Obj.seconds;

    let totalSecondsDifference = (hours1 * 3600 + minutes1 * 60 + seconds1) - (hours2 * 3600 + minutes2 * 60 + seconds2);

    if (totalSecondsDifference < 0) {
      totalSecondsDifference += 86400; // 86400 segundos en un día (24 horas)
    }

    const hours = Math.floor(totalSecondsDifference / 3600);
    const minutes = Math.floor((totalSecondsDifference % 3600) / 60);
    const seconds = totalSecondsDifference % 60;

    result[date] = {
      date,
      hours,
      minutes,
      seconds,
    };
  }

  return Object.values(result);
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
    kmconsu: data[5]
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
    try {
      const devices = await deviceService.getDevices(element.entinuid);
      const datosDevice = devices.rows.map(objeto => objeto.dataValues);
      for (let j = 0; j < datosDevice.length; j++) {
        const e = datosDevice[j];
        getTravel({
          params: {
            deviceId: e.devinuid, dateSelected: fechaFormateada, device: e
          }
        });
      }
    } catch (error) {
      console.log(error);
    }


  }
}



module.exports = {
  getTravel,
  getKmTravelTemp,
  workCalculateAllDevices,
  getTravelMonthly,
  getKmTravelTempRoute,
  getTimes
}