/**
 * Simple in-memory cache utility
 * Stores data with TTL (Time To Live)
 * Perfect for caching static data like plans, trainers, testimonials
 */

interface CacheItem {
  data: any;
  expiry: number;
}

class MemoryCache {
  private cache: Map<string, CacheItem>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached data by key
   * Returns null if not found or expired
   */
  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Cache HIT: ${key}`);
    return item.data;
  }

  /**
   * Set cache data with TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
   */
  set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
    console.log(`💾 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  }

  /**
   * Delete specific cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️  Cache DELETE: ${key}`);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️  Cache CLEARED');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cache = new MemoryCache();
