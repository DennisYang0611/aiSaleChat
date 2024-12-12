const isDev = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDev ? 'http://localhost:3100/api' : 'https://your-production-api.com/api';

export const API_TIMEOUT = 10000; // 10秒超时 