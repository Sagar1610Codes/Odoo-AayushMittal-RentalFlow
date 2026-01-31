#!/bin/bash
echo "🧪 Testing TODO 1.1: Project Structure Initialization"
echo "=================================================="

# Test 1: Check 06_SRC exists
if [ -d "06_SRC" ]; then
    echo "✅ 06_SRC directory exists"
else
    echo "❌ FAIL: 06_SRC directory not found"
    exit 1
fi

cd 06_SRC

# Test 2: Check Git initialization
if [ -d ".git" ]; then
    echo "✅ Git repository initialized"
else
    echo "❌ FAIL: Git not initialized in 06_SRC"
    exit 1
fi

# Test 3: Check .gitignore exists
if [ -f ".gitignore" ]; then
    echo "✅ .gitignore exists"
    # Check key entries
    if grep -q "node_modules" .gitignore && grep -q ".env" .gitignore; then
        echo "✅ .gitignore contains essential entries"
    else
        echo "⚠️  WARNING: .gitignore missing important entries"
    fi
else
    echo "❌ FAIL: .gitignore not found"
    exit 1
fi

# Test 4: Check package.json
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    # Check if it's valid JSON
    if jq empty package.json 2>/dev/null; then
        echo "✅ package.json is valid JSON"
    else
        echo "❌ FAIL: package.json is invalid JSON"
        exit 1
    fi
    # Check workspaces
    if jq -e '.workspaces[] | select(. == "backend")' package.json >/dev/null; then
        echo "✅ backend workspace configured"
    else
        echo "⚠️  WARNING: backend workspace not found"
    fi
else
    echo "❌ FAIL: package.json not found"
    exit 1
fi

# Test 5: Check Git commits
COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo 0)
if [ "$COMMIT_COUNT" -gt 0 ]; then
    echo "✅ Git has commits (count: $COMMIT_COUNT)"
    echo "   Latest: $(git log -1 --oneline)"
else
    echo "⚠️  WARNING: No Git commits yet"
fi

# Test 6: Check Git config
GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)
if [ -n "$GIT_USER" ] && [ -n "$GIT_EMAIL" ]; then
    echo "✅ Git user configured: $GIT_USER <$GIT_EMAIL>"
else
    echo "⚠️  WARNING: Git user not configured"
fi

echo ""
echo "=================================================="
echo "✅ TODO 1.1 TESTS COMPLETE"
echo "=================================================="
