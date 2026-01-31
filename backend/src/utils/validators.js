const Joi = require('joi');

// Validation patterns
const patterns = {
  phone: /^[6-9]\d{9}$/,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Reusable schemas
const schemas = {
  // Email schema
  email: Joi.string().email().lowercase().required(),
  
  // Password schema
  password: Joi.string()
    .pattern(patterns.password)
    .required()
    .messages({
      'string.pattern.base': 'Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char'
    }),
  
  // Phone schema
  phone: Joi.string()
    .pattern(patterns.phone)
    .messages({ 'string.pattern.base': 'Invalid Indian phone number' }),
  
  // GSTIN schema
  gstin: Joi.string()
    .pattern(patterns.gstin)
    .uppercase()
    .messages({ 'string.pattern.base': 'Invalid GSTIN format' }),
  
  // UUID schema
  id: Joi.string().uuid(),
  
  // Pagination schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),
  
  // Date range schema
  dateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
  })
};

// Validation helper
const validate = (schema, data) => {
  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  patterns,
  schemas,
  validate
};
