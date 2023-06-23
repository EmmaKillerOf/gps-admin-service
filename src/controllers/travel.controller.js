
const travelService = require('../services/travel.service')
const devilocaService = require('../services/deviloca.service');

const getTravel = async (req, res) => {
    try {
        const { deviceId, dateSelected } = req.params
        const travelsCalculatesOld = await travelService.getKmsCalculates(deviceId, dateSelected);
        const travels = await travelService.getTravel(deviceId, dateSelected);
        let DistanceTotal = 0, DistanceOld = 0;
        if (travels.length > 0) {
            let latOrigin = 0; let lonOrigin = 0;
            let latDest = 0; let lonDest = 0;
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
            payload = kmMapping([deviceId, travels[0].delonuid, travels[travels.length - 1].delonuid, dateSelected, DistanceTotal]);
            await travelService.createKm(payload);
            await devilocaService.updateCalcKm(deviceId, travels[0].delonuid, travels[travels.length - 1].delonuid);
        }
        if (travelsCalculatesOld.length > 0) {
            DistanceOld = travelsCalculatesOld.reduce((total, obj) => total + obj.kmcapt, 0);
        }
        DistanceTotal += DistanceOld;
        res.status(200).json({
            response: DistanceTotal
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        })
    }
}

function splitArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}

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

function haversineDistance(lat1, lon1, lat2, lon2) {
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
  
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

module.exports = {
    getTravel
}