import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Database
  MONGODB_URI: Joi.string().required(),

  // Server
  PORT: Joi.number().default(3000),
  HOST: Joi.string().default('0.0.0.0'),

  // AWS
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_BUCKET_NAME: Joi.string().required(),

  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
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

  // LLM Service Configuration
  LLM_SERVICE_URL: Joi.string()
    .uri()
    .default('http://localhost:3002')
    .description('URL for the LLM service'),
});
