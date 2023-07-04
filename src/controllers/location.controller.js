
const devilocaService = require('../services/deviloca.service');
const deviconeService = require('../services/devicone.service');
const devialarmService = require('../services/devialar.service');
const keywordService = require('../services/keyword.service');
const carrierService = require('../services/carrier.service');
const deviceService = require('../services/device.service');
const entityService = require('../services/entity.service')
const classvalueService = require('../services/classvalue.service');
const { ConexionTypeEnum } = require('../constants/enums');
const { getLocationPoint } = require('../helpers/helpers')
const { date } = require('joi');
const config = require('../config/environment')
const { Sequelize } = require('sequelize');
const moment = require('moment');
const raw = new Sequelize(config.DB.database, config.DB.username, config.DB.password, {
  host: config.DB.host,
  dialect: config.DB.dialect
})

const createLocation = async(req, res) => {
  try {
    let body = req.body;
    let payload = {};
    const { connectionType, imei } = req.query;

    
    const device = await deviceService.getDevice({
      deviimei: imei,
      devistat: 1
    }) 
    if(!device) throw "Dispositivo no existe";
    body.push(device.devinuid);
      switch (connectionType) {
        case ConexionTypeEnum.Conexion:
          payload = deviconeMapping(body);
          await deviconeService.createConexion(payload);
          break;
        case ConexionTypeEnum.Alarm:
          payload = await alarmMapping(body)
          await devialarmService.createAlarm(payload);
          break;  
        case ConexionTypeEnum.Location:
          payload =  locationMapping(body);
          await devilocaService.createLocation(payload);
          break;   
      
        default:
          break;
      }

      res.status(200).json({
        ok: true,
        response: {}
    }) 
    
  } catch (error) {
    console.log(error)
      res.status(400).json({
          error
      }) 
    
  }
}

const getDevicePositions = async(req, res) => {
  try {
    const userId = req.uid;
    const { entityId } = req.params;
    const entityUser = await entityService.getEntityUser({entienus: entityId, userenus: userId})
    if(!entityUser) throw "Usuario no autorizado en esta entidad";

    const {classifiers, plate, deviceIds = [], isAlarm, date} = req.body; 
    const devices = [];
    const hasDate = date ? {startDate, endDate} = date : {};
    const classifiersDevice = (await getDevicesByClassifier(classifiers)).map(device => device.deviclde)
    devices.push(...deviceIds, ...classifiersDevice);
    const hasDevices = devices.length ? { devices: [ ...new Set(devices) ] } : {}
    const payload = {
      ...hasDate,
      ...hasDevices,
      plate,
    }
    let locations;

    if(!isAlarm){
      locations = await deviceService.getDeviceLocation(payload)
    }else {
      locations = await deviceService.getDeviceAlerts(payload)
    }
    
    globalResponse({resInstance: res, response: locations})

    // res.status(200).json({
    //   ok: true,
    //   response: locations
    // }) 
   
  } catch (error) {
    console.log(error)
      res.status(400).json({
          error
      }) 
    
  }
  
}

const globalResponse = async ({resInstance ,status = 200, response, hasError = false}) => {
  const payload = !hasError ? 
    {
      ok: true,
      response
    }:
    {
      error: response
    }
  resInstance.status(status).json({
    ...payload
  }) 
}

const getLocationByCarrier = async ({carrier, startDate, endDate, entityId}) => {
  const device = await deviceService.getDeviceByCarrier(entityId, carrier ) 
  console.log(device.devinuid)
  return await deviceService.getDeviceLocation({devices: [device.devinuid], startDate, endDate})
}


const getDevicesByClassifier = async(classifiers) => {
  const devices = [];
  const countClassifiers = classifiers.length;
  if(countClassifiers > 0 && classifiers[0] != -1){
    const select = 'SELECT distinct C1.deviclde';
    let from = '',
        where = '',
        join = '';
        console.log(countClassifiers)
    classifiers.map((classifier,index) => {
      from+=`clasdevi AS C${index + 1}${(index + 1) < countClassifiers ? ',' : ''}`;
      where+= `C${index + 1}.clvaclde IN (${classifier.toString()})${(index + 1) < countClassifiers ? ' AND ' : ''}`;
      if(index + 2 <= countClassifiers)
        join+= `C1.deviclde = C${index +2}.deviclde ${(index + 2) < countClassifiers ? ' AND ' : ''}`
    })
      
    const clasifierQuery = `${select} from ${from} where ${where} ${countClassifiers > 1 ? 'AND' : ''} ${join}`
    const [result, metadata] = await raw.query(clasifierQuery);
    devices.push(...result);
  }
  return devices;
}


