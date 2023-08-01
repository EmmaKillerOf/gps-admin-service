const { execcomma } = require('../models');
const { replaceList } = require('../lib/redis');

async function sendCommands(listName) {
    try {
        const commands = await execcomma.findAll({
            where: { execacti: 1 },
            include: [{ model: device, as: 'device' }],
            raw: true,
            nest: true,
        });
        /* replaceList(commands, listName); */
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    sendCommands: sendCommands
}
