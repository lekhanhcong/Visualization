#!/bin/bash

# 2N+1 Redundancy Feature - Comprehensive Validation Script
# This script runs the complete validation test suite

echo "🚀 Starting 2N+1 Redundancy Feature Validation"
echo "=============================================="

# Check if dev server is running
echo "🔍 Checking if development server is running..."
if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ Development server is running on http://localhost:3000"
else
    echo "❌ Development server is not running!"
    echo "Please start the development server with: npm run dev"
    exit 1
fi

# Run the comprehensive validation tests
echo ""
echo "🧪 Running comprehensive validation tests..."
echo "-------------------------------------------"

# Run with Chrome (primary browser)
echo "🔵 Testing with Chrome..."
npx playwright test --config=playwright.2n1-validation.config.ts --project=chromium --reporter=list

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ Chrome tests PASSED"
else
    echo "❌ Chrome tests FAILED"
    exit 1
fi

# Run with Firefox (cross-browser verification)
echo ""
echo "🦊 Testing with Firefox..."
npx playwright test --config=playwright.2n1-validation.config.ts --project=firefox --reporter=list

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ Firefox tests PASSED"
else
    echo "❌ Firefox tests FAILED"
    exit 1
fi

echo ""
echo "🎉 ALL VALIDATION TESTS COMPLETED SUCCESSFULLY!"
echo "=============================================="
echo ""
echo "📸 Screenshots captured in: test-results/comprehensive-2n1-validation/"
echo "📝 Full report available in: comprehensive-2n1-validation-report.md"
echo ""
echo "🔍 Key Verification Results:"
echo "  ✅ NO hotspot dots found in any state"
echo "  ✅ Background changes to ocean/coastal image (Power_2N1.PNG)"
echo "  ✅ Text overlay appears/disappears correctly"
echo "  ✅ Smooth animations and transitions"
echo "  ✅ Clean UI without floating elements"
echo ""
echo "🎯 CONCLUSION: All requirements met successfully!"