const locationMapping = (data) => {
  //** Example data */
  // data: [
    // "imei:868166051431047", "001",
    // "230319062456",         "",
    // "F",                    "112456.000",
    // "A",                    "0838.07803",
    // "N",                    "07350.64243",
    // "W",                    "37.28",
    // "343.54",               "",
    // "1",                    "1",
    // "0.00%",                ""
  // ]
  const last = data[data.length -1];
  const payload = {
    devidelo: last,
    /* delofesi: new Date().toISOString().slice(0, 19).replace('T', ' '), */
    delokeyw: data[1] === 'tracker' ? '001' : data[1],
    delotinu: getDatefromTime(data[2]),
    delotime: data[2],
    delosimc: data[3],
    delosign: data[4],
    delohour: data[5],
    delosigc: data[6],
    delolati: getLocationPoint(data[7],data[8]),
    delolaor: data[8],
    delolong: getLocationPoint(data[9],data[10]),
    deloloor: data[10],
    delospee: calcSpeed(data[11]),
    delodat1: data[12],
    delodat2: data[13],
    deloacc: data[14],
    delodoor: data[15],
    delodat3: data[16],
    delodat4: data[17],
    delodat5: data[18],
    delocalcu: false,
    delotinude: getDatefromTimeAndHours(data[2]),
  }
  return payload
}

const alarmMapping = async (data) => {
  //** Example data */
  //   [
  //     "imei:787878", "help me",
  //     "1208080907",  "",
  //     "F",           "120721.000",
  //     "A",           "3123.1244",
  //     "S",           "06409.8181",
  //     "W",           "100.00",
  //     "0"
  // ]
  const last = data[data.length -1];
  const getKeyword = async () => {
    const key = await keywordService.getKeyword({keywcodi: data[1]})
    return key ? key.keywnuid : null
  }

  return {
    devideal: last,
    keywdeal: await getKeyword(),
    /* dealfesi: new Date().toISOString().slice(0, 19).replace('T', ' '), */
    dealstat: true,
    dealtinu:getDatefromTime(data[2]),
    dealtime: data[2],
    dealsign: data[4],
    dealhour: data[5],
    deallati: getLocationPoint(data[7],data[8]),
    deallaor: data[8],
    deallong: getLocationPoint(data[9],data[10]),
    dealloor: data[10],
    dealspee: calcSpeed(data[11]),
    delotinude: getDatefromTimeAndHours(data[2])
  }
}

const deviconeMapping = (data) => {
  //** Example data */
  // [ "##", "imei:787878", "A" ]
  const last = data[data.length -1];
  return {
    devideco: last,
    decodesc: 'New connection',
  }
}

const getDatefromTime = (dateTime) => {
  const time = dateTime;
  const year = time.substring(0,2);
  const month = time.substring(2,4);
  const day = time.substring(4,6);
  const getCetury = (new Date().getFullYear()).toString().substring(0,2);
  return (new Date(`${getCetury}${year}-${month}-${day}`).toISOString().split('T')[0]).toString();
}

const getDatefromTimeAndHours = (dateTime) => {
  const time = dateTime;
  const year = time.substring(0, 2);
  const month = time.substring(2, 4);
  const day = time.substring(4, 6);
  const hour = time.substring(6, 8);
  const minutes = time.substring(8, 10);
  const seconds = time.substring(10, 12);
  const getCetury = (new Date().getFullYear()).toString().substring(0,2);
  const dateStr = `${getCetury}${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
  const date = moment.utc(dateStr).utcOffset('-05:00', true);
  return date.toISOString();
}

const calcSpeed = (speed) => {
  console.log(speed)
  return speed > 0 ? parseInt(speed, 10) * 1.85 : 0
};

module.exports = {
  createLocation,
  getDevicePositions
}