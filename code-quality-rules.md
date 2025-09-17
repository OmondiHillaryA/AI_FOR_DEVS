# Code Quality Metrics Tool - Development Rules

## 🛡️ Rule 1: Security-First File Operations
**Pattern**: Always sanitize and validate file paths before processing
```typescript
// ✅ ALWAYS DO
function sanitizePath(inputPath: string): string {
  const resolved = path.resolve(inputPath);
  if (!resolved.startsWith(process.cwd())) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

// ❌ NEVER DO
function unsafeFileRead(userPath: string) {
  return fs.readFileSync(userPath); // Vulnerable to path traversal
}
```

## ⚡ Rule 2: Resource-Bounded Analysis
**Pattern**: Implement limits on file size, processing time, and memory usage
```typescript
// ✅ ALWAYS DO
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ANALYSIS_TIMEOUT = 30000; // 30 seconds
const MAX_CONCURRENT_FILES = 50;

async function analyzeWithLimits(filePath: string): Promise<MetricsResult> {
  validateFileSize(filePath);
  return Promise.race([
    calculateMetrics(filePath),
    timeoutPromise(ANALYSIS_TIMEOUT)
  ]);
}

// ❌ NEVER DO
function analyzeUnbounded(files: string[]) {
  return Promise.all(files.map(analyzeFile)); // No limits = potential DoS
}
```

## 🏗️ Rule 3: Modular Tool Architecture
**Pattern**: Separate concerns into focused, testable modules
```typescript
// ✅ ALWAYS DO
// tools.ts - Tool interface only
export const codeQualityMetricsTool = tool({
  description: "Analyzes code quality metrics",
  inputSchema: metricsSchema,
  execute: analyzeCodeQuality
});

// metrics/calculator.ts - Core logic
export async function calculateMetrics(filePath: string): Promise<MetricsResult>

// metrics/analyzers/complexity.ts - Specific analysis
export function calculateCyclomaticComplexity(ast: any): number

// ❌ NEVER DO
// Everything in one file
export const massiveTool = tool({
  execute: (input) => {
    // 500+ lines of mixed concerns
  }
});
```

## 🎯 Rule 4: Fail-Safe Error Handling
**Pattern**: Graceful degradation with meaningful error messages
```typescript
// ✅ ALWAYS DO
async function analyzeCodeQuality(input: MetricsInput): Promise<MetricsResult[]> {
  try {
    const sanitizedPath = sanitizePath(input.path);
    return await calculateMetrics(sanitizedPath);
  } catch (error) {
    if (error instanceof SecurityError) {
      throw error; // Re-throw security errors
    }
    // Log and return partial results
    console.warn(`Analysis failed for ${input.path}:`, error.message);
    return createPartialResult(input.path, error.message);
  }
}

// ❌ NEVER DO
async function fragileAnalysis(input: any) {
  const result = await riskyOperation(input.path); // Unhandled errors crash tool
  return result;
}
```

## 📊 Rule 5: Performance-Conscious Data Processing
**Pattern**: Use caching, streaming, and lazy evaluation for large datasets
```typescript
// ✅ ALWAYS DO
class MetricsCache {
  private cache = new Map<string, CacheEntry>();
  
  async getOrCalculate(filePath: string): Promise<MetricsResult> {
    const hash = await this.getFileHash(filePath);
    const cached = this.cache.get(filePath);
    
    if (this.isCacheValid(cached, hash)) {
      return cached.metrics;
    }
    
    const metrics = await this.calculateAndCache(filePath, hash);
    return metrics;
  }
}

// Process in chunks for large directories
async function* analyzeDirectoryStream(dirPath: string) {
  const files = await this.getFiles(dirPath);
  for (const chunk of this.chunkArray(files, 10)) {
    yield await Promise.all(chunk.map(this.analyzeFile));
  }
}

// ❌ NEVER DO
async function analyzeAllAtOnce(dirPath: string) {
  const files = await glob(`${dirPath}/**/*`); // Could be thousands
  return Promise.all(files.map(analyzeFile)); // Memory explosion
}
```

## 🎪 Implementation Guidelines

### **Priority Order**
1. **Security** - Implement Rule 1 first
2. **Resource Limits** - Add Rule 2 protections
3. **Architecture** - Structure code per Rule 3
4. **Error Handling** - Apply Rule 4 patterns
5. **Performance** - Optimize with Rule 5 techniques

### **Testing Requirements**
- Security: Test path traversal attempts
- Limits: Test with large files and timeouts
- Architecture: Unit test each module independently
- Errors: Test failure scenarios and recovery
- Performance: Benchmark with realistic datasets

### **Code Review Checklist**
- [ ] All file paths sanitized?
- [ ] Resource limits enforced?
- [ ] Single responsibility per module?
- [ ] Errors handled gracefully?
- [ ] Performance considerations addressed?