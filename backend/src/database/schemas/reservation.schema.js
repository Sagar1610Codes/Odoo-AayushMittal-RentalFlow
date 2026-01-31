const Joi = require('joi');

const checkAvailabilitySchema = Joi.object({
  variantId: Joi.number().integer().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  quantity: Joi.number().integer().min(1).required()
});

const createReservationSchema = Joi.object({
  orderId: Joi.number().integer().required(),
  items: Joi.array().items(
    Joi.object({
      variantId: Joi.number().integer().required(),
      startDate: Joi.string().isoDate().required(),
      endDate: Joi.string().isoDate().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required()
});

module.exports = {
  checkAvailabilitySchema,
  createReservationSchema
};
