#!/bin/bash

# Script to run 2N+1 testing with proper environment setup

echo "=== Starting 2N+1 Redundancy Feature Test ==="

# Set environment variable for redundancy feature
export NEXT_PUBLIC_ENABLE_REDUNDANCY=true

# Kill any existing dev server
echo "Stopping any existing dev server..."
pkill -f "next dev" || true
sleep 2

# Start dev server with redundancy enabled
echo "Starting dev server with 2N+1 feature enabled..."
npm run dev &
DEV_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Function to check if server is ready
check_server() {
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
}

# Wait for server to be ready
echo "Checking server status..."
for i in {1..30}; do
    if [ "$(check_server)" = "200" ]; then
        echo "Server is ready!"
        break
    fi
    echo "Waiting for server... (attempt $i/30)"
    sleep 2
done

# Run the test
echo "Running 2N+1 test..."
node - <<'EOF'
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runTest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('=== 2N+1 Feature Test Started ===');
    
    try {
        // Navigate to the app
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(3000);
        
        // Take initial screenshot
        await page.screenshot({ path: 'test-initial.png', fullPage: true });
        console.log('✓ Initial screenshot captured');
        
        // Look for the toggle button
        const toggleButton = await page.locator('[data-testid="simple-redundancy-toggle"]');
        if (await toggleButton.isVisible()) {
            console.log('✓ Toggle button found');
            
            // Click the toggle button
            await toggleButton.click();
            await page.waitForTimeout(1000);
            
            // Take screenshot after toggle
            await page.screenshot({ path: 'test-toggled.png', fullPage: true });
            console.log('✓ Toggle screenshot captured');
            
            // Click back
            await toggleButton.click();
            await page.waitForTimeout(1000);
            
            // Take final screenshot
            await page.screenshot({ path: 'test-final.png', fullPage: true });
            console.log('✓ Final screenshot captured');
            
            console.log('✓ Test completed successfully!');
        } else {
            console.log('✗ Toggle button not found - feature may not be enabled');
        }
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

runTest();
EOF

# Stop the dev server
echo "Stopping dev server..."
kill $DEV_PID 2>/dev/null || true

echo "=== Test completed ==="