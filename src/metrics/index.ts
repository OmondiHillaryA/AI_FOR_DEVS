// Main exports for Code Quality Metrics Tool
// Following Rule 3: Modular Architecture

// Core functionality
export { calculateMetrics } from './calculator';
export { MetricsCache } from './cache';

// Security utilities
export { sanitizePath, safeReadFile, validatePaths } from './security';

// Analyzers
export { calculateComplexityMetrics } from './analyzers/complexity';
export { calculateMaintainabilityMetrics } from './analyzers/maintainability';

// Types and constants
export type {
  ComplexityMetrics,
  MaintainabilityMetrics,
  MetricsResult,
  MetricsInput,
  CacheEntry,
  CacheStats,
  MetricsType
} from './types';

export {
  SecurityError,
  AnalysisError,
  ANALYSIS_LIMITS,
  QUALITY_THRESHOLDS
} from './types';

// Convenience factory function
export function createMetricsAnalyzer() {
  return {
    cache: new MetricsCache(),
    analyze: calculateMetrics,
    clearCache: function() { this.cache.clear(); },
    getStats: function() { return this.cache.getStats(); }
  };
}