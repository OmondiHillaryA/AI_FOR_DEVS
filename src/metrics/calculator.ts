// Main metrics calculator following Rule 3: Modular Architecture & Rule 4: Fail-Safe Error Handling
import { MetricsResult, SecurityError, AnalysisError, QUALITY_THRESHOLDS } from './types';
import { safeReadFile } from './security';
import { calculateComplexityMetrics } from './analyzers/complexity';
import { calculateMaintainabilityMetrics } from './analyzers/maintainability';

export async function calculateMetrics(filePath: string): Promise<MetricsResult> {
  try {
    const content = safeReadFile(filePath);
    
    const [complexity, maintainability] = await Promise.allSettled([
      calculateComplexityMetrics(content),
      Promise.resolve(calculateMaintainabilityMetrics(content))
    ]);

    const complexityResult = complexity.status === 'fulfilled' 
      ? complexity.value 
      : createDefaultComplexity();
      
    const maintainabilityResult = maintainability.status === 'fulfilled'
      ? maintainability.value
      : createDefaultMaintainability();

    if (complexity.status === 'rejected') {
      console.warn(`Complexity analysis failed for ${filePath}:`, complexity.reason?.message);
    }

    const qualityScore = calculateQualityScore(complexityResult, maintainabilityResult);
    const warnings = generateWarnings(complexityResult, maintainabilityResult);
    const recommendations = generateRecommendations(complexityResult, maintainabilityResult);

    return {
      file: filePath,
      complexity: complexityResult,
      maintainability: maintainabilityResult,
      qualityScore,
      warnings,
      recommendations
    };

  } catch (error) {
    if (error instanceof SecurityError) {
      throw error; // Re-throw security errors
    }
    
    // Return partial result for other errors
    console.warn(`Analysis failed for ${filePath}:`, error.message);
    return createPartialResult(filePath, error.message);
  }
}

function createDefaultComplexity() {
  return { cyclomatic: 0, cognitive: 0, nestingDepth: 0, functionLength: 0 };
}

function createDefaultMaintainability() {
  return { duplication: 0, commentRatio: 0, functionCount: 0, linesOfCode: 0 };
}

function calculateQualityScore(complexity: any, maintainability: any): number {
  // Weighted scoring algorithm
  const complexityPenalty = Math.min(complexity.cyclomatic * 2, 50);
  const nestingPenalty = Math.min(complexity.nestingDepth * 3, 30);
  const duplicationPenalty = Math.min(maintainability.duplication, 40);
  const commentBonus = Math.min(maintainability.commentRatio, 20);
  
  const score = Math.max(0, 100 - complexityPenalty - nestingPenalty - duplicationPenalty + commentBonus);
  return Math.round(score);
}

function generateWarnings(complexity: any, maintainability: any): string[] {
  const warnings: string[] = [];
  
  if (complexity.cyclomatic > QUALITY_THRESHOLDS.HIGH_COMPLEXITY) {
    warnings.push(`High cyclomatic complexity: ${complexity.cyclomatic} (threshold: ${QUALITY_THRESHOLDS.HIGH_COMPLEXITY})`);
  }
  if (complexity.nestingDepth > QUALITY_THRESHOLDS.DEEP_NESTING) {
    warnings.push(`Deep nesting detected: ${complexity.nestingDepth} levels (threshold: ${QUALITY_THRESHOLDS.DEEP_NESTING})`);
  }
  if (maintainability.duplication > QUALITY_THRESHOLDS.HIGH_DUPLICATION) {
    warnings.push(`High code duplication: ${maintainability.duplication}% (threshold: ${QUALITY_THRESHOLDS.HIGH_DUPLICATION}%)`);
  }
  if (maintainability.commentRatio < QUALITY_THRESHOLDS.LOW_COMMENTS) {
    warnings.push(`Low comment ratio: ${maintainability.commentRatio}% (threshold: ${QUALITY_THRESHOLDS.LOW_COMMENTS}%)`);
  }
  
  return warnings;
}

function generateRecommendations(complexity: any, maintainability: any): string[] {
  const recommendations: string[] = [];
  
  if (complexity.cyclomatic > QUALITY_THRESHOLDS.HIGH_COMPLEXITY + 5) {
    recommendations.push('Break down complex functions using Extract Method pattern');
  }
  if (complexity.nestingDepth > QUALITY_THRESHOLDS.DEEP_NESTING + 2) {
    recommendations.push('Reduce nesting with early returns and guard clauses');
  }
  if (maintainability.duplication > QUALITY_THRESHOLDS.HIGH_DUPLICATION + 5) {
    recommendations.push('Extract common code into reusable functions or modules');
  }
  if (maintainability.commentRatio < QUALITY_THRESHOLDS.LOW_COMMENTS / 2) {
    recommendations.push('Add JSDoc comments for public functions and complex logic');
  }
  if (complexity.functionLength > 50) {
    recommendations.push('Consider splitting long functions into smaller, focused units');
  }
  
  return recommendations;
}

function createPartialResult(filePath: string, errorMessage: string): MetricsResult {
  return {
    file: filePath,
    complexity: { cyclomatic: 0, cognitive: 0, nestingDepth: 0, functionLength: 0 },
    maintainability: { duplication: 0, commentRatio: 0, functionCount: 0, linesOfCode: 0 },
    qualityScore: 0,
    warnings: [`Analysis failed: ${errorMessage}`],
    recommendations: ['Fix file issues before analysis']
  };
}