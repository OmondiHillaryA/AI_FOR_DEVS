// Complexity analysis following Rule 2: Resource-Bounded Analysis
import { ComplexityMetrics, ANALYSIS_LIMITS } from '../types';

// Pre-compiled regex patterns for better performance
const COMPLEXITY_PATTERNS = {
  decisions: /\b(if|while|for|case|catch)\s*[\(:]|&&|\|\|/g,
  functions: /\b(function\s+\w+|\w+\s*=>|\w+\s*\()/g,
  openBrace: /{/g,
  closeBrace: /}/g
} as const;

export function calculateComplexityMetrics(content: string): Promise<ComplexityMetrics> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Complexity analysis timeout'));
    }, ANALYSIS_LIMITS.ANALYSIS_TIMEOUT);

    try {
      const lines = content.split('\n');
      const metrics: ComplexityMetrics = {
        cyclomatic: calculateCyclomaticComplexity(content),
        cognitive: calculateCognitiveComplexity(lines),
        nestingDepth: calculateNestingDepth(content),
        functionLength: calculateAverageFunctionLength(content, lines.length)
      };
      
      clearTimeout(timeout);
      resolve(metrics);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}

function calculateCyclomaticComplexity(content: string): number {
  const matches = content.match(COMPLEXITY_PATTERNS.decisions);
  const complexity = 1 + (matches?.length ?? 0); // Base complexity + decision points
  return Math.min(complexity, 50); // Cap for performance
}

function calculateCognitiveComplexity(lines: readonly string[]): number {
  let complexity = 0;
  let nestingLevel = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Track nesting changes
    if (trimmed.endsWith('{')) nestingLevel++;
    if (trimmed.startsWith('}')) nestingLevel = Math.max(0, nestingLevel - 1);
    
    // Add complexity for control structures
    if (/\b(if|while|for)\s*\(/.test(trimmed)) {
      complexity += 1 + nestingLevel;
    }
  }
  
  return Math.min(complexity, 100);
}

function calculateNestingDepth(content: string): number {
  const openBraces = content.match(COMPLEXITY_PATTERNS.openBrace)?.length ?? 0;
  const closeBraces = content.match(COMPLEXITY_PATTERNS.closeBrace)?.length ?? 0;
  
  // Simple approximation: max nesting is roughly the difference
  const maxDepth = Math.abs(openBraces - closeBraces) + Math.min(openBraces, closeBraces) / 2;
  return Math.min(Math.floor(maxDepth), 20);
}

function calculateAverageFunctionLength(content: string, totalLines: number): number {
  const functionMatches = content.match(COMPLEXITY_PATTERNS.functions);
  if (!functionMatches || functionMatches.length === 0) return 0;
  
  return Math.round(totalLines / functionMatches.length);
}