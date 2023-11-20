const Joi = require('joi');

const GetLocationsSchema = Joi.object({
  body: Joi.object({
    classifiers: Joi.array().items(Joi.number()), 
    plate: Joi.string(),
    deviceIds: Joi.array().items(Joi.number()),
    isAlarm: Joi.boolean(),
    isLocation: Joi.boolean(),
    isEvent: Joi.boolean(),
    date: Joi.object({
      startDate: Joi.string().optional(),
      endDate: Joi.string().optional(),
    }),
    typeReport: Joi.number().required(),
  }),
  params: Joi.object({
    entityId:Joi.number().required(),
  }),
  query: Joi.optional()
});

module.exports = {
  GetLocationsSchema
}
