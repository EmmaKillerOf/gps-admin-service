
const travelService = require('../services/travel.service')
const devilocaService = require('../services/deviloca.service');

const getTravel = async (req, res) => {
    try {
        const { deviceId, dateSelected } = req.params
        const travelsCalculatesOld = await travelService.getKmsCalculates(deviceId, dateSelected);
        const travels = await travelService.getTravel(deviceId, dateSelected);
        let DistanceCalculate = 0; let DistanceTotal = 0;
        if (travels.length > 0) {
            let latOrigin = 0; let lonOrigin = 0;
            let latDest = 0; let lonDest = 0;
            let arrDivisions = splitArray(travels, 23);
            for (let index = 0; index < arrDivisions.length; index++) {
                const e = arrDivisions[index];
                const convertWayPoint = e.map(({ delolati, delolong }) => `${delolati},${delolong}`).join('|');
                if (index == 0) latOrigin = e[0].delolati, lonOrigin = e[0].delolong;
                if (index != 0) {
                    latOrigin = latDest;
                    lonOrigin = lonDest;
                }
                latDest = e[e.length - 1].delolati;
                lonDest = e[e.length - 1].delolong;
                const kms = await travelService.getKmsTravel(latOrigin, lonOrigin, latDest, lonDest, convertWayPoint);
                const routes = kms.data.routes;
                if (routes.length > 0) {
                    const legs = routes[0].legs;
                    for (let i = 0; i < legs.length - 1; i++) {
                        DistanceCalculate += legs[i].distance.value;
                    }
                }
            }
            payload = kmMapping([deviceId, travels[0].delonuid, travels[travels.length - 1].delonuid, dateSelected, DistanceCalculate]);
            await travelService.createKm(payload);
            await devilocaService.updateCalcKm(deviceId, travels[0].delonuid, travels[travels.length - 1].delonuid);
        }
        if (travelsCalculatesOld.length > 0) {
            DistanceTotal = travelsCalculatesOld.reduce((total, obj) => total + obj.kmcapt, 0);
        }
        DistanceTotal += DistanceCalculate;
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

module.exports = {
    getTravel
}