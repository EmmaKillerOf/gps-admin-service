
const commandService = require('../services/command.service')
const { pushToList, getList } = require('../lib/redis');

const getCommandsAvailable = async (req, res) => {
    try {
        const results = await commandService.getCommandsAvailable();
        return res.status(200).json(results)
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        })
    }
}

const sendCommand = async (body, req) => {
    try {
        const validate = await commandService.getExistCommand(body);
        if (validate) return false
        const info = await commandService.getInfoCommand(body);
        const arrCommandsSQL = setParams(info[0], [], body, 'SQL', req);
        const arrCommandsRedis = setParams(info[0], info[1], body, 'REDIS', req);
        await commandService.sendCommand(arrCommandsSQL);
        sendCommandRedis(arrCommandsRedis);
        return true
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        })
    }
}

const sendCommandMultiple = async (req, res) => {
    try {
        const { body } = req;
        for (const e of body) {
            let result = await sendCommand(e, req);
            e.result = result ? true : false;
        }
        return res.status(200).json(body);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error
        });
    }
};

const setParams = (rows, imei, payload, use, req) => {
    switch (use) {
        case 'SQL':
            return rows.map(e => ({
                execusercrea: req.uid,
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
        commands.forEach(async e => {
            await pushToList(e, 'listCommands');
        });
    })
        .catch(error => {
            console.error('Error retrieving list:', error);
        });
};



module.exports = {
    sendCommand,
    setParams,
    sendCommandRedis,
    getCommandsAvailable,
    sendCommandMultiple
}