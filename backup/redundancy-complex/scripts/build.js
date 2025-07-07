#!/usr/bin/env node

/**
 * Build Script for 2N+1 Redundancy Feature
 * Handles compilation, optimization, and deployment preparation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  featureName: '2N+1 Redundancy',
  featureId: 'redundancy-2n1',
  version: '1.0.0',
  buildDir: 'dist',
  sourceDir: 'features/redundancy',
  enabledFlag: process.env.NEXT_PUBLIC_ENABLE_REDUNDANCY === 'true'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}[RedundancyBuild]${colors.reset} ${message}`);
}

function logStep(step, message) {
  log(`${colors.cyan}Step ${step}:${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  log(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

// Utility functions
function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return result;
  } catch (error) {
    if (!options.allowFailure) {
      logError(`Command failed: ${command}`);
      logError(error.message);
      process.exit(1);
    }
    return null;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(source, destination) {
  ensureDirectoryExists(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Build steps
async function validateEnvironment() {
  logStep(1, 'Validating build environment');
  
  // Check Node.js version
  const nodeVersion = process.version;
  log(`Node.js version: ${nodeVersion}`);
  
  if (!nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v20')) {
    logWarning('Recommended Node.js version is 18.x or 20.x');
  }
  
  // Check feature flag
  log(`Feature flag: NEXT_PUBLIC_ENABLE_REDUNDANCY=${CONFIG.enabledFlag}`);
  
  if (!CONFIG.enabledFlag) {
    logWarning('Feature is disabled. Build will continue but feature won\'t be active.');
  }
  
  // Check required files
  const requiredFiles = [
    'features/redundancy/index.ts',
    'features/redundancy/config.ts',
    'features/redundancy/types.ts',
    'features/redundancy/components/index.ts'
  ];
  
  for (const file of requiredFiles) {
    if (!checkFileExists(file)) {
      logError(`Required file missing: ${file}`);
      process.exit(1);
    }
  }
  
  logSuccess('Environment validation completed');
}

async function cleanBuildDirectory() {
  logStep(2, 'Cleaning build directory');
  
  if (fs.existsSync(CONFIG.buildDir)) {
    executeCommand(`rm -rf ${CONFIG.buildDir}`);
  }
  
  ensureDirectoryExists(CONFIG.buildDir);
  
  logSuccess('Build directory cleaned');
}

async function runTypeScriptCompilation() {
  logStep(3, 'Running TypeScript compilation');
  
  // Check if TypeScript is available
  const tscVersion = executeCommand('npx tsc --version', { silent: true, allowFailure: true });
  
  if (!tscVersion) {
    logError('TypeScript not found. Please install TypeScript.');
    process.exit(1);
  }
  
  log(`TypeScript version: ${tscVersion.trim()}`);
  
  // Compile TypeScript
  executeCommand('npx tsc --noEmit');
  
  logSuccess('TypeScript compilation completed');
}

async function runLinting() {
  logStep(4, 'Running linting checks');
  
  // ESLint
  const eslintResult = executeCommand(
    'npx eslint features/redundancy --ext .ts,.tsx',
    { allowFailure: true, silent: true }
  );
  
  if (eslintResult === null) {
    logWarning('ESLint found issues. Please fix before deployment.');
  } else {
    logSuccess('ESLint checks passed');
  }
  
  // Prettier
  const prettierResult = executeCommand(
    'npx prettier --check features/redundancy/**/*.{ts,tsx,css,md}',
    { allowFailure: true, silent: true }
  );
  
  if (prettierResult === null) {
    logWarning('Prettier formatting issues found. Run `npm run format` to fix.');
  } else {
    logSuccess('Prettier checks passed');
  }
}

async function runTests() {
  logStep(5, 'Running test suite');
  
  try {
    // Unit tests
    log('Running unit tests...');
    executeCommand('npm test features/redundancy', { allowFailure: true });
    
    // Check test coverage
    const coverageResult = executeCommand(
      'npm run test:coverage features/redundancy',
      { allowFailure: true, silent: true }
    );
    
    if (coverageResult) {
      logSuccess('Test suite completed');
    } else {
      logWarning('Some tests failed or coverage is below threshold');
    }
  } catch (error) {
    logWarning('Test execution encountered issues');
  }
}

