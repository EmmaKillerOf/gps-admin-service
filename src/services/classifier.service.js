const { classifiers, classvalue } = require('../models');
const { Op } = require("sequelize");

const getClassifiers = async (entityId) => {
  const classifiersResult = await classifiers.findAndCountAll({
    where: {
      enticlas: entityId,
    },
    order:[
      ['clasnuid', 'DESC']
    ],
    include: {
      model: classvalue,
      as: 'classvalue',
    },
    raw : false ,
    nest : true
  })
  return classifiersResult
}

const getClassifier = async (query) => {
  const classifier = await classifiers.findOne({
    where: {
      ...query
    }
  })
  return classifier
}

const createClassifier = async (payload) => {
  const classifier = await classifiers.create({...payload})
  return classifier
}


const updateClassifier = async (classifierId, payload) => {
  await classifiers.update(
    {...payload},
    {
      where: {
        clasnuid: classifierId
      }
    }
  )
  const classifier = await classifiers.findOne(
    { 
      where: { 
        clasnuid: classifierId
      },
      raw : false,
    }
  )
  return classifier
}


const createChildClassifier = async (payload) => {
  const classifier = await classvalue.create({...payload})
  return classifier
}

const getChildClassifiers = async (query) => {
  const classifier = await classvalue.findAll({
    where: {
      ...query
    },
    raw : false,
  })
  return classifier
}

const getChildClassifier = async (query) => {
  const classifier = await classvalue.findOne({
    where: {
      ...query
    },
    raw : false,
  });
  return classifier
}

const updateChildClassifier = async (classifierId, payload) => {
  const classifier = await classvalue.update(
    {...payload},
    {
      where: {
        clvanuid: classifierId
      }
    },
  )
  return await classvalue.findOne({ where: { clvanuid: classifierId }, raw : false,})
}


module.exports = {
  getClassifiers,
  getClassifier,
  createClassifier,
  updateClassifier,
  createChildClassifier,
  getChildClassifier,
  updateChildClassifier,
  getChildClassifiers
}