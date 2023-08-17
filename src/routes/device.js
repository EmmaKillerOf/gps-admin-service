const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const { getDevices, createDevice, updateDevice, deleteDevice, unlinkDevice } = require('../controllers/device.controller');
const { sendCommand, sendCommandMultiple, getCommandsAvailable } = require('../controllers/command.controller')



// ===============================
//DEVICE
// ===============================

app.get('/entity/:entityId', verificaToken, getDevices);

app.post('/entity/:entityId', verificaToken, createDevice);

app.get('/command/available', verificaToken, getCommandsAvailable);

app.post('/send/command/multiple', verificaToken, sendCommandMultiple);

/* app.post('/command', verificaToken, sendCommand); */

app.patch('/:deviceId', verificaToken, updateDevice);

app.delete('/:deviceId', verificaToken, deleteDevice);

app.delete('/unlink/:deviceId', verificaToken, unlinkDevice);






module.exports = app;