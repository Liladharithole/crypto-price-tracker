// Simple in-memory cache for API responses
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 2 * 60 * 1000; // 2 minutes TTL for faster updates
  }

  generateKey(url, params = {}) {
    return `${url}_${JSON.stringify(params)}`;
  }

  set(key, data) {
    const entry = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + this.ttl
    };
    this.cache.set(key, entry);
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Create global cache instance
const apiCache = new ApiCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);

export default apiCache;
