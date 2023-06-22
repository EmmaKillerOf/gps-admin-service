const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const { getTravel } = require('../controllers/travel.controller')



// ===============================
//ENTITY
// ===============================

app.get('/:vehicleId', verificaToken, getTravel);

/* app.post('/', verificaToken, createEntity);

app.patch('/:entityId', verificaToken, updateEntity);

app.delete('/:entityId', verificaToken, deactiveEntity);
 */





module.exports = app;