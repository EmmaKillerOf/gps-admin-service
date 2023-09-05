const Joi = require('joi');

const CreateUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required('Campo nombre es requerido'), 
    email: Joi.string().email().required('Campo email es requerido'), 
    privileges: Joi.array().items(Joi.string())
  }),
  params: Joi.object({
    entityId:Joi.number().required(),
  }),
  query: Joi.optional()
})

const UpdateUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().optional(),
    privileges: Joi.array().items(Joi.string()),
    email:Joi.string().email().required(),
    deviceSelected: Joi.array().required()
  }),
  params: Joi.object({
    userId:Joi.number().required(),
    entityId:Joi.number().required(),
  }),
  query: Joi.optional()
})

module.exports = {
  CreateUserSchema,
  UpdateUserSchema
}