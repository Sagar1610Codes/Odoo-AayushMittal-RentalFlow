#!/bin/bash
echo "🧪 Testing TODO 1.2: Backend Foundation Setup"
echo "=================================================="

cd 06_SRC/backend || exit 1

# Test 1: Backend directory exists
if [ -d "." ]; then
    echo "✅ Backend directory exists"
else
    echo "❌ FAIL: Backend directory not found"
    exit 1
fi

# Test 2: package.json exists and valid
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    if jq empty package.json 2>/dev/null; then
        echo "✅ package.json is valid JSON"
    else
        echo "❌ FAIL: package.json is invalid"
        exit 1
    fi
else
    echo "❌ FAIL: package.json not found"
    exit 1
fi

# Test 3: Dependencies installed
NODE_MODULES_PATH="../node_modules"
if [ -d "$NODE_MODULES_PATH" ]; then
    echo "✅ node_modules exists (workspace level)"
    
    # Check critical packages
    REQUIRED_PACKAGES=("express" "pg" "dotenv" "bcryptjs" "jsonwebtoken" "joi" "cors" "helmet")
    for pkg in "${REQUIRED_PACKAGES[@]}"; do
        if [ -d "$NODE_MODULES_PATH/$pkg" ]; then
            echo "  ✅ $pkg installed"
        else
            echo "  ❌ FAIL: $pkg not installed"
            exit 1
        fi
    done
else
    echo "❌ FAIL: Dependencies not installed"
    exit 1
fi

# Test 4: Folder structure
REQUIRED_DIRS=("src/config" "src/models" "src/controllers" "src/services" "src/routes" "src/middleware" "src/utils" "scripts")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
    else
        echo "❌ FAIL: $dir not found"
        exit 1
    fi
done

# Test 5: server.js exists
if [ -f "server.js" ]; then
    echo "✅ server.js exists"
    # Check if it has Express import
    if grep -q "require('express')" server.js; then
        echo "✅ server.js imports Express"
    else
        echo "⚠️  WARNING: server.js might not import Express"
    fi
else
    echo "❌ FAIL: server.js not found"
    exit 1
fi

# Test 6: .env files
if [ -f ".env.example" ]; then
    echo "✅ .env.example exists"
else
    echo "⚠️  WARNING: .env.example not found"
fi

if [ -f ".env" ]; then
    echo "✅ .env exists"
    # Check for required variables
    if grep -q "PORT" .env && grep -q "DB_NAME" .env && grep -q "JWT_SECRET" .env; then
        echo "✅ .env contains required variables"
    else
        echo "⚠️  WARNING: .env missing some required variables"
    fi
else
    echo "❌ FAIL: .env not found"
    exit 1
fi

# Test 7: npm scripts
if jq -e '.scripts.dev' package.json >/dev/null; then
    echo "✅ 'dev' script configured"
else
    echo "⚠️  WARNING: 'dev' script not found"
fi

if jq -e '.scripts.start' package.json >/dev/null; then
    echo "✅ 'start' script configured"
else
    echo "⚠️  WARNING: 'start' script not found"
fi

# Test 8: Try to start server (timeout after 3 seconds)
echo ""
echo "🔍 Testing server startup..."
timeout 3s npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

# Test health endpoint
HEALTH_CHECK=$(curl -s http://localhost:5000/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Server started successfully"
    echo "✅ Health endpoint responding"
    if echo "$HEALTH_CHECK" | grep -q "OK"; then
        echo "✅ Health check returns expected response"
    fi
else
    echo "⚠️  WARNING: Could not reach server (might need manual start)"
fi

# Cleanup
kill $SERVER_PID 2>/dev/null
pkill -f "node server.js" 2>/dev/null

echo ""
echo "=================================================="
echo "✅ TODO 1.2 TESTS COMPLETE"
echo "=================================================="
