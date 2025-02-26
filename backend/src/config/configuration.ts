import { registerAs } from '@nestjs/config';

export interface AppConfig {
  server: {
    port: number;
    host: string;
    nodeEnv: string;
  };
  database: {
    uri: string;
  };
  urls: {
    backend: string;
    api: string;
    frontend: string;
    llmService: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
  };
}

export default registerAs('app', () => {
  const isNetworkMode = process.env.NETWORK_MODE === 'true';
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    server: {
      port: parseInt(process.env.PORT, 10) || 3000,
      host: process.env.HOST || '0.0.0.0',
      nodeEnv,
    },
    database: {
      uri: process.env.MONGODB_URI,
    },
    urls: {
      frontend:
        nodeEnv === 'production'
          ? process.env.FRONTEND_URL
          : isNetworkMode
            ? process.env.FRONTEND_URL_NETWORK
            : process.env.FRONTEND_URL_LOCAL,
      backend: isNetworkMode
        ? process.env.BACKEND_URL_NETWORK
        : process.env.BACKEND_URL_LOCAL,
      api: process.env.API_URL,
      llmService: process.env.LLM_SERVICE_URL,
    },
    aws: {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucketName: process.env.AWS_BUCKET_NAME,
    },
  };
});
