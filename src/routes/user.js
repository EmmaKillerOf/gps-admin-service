const express = require('express');
const bcrypt = require('bcrypt');
const { verificaToken, validateSchema } = require('../middlewares/autenticacion');
const _ = require('underscore');
const app = express();
const { getUser, createUser, updateUser, deleteUser } = require('../controllers/user')
const {CreateUserSchema, UpdateUserSchema} = require('../schemas/user.schema')


// ===============================
//ENTITY
// ===============================
app.get('/', verificaToken, getUser);

app.post('/entity/:entityId', verificaToken, createUser);

app.patch('/:userId/entity/:entityId', [verificaToken, validateSchema(UpdateUserSchema)], updateUser);

app.delete('/:userId/entity/:entityId', verificaToken, deleteUser);

module.exports = app;