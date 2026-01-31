const crypto = require('crypto');

// Calculate duration between two dates
const calculateDuration = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate - startDate;
  
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  const days = Math.ceil(hours / 24);
  
  return { hours, days };
};

// Format amount as INR currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Generate unique order number
const generateOrderNumber = (prefix = 'ORD') => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${date}-${random}`;
};

// Generate unique invoice number
const generateInvoiceNumber = (prefix = 'INV') => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${date}-${random}`;
};

// Remove sensitive fields from user object
const sanitizeUser = (user) => {
  const { password_hash, ...rest } = user;
  return rest;
};

// Generate pagination metadata
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev
  };
};

// Standard success response
const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

// Standard error response
const errorResponse = (error, statusCode = 500) => {
  return {
    success: false,
    error: typeof error === 'string' ? error : error.message,
    statusCode
  };
};

module.exports = {
  calculateDuration,
  formatCurrency,
  generateOrderNumber,
  generateInvoiceNumber,
  sanitizeUser,
  getPaginationMeta,
  successResponse,
  errorResponse
};
