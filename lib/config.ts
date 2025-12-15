// Environment Configuration
export const config = {
  // App Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Next.js App',
    version: '1.0.0',
    environment: (process.env.NEXT_PUBLIC_ENVIRONMENT || 'development') as 'development' | 'staging' | 'production',
  },
  
  // API Configuration
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 10000,
    secretKey: process.env.API_SECRET_KEY,
  },
  
  // Feature Flags
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
    enablePerformanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
  },
  
  // Cache Configuration
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxEntries: 1000,
  },
  
  // UI Configuration
  ui: {
    theme: {
      default: 'light',
      persisted: true,
    },
    animations: {
      enabled: true,
      reducedMotion: false,
    },
  },
} as const;

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const env = config.app.environment;
  
  const configs = {
    development: {
      debug: true,
      apiTimeout: 30000,
      enableDevTools: true,
    },
    staging: {
      debug: false,
      apiTimeout: 15000,
      enableDevTools: true,
    },
    production: {
      debug: false,
      apiTimeout: 10000,
      enableDevTools: false,
    },
  } as const;
  
  return configs[env];
};

// Validation helpers
export const isDevelopment = () => config.app.environment === 'development';
export const isProduction = () => config.app.environment === 'production';
export const isStaging = () => config.app.environment === 'staging';

export default config;