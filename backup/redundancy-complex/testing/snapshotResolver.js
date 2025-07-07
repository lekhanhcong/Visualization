/**
 * Snapshot Resolver for Jest
 * Custom snapshot file naming and location
 */

module.exports = {
  // Resolves from test to snapshot path
  resolveSnapshotPath: (testPath, snapshotExtension) => {
    // Replace __tests__ with __snapshots__ in the path
    const snapshotPath = testPath
      .replace('__tests__', '__snapshots__')
      .replace(/\.test\.(js|jsx|ts|tsx)$/, `.test${snapshotExtension}`)
    
    return snapshotPath
  },

  // Resolves from snapshot to test path  
  resolveTestPath: (snapshotFilePath, snapshotExtension) => {
    // Replace __snapshots__ with __tests__ in the path
    const testPath = snapshotFilePath
      .replace('__snapshots__', '__tests__')
      .replace(snapshotExtension, '.test.tsx')
    
    return testPath
  },

  // Example test path, used for preflight consistency check of the implementation above
  testPathForConsistencyCheck: 'features/redundancy/__tests__/components/RedundancyOverlay.test.tsx'
}