
// Security utilities for input validation and sanitization

/**
 * Sanitizes text input to prevent XSS attacks
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Replace potentially dangerous HTML characters
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validates text input against size and content restrictions
 */
export const validateTextInput = (
  text: string, 
  options = { maxLength: 50000, minLength: 1, allowHtml: false }
): { valid: boolean; error?: string } => {
  if (!text || text.trim() === '') {
    return { valid: false, error: 'Text cannot be empty' };
  }
  
  if (text.length > options.maxLength) {
    return { 
      valid: false, 
      error: `Text exceeds maximum length of ${options.maxLength} characters` 
    };
  }
  
  if (text.length < options.minLength) {
    return { 
      valid: false, 
      error: `Text must be at least ${options.minLength} characters` 
    };
  }
  
  // Detect potential script injection if HTML is not allowed
  if (!options.allowHtml && (
    text.includes('<script') || 
    text.includes('javascript:') || 
    text.includes('on') && /on\w+=/.test(text)
  )) {
    return { 
      valid: false, 
      error: 'Text contains potentially unsafe content' 
    };
  }
  
  return { valid: true };
};

/**
 * Rate limiting utility to prevent abuse
 */
export class RateLimiter {
  private requestTimes: number[] = [];
  private maxRequests: number;
  private timeWindowMs: number;
  
  constructor(maxRequests = 10, timeWindowSeconds = 60) {
    this.maxRequests = maxRequests;
    this.timeWindowMs = timeWindowSeconds * 1000;
  }
  
  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests from tracking
    this.requestTimes = this.requestTimes.filter(
      time => now - time < this.timeWindowMs
    );
    
    // Check if under limit
    if (this.requestTimes.length < this.maxRequests) {
      this.requestTimes.push(now);
      return true;
    }
    
    return false;
  }
  
  getTimeUntilNextAvailable(): number {
    if (this.requestTimes.length === 0) return 0;
    
    const now = Date.now();
    const oldestRequest = this.requestTimes[0];
    const timeUntilExpiry = this.timeWindowMs - (now - oldestRequest);
    
    return Math.max(0, timeUntilExpiry);
  }
  
  resetLimiter(): void {
    this.requestTimes = [];
  }
}

// Cache utility for expensive operations
export class SimpleCache<T> {
  private cache: Map<string, { data: T; expiry: number }> = new Map();
  
  set(key: string, data: T, ttlSeconds = 300): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  removeExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}
