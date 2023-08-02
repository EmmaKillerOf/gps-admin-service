const { device, entity, paramstandar, entityDevice } = require('../models');
const { replaceList } = require('../lib/redis');
let dataSQLParams, dataSQLDevices;

async function sendDevices(listName) {
    try {
        const devices = await device.findAll({
            where: {
                devistat: 1,
            },
            raw: true,
            nest: true,
        });

        const params = await paramstandar.findAll({
            where: {
                paratypecoma: 1,
                parastat: 1,
            },
            order: [['paranuid', "ASC"]],
            raw: true,
            nest: true,
        });

        const devicesWithParams = devices.map((device) => {
            const deviceParams = params.filter((param) => param.entipara === device.entidevi);
            return {
                ...device,
                params: deviceParams,
            };
        });
        replaceList(devicesWithParams, listName);
    } catch (error) {
        console.log(error)
    }
}

setInterval(async () => {
    const newData = await paramstandar.findAll({
        where: {
            paratypecoma: 1,
            parastat: 1,
        }
    });
    const newDataDevi = await device.findAll({
        where: {
            devistat: 1,
        }
    });
    if (JSON.stringify(newData) !== JSON.stringify(dataSQLParams) || JSON.stringify(newDataDevi) !== JSON.stringify(dataSQLDevices)) {
        sendDevices('listDevices');
    }
    dataSQLParams = newData;
    dataSQLDevices = newDataDevi;
}, 5000);



module.exports = {
    sendDevices: sendDevices
}
