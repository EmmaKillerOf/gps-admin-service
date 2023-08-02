
const commandService = require('../services/command.service')
const { pushToList, getList } = require('../lib/redis');
const sendCommand = async (req, res) => {
    try {
        const { body } = req;
        const validate = await commandService.getExistCommand(body);
        if (validate) return res.status(400).json({
            response: 'Este comando ya fue enviado, espere a su ejecución para el próximo envío.'
        })
        const info = await commandService.getInfoCommand(body);
        const arrCommandsSQL = setParams(info[0], [], body, 'SQL');
        const arrCommandsRedis = setParams(info[0], info[1], body, 'REDIS');
        await commandService.sendCommand(arrCommandsSQL);
        sendCommandRedis(arrCommandsRedis);
        return res.status(200).json({
            response: "Comando enviado correctamente"
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        })
    }
}

const setParams = (rows, imei, payload, use) => {
    switch (use) {
        case 'SQL':
            return rows.map(e => ({
                stepexec: e.stepid,
                deviexec: payload.deviexec,
                execparam: e.stepid === payload.stepexec && e.stepparam == 1 ? payload.execparam : null,
                execacti: false,
            }));
        case 'REDIS':
            return rows.map(e => ({
                imei: imei.deviimei,
                command: e.stepkey,
                execparam: e.stepid === payload.stepexec && e.stepparam == 1 ? payload.execparam : null,
            }));
    }

};

const sendCommandRedis = (commands) => {
    getList('listCommands').then(async dataRedis => {
        console.log(dataRedis);
        commands.forEach(async e => {
            await pushToList(e, 'listCommands');
        });
    })
        .catch(error => {
            console.error('Error retrieving list:', error);
        });
};



module.exports = {
    sendCommand
}