// Performance-conscious caching following Rule 5: Performance-Conscious Data Processing
import { createHash } from 'crypto';
import { statSync } from 'fs';
import { CacheEntry, MetricsResult, CacheStats, ANALYSIS_LIMITS } from './types';

export class MetricsCache {
  private readonly cache = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;
  
  // Use constants from types
  private readonly TTL = ANALYSIS_LIMITS.CACHE_TTL;
  private readonly MAX_CACHE_SIZE = ANALYSIS_LIMITS.MAX_CACHE_SIZE;

  async getFileHash(filePath: string): Promise<string> {
    try {
      const stats = statSync(filePath);
      // More efficient hash creation
      const hashInput = `${filePath}:${stats.mtime.getTime()}:${stats.size}`;
      return createHash('md5').update(hashInput).digest('hex');
    } catch {
      // Fallback for inaccessible files
      return createHash('md5').update(filePath).digest('hex');
    }
  }

  private isCacheValid(cached: CacheEntry | undefined, currentHash: string): boolean {
    if (!cached) return false;
    
    const now = Date.now();
    const isNotExpired = (now - cached.timestamp) < this.TTL;
    const hashMatches = cached.hash === currentHash;
    
    return isNotExpired && hashMatches;
  }

  async getOrCalculate(
    filePath: string, 
    calculator: () => Promise<MetricsResult>
  ): Promise<MetricsResult> {
    const hash = await this.getFileHash(filePath);
    const cached = this.cache.get(filePath);
    
    if (this.isCacheValid(cached, hash)) {
      this.hits++;
      return cached!.metrics;
    }
    
    this.misses++;
    
    // Calculate new metrics
    const metrics = await calculator();
    
    // Manage cache size before adding
    this.ensureCacheSize();
    
    // Cache the result
    this.cache.set(filePath, {
      metrics,
      hash,
      timestamp: Date.now()
    });
    
    return metrics;
  }

  private ensureCacheSize(): void {
    if (this.cache.size < this.MAX_CACHE_SIZE) return;
    
    // Remove expired entries first
    this.cleanupExpired();
    
    // If still over limit, remove oldest
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= this.TTL) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hitRate: total > 0 ? Math.round((this.hits / total) * 100) : 0
    };
  }

  // Utility method for debugging
  getCacheInfo(): { entries: number; oldestEntry: number; newestEntry: number } {
    if (this.cache.size === 0) {
      return { entries: 0, oldestEntry: 0, newestEntry: 0 };
    }
    
    let oldest = Date.now();
    let newest = 0;
    
    for (const entry of this.cache.values()) {
      oldest = Math.min(oldest, entry.timestamp);
      newest = Math.max(newest, entry.timestamp);
    }
    
    return {
      entries: this.cache.size,
      oldestEntry: oldest,
      newestEntry: newest
    };
  }
}