
// Production configuration settings

export const isProduction = () => {
  return import.meta.env.PROD === true;
};

export const isProdHost = () => {
  const hostname = window.location.hostname;
  return hostname !== 'localhost' && 
         hostname !== '127.0.0.1' &&
         !hostname.includes('.preview.');
};

export const getEnvironment = () => {
  if (isProduction() && isProdHost()) {
    return 'production';
  } else if (isProduction()) {
    return 'staging';
  }
  return 'development';
};

export const performanceConfig = {
  // Disable certain features in production that might affect performance
  enableDetailedLogging: !isProduction(),
  enableDevTools: !isProduction(),
  
  // Configure cache TTLs (in seconds)
  cacheTTL: {
    plagiarismResults: 3600, // 1 hour
    suggestions: 1800, // 30 minutes
    userSettings: 300, // 5 minutes
  }
};

export const errorConfig = {
  // Configure error handling behavior
  retryAttempts: 3,
  retryDelayMs: 1000,
  sendErrorsToBackend: isProduction() && isProdHost(),
};

// Resource limits to prevent abuse
export const rateLimits = {
  maxTextLength: 50000, // Maximum characters per submission
  maxRequestsPerMinute: 10, // For client-side throttling
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

// Feature flags for production
export const featureFlags = {
  enableAdvancedAnalytics: true,
  enableMultilingualDetection: true,
  enableSemanticSearch: true,
  enableSmartRewriting: true,
  enableEducationalResources: isProdHost(), // Only in full production
};

// API endpoints configuration (with potential overrides for staging/dev)
export const endpoints = {
  baseUrl: isProdHost() ? 
    "https://qjczhbllpzkkstustvbn.supabase.co" : 
    "https://qjczhbllpzkkstustvbn.supabase.co",
};
