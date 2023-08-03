const { execcomma } = require('../models');
const redis = require('../lib/redis');
const commandService = require('../services/command.service')
const commandController = require('../controllers/command.controller')

async function sendCommands(listName) {
    try {
        async function executeQuery() {
            await redis.deleteList(listName);
            const commands = await execcomma.findAll({
                where: { execacti: 0 },
                raw: true,
                nest: true,
            });
            commands.forEach(async e => {
                const info = await commandService.getInfoCommand(e);
                const arrCommandsRedis = commandController.setParams(info[0], info[1], e, 'REDIS');
                commandController.sendCommandRedis(arrCommandsRedis);
            });
        }
        const intervalTime = 60000;
        setInterval(executeQuery, intervalTime);

        await executeQuery();
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    sendCommands: sendCommands
}
