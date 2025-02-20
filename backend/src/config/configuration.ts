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