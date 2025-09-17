// Maintainability analysis following Rule 2: Resource-Bounded Analysis
import { MaintainabilityMetrics } from '../types';

// Pre-compiled patterns for better performance
const FUNCTION_PATTERNS = [
  /\bfunction\s+\w+/g,
  /\w+\s*=\s*\(/g,
  /\w+\s*=>/g,
  /\w+\s*:\s*\(/g
] as const;

const COMMENT_PATTERNS = {
  singleLine: /^\s*\/\//,
  multiLineStart: /^\s*\/\*/,
  multiLineContinue: /^\s*\*/
} as const;

export function calculateMaintainabilityMetrics(content: string): MaintainabilityMetrics {
  const lines = content.split('\n');
  const { codeLines, commentLines } = analyzeLines(lines);
  
  return {
    duplication: calculateDuplication(lines),
    commentRatio: codeLines > 0 ? Math.round((commentLines / codeLines) * 100) : 0,
    functionCount: calculateFunctionCount(content),
    linesOfCode: codeLines
  };
}

// Optimized line analysis - single pass
function analyzeLines(lines: readonly string[]): { codeLines: number; commentLines: number } {
  let codeLines = 0;
  let commentLines = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (COMMENT_PATTERNS.singleLine.test(trimmed) || 
        COMMENT_PATTERNS.multiLineStart.test(trimmed) || 
        COMMENT_PATTERNS.multiLineContinue.test(trimmed)) {
      commentLines++;
    } else {
      codeLines++;
    }
  }
  
  return { codeLines, commentLines };
}

function calculateDuplication(lines: readonly string[]): number {
  const lineMap = new Map<string, number>();
  let duplicateLines = 0;
  
  // Filter meaningful lines in single pass
  const meaningfulLines = lines
    .map(line => line.trim())
    .filter(line => line.length > 5 && !line.startsWith('//'))
    .filter(line => !/^[{}\s]*$/.test(line)); // Skip braces and whitespace
  
  // Count duplicates efficiently
  for (const line of meaningfulLines) {
    const count = (lineMap.get(line) ?? 0) + 1;
    lineMap.set(line, count);
    
    if (count === 2) duplicateLines += 2; // First duplicate adds 2
    else if (count > 2) duplicateLines++; // Additional duplicates add 1
  }
  
  return meaningfulLines.length > 0 
    ? Math.round((duplicateLines / meaningfulLines.length) * 100)
    : 0;
}



function calculateFunctionCount(content: string): number {
  let totalCount = 0;
  
  for (const pattern of FUNCTION_PATTERNS) {
    const matches = content.match(pattern);
    totalCount += matches?.length ?? 0;
  }
  
  return totalCount;
}

