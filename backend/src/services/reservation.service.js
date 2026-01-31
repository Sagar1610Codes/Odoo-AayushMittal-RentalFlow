const pool = require('../config/database');

// Check availability
const checkAvailability = async (variantId, startDate, endDate, quantity) => {
  try {
    const result = await pool.query(
      `SELECT 
        v.stock_quantity as total,
        COALESCE(SUM(r.quantity), 0) as reserved
       FROM variants v
       LEFT JOIN reservations r ON r.variant_id = v.id
         AND r.status = 'ACTIVE'
         AND tsrange(r.start_date, r.end_date) && tsrange($2, $3)
       WHERE v.id = $1
       GROUP BY v.id, v.stock_quantity`,
      [variantId, startDate, endDate]
    );
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Variant not found'
      };
    }
    
    const { total, reserved } = result.rows[0];
    const available = parseInt(total) - parseInt(reserved);
    
    return {
      success: true,
      data: {
        available,
        total: parseInt(total),
        reserved: parseInt(reserved),
        canReserve: available >= quantity
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Create reservations
const createReservation = async (orderId, items) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const createdReservations = [];
    
    for (const item of items) {
      const { variantId, quantity, startDate, endDate } = item;
      
      // Check availability
      const availCheck = await checkAvailability(
        variantId,
        startDate,
        endDate,
        quantity
      );
      
      if (!availCheck.success || !availCheck.data.canReserve) {
        throw new Error(
          `Insufficient availability for variant ${variantId}. ` +
          `Available: ${availCheck.data?.available || 0}, Requested: ${quantity}`
        );
      }
      
      // Insert reservation
      const result = await client.query(
        `INSERT INTO reservations 
         (order_id, variant_id, start_date, end_date, quantity, status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
         RETURNING *`,
        [orderId, variantId, startDate, endDate, quantity]
      );
      
      createdReservations.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    
    return {
      success: true,
      data: createdReservations
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    // Check if exclusion constraint violation
    if (error.code === '23P01') {
      return {
        success: false,
        error: 'Reservation conflict: Time slot no longer available',
        code: 'RESERVATION_CONFLICT'
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    client.release();
  }
};

// Cancel reservation
const cancelReservation = async (reservationId) => {
  try {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = 'CANCELLED', 
           updated_at = NOW()
       WHERE id = $1 AND status = 'ACTIVE'
       RETURNING *`,
      [reservationId]
    );
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Reservation not found or already cancelled'
      };
    }
    
    return {
      success: true,
      data: result.rows[0]
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Cancel reservations by order
const cancelReservationsByOrder = async (orderId) => {
  try {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = 'CANCELLED', 
           updated_at = NOW()
       WHERE order_id = $1 AND status = 'ACTIVE'
       RETURNING *`,
      [orderId]
    );
    
    return {
      success: true,
      data: result.rows,
      cancelled: result.rowCount
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Complete reservation
const completeReservation = async (reservationId) => {
  try {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = 'COMPLETED', 
           updated_at = NOW()
       WHERE id = $1 AND status = 'ACTIVE'
       RETURNING *`,
      [reservationId]
    );
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Active reservation not found'
      };
    }
    
    return {
      success: true,
      data: result.rows[0]
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  checkAvailability,
  createReservation,
  cancelReservation,
  cancelReservationsByOrder,
  completeReservation
};
