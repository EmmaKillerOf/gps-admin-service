const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const { createClassifier, getClassifiers, updateClassifier, createChildClassifier, updateChildClassifier, getChildClassifiers } = require('../controllers/classifier.controller')



// ===============================
//CARRIER
// ===============================

app.get('/entity/:entityId', verificaToken, getClassifiers);

app.get('/:classifierId/getChildClassifiers', verificaToken, getChildClassifiers);

app.post('/entity/:entityId', verificaToken, createClassifier);

app.post('/createChild', verificaToken, createChildClassifier);

app.patch('/:classifierId', verificaToken, updateClassifier);

app.patch('/updateChild/:classifierId', verificaToken, updateChildClassifier);

module.exports = app;