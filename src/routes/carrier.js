const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const { createCarrier, getCarriers, updateCarrier, deleteCarrier } = require('../controllers/carrier.controller')



// ===============================
//CARRIER
// ===============================

app.get('/entity/:entityId', verificaToken, getCarriers);

app.post('/entity/:entityId', verificaToken, createCarrier);

app.patch('/:carrierId', verificaToken, updateCarrier);

app.delete('/:carrierId', verificaToken, deleteCarrier);

module.exports = app;