
const travelService = require('../services/travel.service')

const getTravel = async (req, res) => {
    try {
        const { vehicleId } = req.params
        const travels = await travelService.getTravel();
        let arrDivisions = splitArray(travels, 90);
        let latOrigin = 0; let lonOrigin = 0;
        let latDest = 0; let lonDest = 0;

        for (let index = 0; index < arrDivisions.length; index++) {
            const e = arrDivisions[index];
            if (index == 0) latOrigin = e[0].delolati, lonOrigin = e[0].delolong;
            if (index != 0) {
                latOrigin = latDest;
                lonOrigin = lonDest;
            }
            latDest = e[e.length - 1].delolati;
            lonDest = e[e.length - 1].delolong;
            console.log(latOrigin, lonOrigin, latDest, lonDest);
        }
        
        res.status(200).json({
            response: arrDivisions
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

module.exports = {
    getTravel
}