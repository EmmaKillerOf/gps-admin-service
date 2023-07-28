const { device } = require('../models');
const { replaceList } = require('../lib/redis');

async function sendDevices (listName) {
    try {
        const devices = await device.findAll({
            devistat: 1
        });
        replaceList(devices, listName);
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    sendDevices
}
