// Performance test for Code Quality Metrics Tool
import { createMetricsAnalyzer } from './src/metrics';

async function performanceTest() {
  const analyzer = createMetricsAnalyzer();
  const testFile = './src/metrics/calculator.ts';
  
  console.log('🚀 Starting Code Quality Metrics Performance Test\n');
  
  // Test 1: Cold cache performance
  console.log('Test 1: Cold cache analysis');
  const start1 = Date.now();
  try {
    const result1 = await analyzer.analyze(testFile);
    const time1 = Date.now() - start1;
    console.log(`✅ Analysis completed in ${time1}ms`);
    console.log(`📊 Quality Score: ${result1.qualityScore}/100`);
    console.log(`⚠️  Warnings: ${result1.warnings.length}`);
    console.log(`💡 Recommendations: ${result1.recommendations.length}\n`);
  } catch (error) {
    console.log(`❌ Test 1 failed: ${error.message}\n`);
  }
  
  // Test 2: Warm cache performance
  console.log('Test 2: Warm cache analysis');
  const start2 = Date.now();
  try {
    const result2 = await analyzer.analyze(testFile);
    const time2 = Date.now() - start2;
    console.log(`✅ Cached analysis completed in ${time2}ms`);
    console.log(`📈 Cache stats:`, analyzer.getStats());
    console.log(`🎯 Performance improvement: ${Math.round(((time1 - time2) / time1) * 100)}%\n`);
  } catch (error) {
    console.log(`❌ Test 2 failed: ${error.message}\n`);
  }
  
  // Test 3: Multiple file analysis
  console.log('Test 3: Multiple file analysis');
  const testFiles = [
    './src/metrics/calculator.ts',
    './src/metrics/security.ts',
    './src/metrics/cache.ts'
  ];
  
  const start3 = Date.now();
  const results = await Promise.allSettled(
    testFiles.map(file => analyzer.analyze(file))
  );
  const time3 = Date.now() - start3;
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  console.log(`✅ Analyzed ${successful}/${testFiles.length} files in ${time3}ms`);
  console.log(`📊 Average time per file: ${Math.round(time3 / testFiles.length)}ms`);
  console.log(`📈 Final cache stats:`, analyzer.getStats());
  
  console.log('\n🎉 Performance test completed!');
}

// Run the test
if (import.meta.main) {
  performanceTest().catch(console.error);
}