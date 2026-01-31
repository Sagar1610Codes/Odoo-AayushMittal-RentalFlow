const OrderService = require('../services/order.service');
const { ApiError } = require('../utils/errors');
const Joi = require('joi');

const createOrderSchema = Joi.object({
  items: Joi.array().min(1).items(
    Joi.object({
      variantId: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
    })
  ).required()
});

const createOrder = async (req, res, next) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    
    if (error) {
      throw new ApiError(error.details[0].message, 400);
    }

    const result = await OrderService.createOrder(req.user.id, value);
    
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status
    };

    const result = await OrderService.getCustomerOrders(req.user.id, filters);
    
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await OrderService.getOrderById(
      parseInt(id),
      req.user.id,
      req.user.role
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await OrderService.cancelOrder(
      parseInt(id),
      req.user.id,
      req.user.role
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder
};
