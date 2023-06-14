const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const { createEntity, getEntities, updateEntity, deactiveEntity } = require('../controllers/entity.controller')



// ===============================
//ENTITY
// ===============================

app.get('/', verificaToken, getEntities);

app.post('/', verificaToken, createEntity);

app.patch('/:entityId', verificaToken, updateEntity);

app.delete('/:entityId', verificaToken, deactiveEntity);






module.exports = app;