async function bundleFeature() {
  logStep(6, 'Bundling feature assets');
  
  const bundleDir = path.join(CONFIG.buildDir, 'redundancy');
  ensureDirectoryExists(bundleDir);
  
  // Copy source files
  const filesToCopy = [
    'features/redundancy/index.ts',
    'features/redundancy/config.ts',
    'features/redundancy/types.ts',
    'features/redundancy/plugin.ts',
    'features/redundancy/components/',
    'features/redundancy/styles/',
    'features/redundancy/docs/'
  ];
  
  for (const file of filesToCopy) {
    const sourcePath = file;
    const destPath = path.join(bundleDir, path.basename(file));
    
    try {
      if (fs.statSync(sourcePath).isDirectory()) {
        executeCommand(`cp -r ${sourcePath} ${destPath}`);
      } else {
        copyFile(sourcePath, destPath);
      }
    } catch (error) {
      logWarning(`Failed to copy ${file}: ${error.message}`);
    }
  }
  
  logSuccess('Feature bundling completed');
}

async function generateManifest() {
  logStep(7, 'Generating feature manifest');
  
  const manifest = {
    name: CONFIG.featureName,
    id: CONFIG.featureId,
    version: CONFIG.version,
    description: 'Professional-grade power redundancy visualization for data centers',
    enabled: CONFIG.enabledFlag,
    buildTime: new Date().toISOString(),
    buildEnvironment: process.env.NODE_ENV || 'development',
    files: {
      entryPoint: 'index.ts',
      components: 'components/',
      styles: 'styles/',
      documentation: 'docs/',
      tests: '__tests__/'
    },
    dependencies: [],
    featureFlags: {
      'NEXT_PUBLIC_ENABLE_REDUNDANCY': CONFIG.enabledFlag
    },
    performance: {
      bundleSize: await getBundleSize(),
      loadTime: 'estimated <100ms',
      memoryUsage: 'estimated <5MB'
    },
    compatibility: {
      browsers: ['Chrome 90+', 'Firefox 88+', 'Safari 14+', 'Edge 90+'],
      nodejs: ['18.x', '20.x'],
      frameworks: ['Next.js 13+', 'React 18+']
    }
  };
  
  const manifestPath = path.join(CONFIG.buildDir, 'manifest.json');
  writeJsonFile(manifestPath, manifest);
  
  logSuccess('Feature manifest generated');
  
  return manifest;
}

async function getBundleSize() {
  try {
    const bundleDir = path.join(CONFIG.buildDir, 'redundancy');
    const result = executeCommand(`du -sh ${bundleDir}`, { silent: true });
    return result.trim().split('\t')[0];
  } catch {
    return 'unknown';
  }
}

async function runSecurityScan() {
  logStep(8, 'Running security scan');
  
  try {
    // Check for potential security issues
    const auditResult = executeCommand('npm audit --audit-level moderate', {
      allowFailure: true,
      silent: true
    });
    
    if (auditResult) {
      logSuccess('Security scan completed - no critical issues');
    } else {
      logWarning('Security audit found issues. Please review.');
    }
  } catch (error) {
    logWarning('Security scan could not be completed');
  }
}

async function generateDeploymentPackage() {
  logStep(9, 'Generating deployment package');
  
  const packageDir = path.join(CONFIG.buildDir, 'package');
  ensureDirectoryExists(packageDir);
  
  // Create deployment structure
  const deploymentStructure = {
    'README.md': 'docs/README.md',
    'package.json': generatePackageJson(),
    'features/': path.join(CONFIG.buildDir, 'redundancy'),
    'manifest.json': path.join(CONFIG.buildDir, 'manifest.json')
  };
  
  // Copy files to package directory
  for (const [dest, source] of Object.entries(deploymentStructure)) {
    const destPath = path.join(packageDir, dest);
    
    if (typeof source === 'string') {
      if (fs.existsSync(source)) {
        if (fs.statSync(source).isDirectory()) {
          executeCommand(`cp -r ${source} ${destPath}`);
        } else {
          copyFile(source, destPath);
        }
      }
    } else {
      writeJsonFile(destPath, source);
    }
  }
  
  // Create tarball
  const tarballName = `${CONFIG.featureId}-v${CONFIG.version}.tar.gz`;
  executeCommand(`tar -czf ${tarballName} -C ${packageDir} .`);
  
  logSuccess(`Deployment package created: ${tarballName}`);
}

