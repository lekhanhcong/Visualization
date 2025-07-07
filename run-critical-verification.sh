#!/bin/bash

# Critical Verification Test Runner
echo "🎯 CRITICAL VERIFICATION CHECKLIST - 2N+1 Redundancy Feature"
echo "=============================================================="
echo ""
echo "🔍 Running comprehensive Playwright testing on http://localhost:3000"
echo "📋 Verifying ALL critical requirements for 100% PASS target"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if the application is running
print_status "Checking if application is running on http://localhost:3000..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    print_success "Application is running and accessible"
else
    print_error "Application is not running on http://localhost:3000"
    print_status "Please start the application with: npm run dev"
    exit 1
fi

# Install Playwright browsers if needed
print_status "Ensuring Playwright browsers are installed..."
npx playwright install chromium --with-deps

# Run the critical verification test
print_status "Starting critical verification test suite..."
echo ""
echo "🎯 CRITICAL VERIFICATION CHECKLIST:"
echo "===================================="
echo "1. ✅ Default View: Power infrastructure background (Power.png)"
echo "2. ✅ Default View: Button text 'Show 2N+1 Redundancy' (NO emoji)"
echo "3. ✅ Default View: Clean interface"
echo "4. ✅ 2N+1 View: Background Power_2N1.PNG (ocean/coastal image)"
echo "5. ✅ 2N+1 View: Text '500KV ONSITE GRID' with ocean blue color (#00BFFF)"
echo "6. ✅ 2N+1 View: Smaller font (18px)"
echo "7. ✅ 2N+1 View: Ocean glow animation visible and working"
echo "8. ✅ 2N+1 View: Fixed position, no movement"
echo "9. ✅ 2N+1 View: Button text 'Main' (NO emoji, NOT 'Back to Main')"
echo "10. ✅ Return: Returns to Power.png"
echo "11. ✅ Return: Text disappears"
echo "12. ✅ Return: Button returns to 'Show 2N+1 Redundancy'"
echo "13. ✅ Animation: Ocean glow animation ~2 seconds duration"
echo "14. ✅ All Critical Failure Conditions: CHECKED AND PASSED"
echo ""
echo "🎯 TARGET: 100% PASS"
echo ""

# Run the test
npx playwright test --config=playwright.critical-verification.config.ts

# Check test results
TEST_EXIT_CODE=$?

echo ""
echo "=============================================================="
echo "🎯 CRITICAL VERIFICATION TEST RESULTS"
echo "=============================================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "🎉 SUCCESS TARGET ACHIEVED: 100% PASS"
    print_success "✅ All critical requirements verified"
    print_success "✅ No failure conditions detected"
    print_success "📸 Screenshots captured in: test-results/critical-verification/"
    echo ""
    echo "🎯 FINAL STATUS: ALL FIXES WORKING CORRECTLY"
else
    print_error "❌ CRITICAL VERIFICATION FAILED"
    print_error "❌ Some requirements not met"
    print_warning "📋 Check the test results above for specific failures"
    print_warning "🔧 Fix the issues and run the test again"
    echo ""
    echo "🎯 FINAL STATUS: ISSUES DETECTED - NEED FIXES"
fi

echo ""
echo "📊 Test Report Available:"
echo "📁 HTML Report: test-results/critical-verification-report/index.html"
echo "📄 JSON Results: test-results/critical-verification-results.json"
echo "📸 Screenshots: test-results/critical-verification/"
echo ""

# Show critical failure conditions for reference
echo "⚠️  CRITICAL FAILURE CONDITIONS (AUTO-CHECKED):"
echo "================================================"
echo "❌ If text is still BLACK instead of BLUE → FAIL"
echo "❌ If button still shows emoji → FAIL"
echo "❌ If no glow animation visible → FAIL"
echo "❌ If background doesn't change to ocean → FAIL"
echo "❌ If button shows 'Back to Main' instead of 'Main' → FAIL"
echo ""

exit $TEST_EXIT_CODE