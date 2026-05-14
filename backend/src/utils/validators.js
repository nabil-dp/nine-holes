const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).required().messages({
    'string.alphanum': 'Username must only contain alphanumeric characters',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username must be at most 20 characters',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'any.required': 'Username or email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).optional(),
  email: Joi.string().email().optional(),
  avatar: Joi.string().uri().allow(null).optional(),
});

const startGameSchema = Joi.object({
  opponent_id: Joi.string().hex().length(24).required().messages({
    'any.required': 'Opponent ID is required',
    'string.hex': 'Invalid opponent ID format',
  }),
});

const placeBallSchema = Joi.object({
  game_session_id: Joi.string().hex().length(24).required(),
  position: Joi.number().integer().min(0).max(8).required().messages({
    'number.min': 'Position must be between 0 and 8',
    'number.max': 'Position must be between 0 and 8',
    'any.required': 'Position is required',
  }),
});

const moveBallSchema = Joi.object({
  game_session_id: Joi.string().hex().length(24).required(),
  from_position: Joi.number().integer().min(0).max(8).required(),
  to_position: Joi.number().integer().min(0).max(8).required(),
});

const sendInviteSchema = Joi.object({
  to_user_id: Joi.string().hex().length(24).required().messages({
    'any.required': 'Target user ID is required',
  }),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }
  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
  startGameSchema,
  placeBallSchema,
  moveBallSchema,
  sendInviteSchema,
  validate,
};