function generatePackageJson() {
  return {
    name: `@datacenter/${CONFIG.featureId}`,
    version: CONFIG.version,
    description: 'Professional-grade power redundancy visualization for data centers',
    main: 'features/index.ts',
    types: 'features/types.ts',
    files: [
      'features/',
      'manifest.json',
      'README.md'
    ],
    scripts: {
      install: 'echo "Installing 2N+1 Redundancy Feature"',
      uninstall: 'echo "Uninstalling 2N+1 Redundancy Feature"'
    },
    keywords: [
      'redundancy',
      'power',
      'datacenter',
      'visualization',
      'react'
    ],
    author: 'Data Center Visualization Team',
    license: 'MIT',
    peerDependencies: {
      react: '>=18.0.0',
      'react-dom': '>=18.0.0'
    },
    engines: {
      node: '>=18.0.0'
    }
  };
}

async function runDeploymentValidation() {
  logStep(10, 'Running deployment validation');
  
  const validationChecks = [
    {
      name: 'Feature flag configuration',
      check: () => typeof CONFIG.enabledFlag === 'boolean'
    },
    {
      name: 'Manifest file exists',
      check: () => checkFileExists(path.join(CONFIG.buildDir, 'manifest.json'))
    },
    {
      name: 'Bundle directory exists',
      check: () => checkFileExists(path.join(CONFIG.buildDir, 'redundancy'))
    },
    {
      name: 'Required files present',
      check: () => {
        const requiredFiles = ['index.ts', 'config.ts', 'types.ts'];
        return requiredFiles.every(file =>
          checkFileExists(path.join(CONFIG.buildDir, 'redundancy', file))
        );
      }
    }
  ];
  
  let allPassed = true;
  
  for (const check of validationChecks) {
    try {
      if (check.check()) {
        logSuccess(`✓ ${check.name}`);
      } else {
        logError(`✗ ${check.name}`);
        allPassed = false;
      }
    } catch (error) {
      logError(`✗ ${check.name}: ${error.message}`);
      allPassed = false;
    }
  }
  
  if (allPassed) {
    logSuccess('All deployment validation checks passed');
  } else {
    logError('Some deployment validation checks failed');
    process.exit(1);
  }
}

async function printBuildSummary(manifest) {
  log('\n' + '='.repeat(60));
  log(`${colors.cyan}BUILD SUMMARY${colors.reset}`);
  log('='.repeat(60));
  log(`Feature: ${manifest.name}`);
  log(`Version: ${manifest.version}`);
  log(`Build Time: ${manifest.buildTime}`);
  log(`Environment: ${manifest.buildEnvironment}`);
  log(`Feature Enabled: ${manifest.enabled ? 'Yes' : 'No'}`);
  log(`Bundle Size: ${manifest.performance.bundleSize}`);
  log(`Files Generated: ${Object.keys(manifest.files).length}`);
  
  if (manifest.enabled) {
    logSuccess('Feature is ready for deployment');
  } else {
    logWarning('Feature is disabled and will not be active');
  }
  
  log('='.repeat(60) + '\n');
}

// Main build function
async function main() {
  const startTime = Date.now();
  
  log(`${colors.magenta}Building ${CONFIG.featureName} v${CONFIG.version}${colors.reset}\n`);
  
  try {
    await validateEnvironment();
    await cleanBuildDirectory();
    await runTypeScriptCompilation();
    await runLinting();
    await runTests();
    await bundleFeature();
    const manifest = await generateManifest();
    await runSecurityScan();
    await generateDeploymentPackage();
    await runDeploymentValidation();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    await printBuildSummary(manifest);
    
    logSuccess(`Build completed successfully in ${duration}s`);
    
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  main,
  CONFIG
};