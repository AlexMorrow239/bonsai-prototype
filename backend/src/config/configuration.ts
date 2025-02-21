import { registerAs } from '@nestjs/config';

export interface AppConfig {
  server: {
    port: number;
    host: string;
  };
  database: {
    url: string;
    name: string;
  };
  security: {
    jwtSecret: string;
    jwtExpiration: string;
  };
}

export default (): AppConfig => ({
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || '0.0.0.0',
  },
  database: {
    url: process.env.DATABASE_URL,
    name: process.env.DATABASE_NAME,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION || '1h',
  },
});

export const environmentConfig = registerAs('environment', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  isNetworkMode: process.env.NETWORK_MODE === 'true',
}));

export const urlConfig = registerAs('url', () => {
  const isNetworkMode = process.env.NETWORK_MODE === 'true';
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    frontend:
      nodeEnv === 'production'
        ? process.env.FRONTEND_URL
        : isNetworkMode
          ? process.env.FRONTEND_URL_NETWORK
          : process.env.FRONTEND_URL_LOCAL,
  };
});

export const backendConfig = registerAs('backend', () => {
  const isNetworkMode = process.env.NETWORK_MODE === 'true';

  return {
    url: isNetworkMode
      ? process.env.BACKEND_URL_NETWORK
      : process.env.BACKEND_URL_LOCAL,
  };
});

export const databaseConfig = registerAs('database', () => ({
  uri: process.env.MONGODB_URI,
}));

export const serverConfig = registerAs('server', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV,
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
}));

export const adminConfig = registerAs('admin', () => ({
  password: process.env.ADMIN_PASSWORD,
}));

export const apiConfig = registerAs('api', () => ({
  url: process.env.API_URL,
}));