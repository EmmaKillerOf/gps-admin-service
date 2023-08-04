const { device, entity, paramstandar, entityDevice, stepscommand } = require('../models');
const commandService = require('../services/command.service')
const commandController = require('../controllers/command.controller')
const { replaceList } = require('../lib/redis');
const { Op, Sequelize } = require("sequelize");
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
        if (dataSQLParams) {
            let differences = newData.filter((item) => {
                return !dataSQLParams.find((arrayItem) => JSON.stringify(item) === JSON.stringify(arrayItem));
            });
            console.log(JSON.stringify(newData));
            console.log(JSON.stringify(dataSQLParams));
            console.log(differences);
            if (differences.length > 0) {
                const stepsBD = await stepscommand.findAll({ raw: true });
                const groupedArray = getUniqueByEntipara(differences);
                const entiparaValues = groupedArray.map(item => item.entipara);
                let devices = await device.findAll({
                    where: {
                        entidevi:
                        {
                            [Op.in]: entiparaValues
                        }
                    },
                    raw: true
                });
                differences.forEach(e => {
                    const getKey = stepsBD.find(x => x.stepkey == parseInt(e.paracodi));
                    if (getKey) {
                        e.command = getKey.stepid;
                        devices.forEach(x => {
                            if (x.entidevi == e.entipara) {
                                x.change = e;
                            }
                        });
                    }
                });
                const devicesToChange = devices.filter((obj) => 'change' in obj);
                devicesToChange.forEach(async e => {
                    const customCommandSQL = setParamsSQL(0, e.change.command, e.devinuid, e.change.paravalu);
                    const customCommandREDIS = setParamsRedis(e.deviimei, e.change.paracodi, e.change.paravalu);
                    await commandService.sendCommand(customCommandSQL);
                    commandController.sendCommandRedis(customCommandREDIS);
                });
                differences = [];
                dataSQLParams = newData;
                dataSQLDevices = newDataDevi;
            }

            /* console.log(differences); */
        }
    }
    dataSQLParams = newData;
    dataSQLDevices = newDataDevi;
}, 5000);

function getUniqueByEntipara(array) {
    const groupedByEntipara = array.reduce((acc, curr) => {
        const key = curr.entipara;
        if (!acc[key]) {
            acc[key] = curr;
        }
        return acc;
    }, {});

    return Object.values(groupedByEntipara);
}

function setParamsSQL(execusercrea, stepexec, deviexec, execparam) {
    return [{
        execusercrea: execusercrea,
        stepexec: stepexec,
        deviexec: deviexec,
        execparam: execparam,
        execacti: 0
    }]
}

function setParamsRedis(imei, key, param) {
    return [{
        imei: imei,
        command: key,
        execparam: param
    }]
}



module.exports = {
    sendDevices: sendDevices
}
