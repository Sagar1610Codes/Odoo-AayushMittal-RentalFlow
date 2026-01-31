const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/availability', reservationController.checkAvailability);

router.post(
  '/',
  authenticate,
  authorize('CUSTOMER'),
  reservationController.createReservation
);

router.get(
  '/',
  authenticate,
  reservationController.getReservations
);

router.get(
  '/:id',
  authenticate,
  reservationController.getReservationById
);

router.delete(
  '/:id',
  authenticate,
  reservationController.cancelReservation
);

module.exports = router;
