/**
 * CommitLint Configuration for 2N+1 Redundancy Feature
 * Enforces conventional commit messages for better git history
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only changes
        'style',    // Changes that do not affect the meaning of the code
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvements
        'test',     // Adding missing tests or correcting existing tests
        'build',    // Changes that affect the build system or external dependencies
        'ci',       // Changes to CI configuration files and scripts
        'chore',    // Other changes that don't modify src or test files
        'revert',   // Reverts a previous commit
        'wip',      // Work in progress
        'improvement' // Improvements to existing features
      ]
    ],
    
    // Subject case must be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    
    // Subject must not end with period
    'subject-full-stop': [2, 'never', '.'],
    
    // Subject max length
    'subject-max-length': [2, 'always', 100],
    
    // Body max line length
    'body-max-line-length': [2, 'always', 200],
    
    // Header max length
    'header-max-length': [2, 'always', 100],
    
    // Scope can be empty
    'scope-empty': [0, 'never'],
    
    // Custom scopes for the project
    'scope-enum': [
      1,
      'always',
      [
        'redundancy',    // 2N+1 redundancy feature
        'ui',           // User interface changes
        'performance',  // Performance improvements
        'accessibility', // Accessibility improvements
        'tests',        // Test-related changes
        'config',       // Configuration changes
        'deps',         // Dependencies updates
        'security',     // Security improvements
        'docs',         // Documentation
        'build',        // Build system
        'ci',          // Continuous integration
        'deploy',      // Deployment related
        'monitoring',  // Monitoring and analytics
        'api',         // API changes
        'db',          // Database changes
        'assets',      // Static assets
        'i18n'         // Internationalization
      ]
    ]
  },
  
  // Ignore certain commit types
  ignores: [
    (commit) => commit.includes('WIP'),
    (commit) => commit.includes('wip'),
    (commit) => commit.startsWith('Merge branch'),
    (commit) => commit.startsWith('Merge pull request')
  ],
  
  // Default ignore rules
  defaultIgnores: true,
  
  // Help URL for commit format
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint'
}