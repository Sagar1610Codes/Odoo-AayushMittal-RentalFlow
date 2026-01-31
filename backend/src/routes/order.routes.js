const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post(
  '/',
  authorize('CUSTOMER'),
  orderController.createOrder
);

router.get('/', orderController.getOrders);

router.get('/:id', orderController.getOrderById);

router.delete('/:id', orderController.cancelOrder);

module.exports = router;
