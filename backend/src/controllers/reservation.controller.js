const reservationService = require('../services/reservation.service');
const { ApiError } = require('../utils/errors');

const checkAvailability = async (req, res, next) => {
  try {
    const { variantId, startDate, endDate, quantity } = req.query;

    if (!variantId || !startDate || !endDate || !quantity) {
      throw new ApiError('Missing required parameters', 400);
    }

    const result = await reservationService.checkAvailability(
      parseInt(variantId),
      startDate,
      endDate,
      parseInt(quantity)
    );

    if (!result.success) {
      throw new ApiError(result.error, 400);
    }

    res.status(200).json({
      success: true,
      data: {
        variantId: parseInt(variantId),
        startDate,
        endDate,
        requestedQuantity: parseInt(quantity),
        ...result.data
      }
    });
  } catch (err) {
    next(err);
  }
};

const createReservation = async (req, res, next) => {
  try {
    const { orderId, items } = req.body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError('Missing required fields: orderId and items array', 400);
    }

    const result = await reservationService.createReservation(orderId, items);

    if (!result.success) {
      const statusCode = result.code === 'RESERVATION_CONFLICT' ? 409 : 400;
      throw new ApiError(result.error, statusCode);
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getReservations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const result = await reservationService.getReservationsByUser(userId, status);

    if (!result.success) {
      throw new ApiError(result.error, 400);
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await reservationService.getReservationById(parseInt(id));

    if (!reservation) {
      throw new ApiError('Reservation not found', 404);
    }

    if (req.user.role !== 'ADMIN' && reservation.customer_id !== req.user.id) {
      throw new ApiError('Not authorized to view this reservation', 403);
    }

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    next(err);
  }
};

const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await reservationService.getReservationById(parseInt(id));

    if (!reservation) {
      throw new ApiError('Reservation not found', 404);
    }

    if (req.user.role !== 'ADMIN' && reservation.customer_id !== req.user.id) {
      throw new ApiError('Not authorized to cancel this reservation', 403);
    }

    const result = await reservationService.cancelReservation(parseInt(id));

    if (!result.success) {
      throw new ApiError(result.error, 400);
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkAvailability,
  createReservation,
  getReservations,
  getReservationById,
  cancelReservation
};
