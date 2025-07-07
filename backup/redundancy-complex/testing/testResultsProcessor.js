/**
 * Custom Test Results Processor
 * Processes Jest test results for enhanced reporting
 */

const fs = require('fs')
const path = require('path')

module.exports = (results) => {
  // Create enhanced test report
  const report = {
    timestamp: new Date().toISOString(),
    testSuite: 'Redundancy Components',
    summary: {
      total: results.numTotalTests,
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      pending: results.numPendingTests,
      todo: results.numTodoTests,
      runtime: results.testResults.reduce((acc, test) => acc + test.perfStats.runtime, 0)
    },
    coverage: results.coverageMap ? {
      statements: results.coverageMap.getCoverageSummary().statements.pct,
      branches: results.coverageMap.getCoverageSummary().branches.pct,
      functions: results.coverageMap.getCoverageSummary().functions.pct,
      lines: results.coverageMap.getCoverageSummary().lines.pct
    } : null,
    testResults: results.testResults.map(testResult => ({
      testFilePath: testResult.testFilePath,
      success: testResult.numFailingTests === 0,
      runtime: testResult.perfStats.runtime,
      numTests: testResult.testResults.length,
      numPassing: testResult.testResults.filter(t => t.status === 'passed').length,
      numFailing: testResult.testResults.filter(t => t.status === 'failed').length,
      numPending: testResult.testResults.filter(t => t.status === 'pending').length,
      failures: testResult.testResults
        .filter(t => t.status === 'failed')
        .map(t => ({
          title: t.title,
          fullName: t.fullName,
          failureMessages: t.failureMessages
        }))
    })),
    slowTests: results.testResults
      .filter(test => test.perfStats.runtime > 1000)
      .sort((a, b) => b.perfStats.runtime - a.perfStats.runtime)
      .slice(0, 10)
      .map(test => ({
        testFilePath: test.testFilePath,
        runtime: test.perfStats.runtime
      })),
    performance: {
      averageTestTime: results.testResults.length > 0 
        ? results.testResults.reduce((acc, test) => acc + test.perfStats.runtime, 0) / results.testResults.length
        : 0,
      slowestTest: results.testResults.reduce((slowest, test) => 
        test.perfStats.runtime > (slowest?.perfStats?.runtime || 0) ? test : slowest, null),
      fastestTest: results.testResults.reduce((fastest, test) => 
        test.perfStats.runtime < (fastest?.perfStats?.runtime || Infinity) ? test : fastest, null)
    }
  }

  // Save detailed report
  const reportDir = path.join(process.cwd(), 'coverage', 'redundancy')
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  const reportPath = path.join(reportDir, 'test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  // Generate performance insights
  const insights = []
  
  if (report.performance.averageTestTime > 500) {
    insights.push('Average test time is high (>500ms). Consider optimizing slow tests.')
  }
  
  if (report.slowTests.length > 0) {
    insights.push(`${report.slowTests.length} tests are running slowly (>1s). Consider optimization.`)
  }
  
  if (report.summary.failed > 0) {
    insights.push(`${report.summary.failed} tests are failing. Review failure messages for details.`)
  }
  
  if (report.coverage && report.coverage.statements < 80) {
    insights.push('Code coverage is below 80%. Consider adding more tests.')
  }

  // Save insights
  const insightsPath = path.join(reportDir, 'test-insights.json')
  fs.writeFileSync(insightsPath, JSON.stringify({
    timestamp: report.timestamp,
    insights,
    recommendations: {
      performance: report.performance.averageTestTime > 500 ? 'Optimize slow tests' : 'Good performance',
      coverage: report.coverage && report.coverage.statements >= 80 ? 'Good coverage' : 'Increase test coverage',
      reliability: report.summary.failed === 0 ? 'All tests passing' : 'Fix failing tests'
    }
  }, null, 2))

  // Log summary to console
  console.log('\n📊 Redundancy Test Report Summary:')
  console.log(`✅ Passed: ${report.summary.passed}`)
  console.log(`❌ Failed: ${report.summary.failed}`)
  console.log(`⏱️  Runtime: ${report.summary.runtime}ms`)
  
  if (report.coverage) {
    console.log(`📈 Coverage: ${report.coverage.statements}% statements`)
  }
  
  if (insights.length > 0) {
    console.log('\n💡 Test Insights:')
    insights.forEach(insight => console.log(`   • ${insight}`))
  }

  console.log(`\n📄 Detailed report saved to: ${reportPath}`)

  return results
}