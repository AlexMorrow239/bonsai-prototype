import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Database
  MONGODB_URI: Joi.string().required(),

  // Server
  PORT: Joi.number().default(3000),

  // JWT
  JWT_SECRET: Joi.string().required(),

  // Admin
  ADMIN_PASSWORD: Joi.string().required(),

  // Environment
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  NETWORK_MODE: Joi.boolean().default(false),

  // API URL
  API_URL: Joi.string().uri().required(),

  // Development URLs
  FRONTEND_URL_LOCAL: Joi.string().uri().required(),
  FRONTEND_URL_NETWORK: Joi.string().uri().required(),

  // Production URLs (only required in production)
  FRONTEND_URL: Joi.string().uri().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
