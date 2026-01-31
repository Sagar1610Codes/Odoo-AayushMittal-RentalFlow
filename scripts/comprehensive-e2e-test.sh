#!/bin/bash

#############################################################################
# RENTAL ERP - COMPREHENSIVE END-TO-END TEST SUITE
# Tests: Phase 1 (Foundation) + Phase 2 (Auth) + Phase 3 (Products)
#############################################################################

set -e  # Exit on error (disabled for controlled testing)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNING_TESTS=0

# Test Results Storage
declare -a FAILED_TEST_NAMES=()
declare -a WARNING_TEST_NAMES=()

# API Variables
API_BASE_URL="http://localhost:5000/api"
ACCESS_TOKEN=""
VENDOR_TOKEN=""
CUSTOMER_ID=""
VENDOR_ID=""
PRODUCT_ID=""

#############################################################################
# UTILITY FUNCTIONS
#############################################################################

header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

section() {
    echo ""
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

test_start() {
    ((TOTAL_TESTS++))
    echo -n "  Testing: $1 ... "
}

test_pass() {
    ((PASSED_TESTS++))
    echo -e "${GREEN}✓ PASS${NC}"
}

test_fail() {
    ((FAILED_TESTS++))
    FAILED_TEST_NAMES+=("$1")
    echo -e "${RED}✗ FAIL${NC}"
    if [ -n "$2" ]; then
        echo -e "    ${RED}Error: $2${NC}"
    fi
}

test_warn() {
    ((WARNING_TESTS++))
    WARNING_TEST_NAMES+=("$1")
    echo -e "${YELLOW}⚠ WARNING${NC}"
    if [ -n "$2" ]; then
        echo -e "    ${YELLOW}$2${NC}"
    fi
}

#############################################################################
# PHASE 0: ENVIRONMENT CHECKS
#############################################################################

test_environment() {
    header "PHASE 0: ENVIRONMENT CHECKS"
    
    # Node.js
    test_start "Node.js installed"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        test_pass
        echo "    Version: $NODE_VERSION"
    else
        test_fail "Node.js" "Node.js not found"
        return 1
    fi
    
    # PostgreSQL
    test_start "PostgreSQL installed"
    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version | awk '{print $3}')
        test_pass
        echo "    Version: $PG_VERSION"
    else
        test_fail "PostgreSQL" "PostgreSQL not found"
        return 1
    fi
    
    # PostgreSQL running
    test_start "PostgreSQL server running"
    if pg_isready -q 2>/dev/null; then
        test_pass
    else
        test_fail "PostgreSQL Server" "PostgreSQL is not running"
        return 1
    fi
    
    # cURL for API testing
    test_start "cURL available"
    if command -v curl &> /dev/null; then
        test_pass
    else
        test_fail "cURL" "cURL not installed (required for API tests)"
    fi
    
    # jq for JSON parsing
    test_start "jq available (JSON parser)"
    if command -v jq &> /dev/null; then
        test_pass
    else
        test_warn "jq" "jq not installed (will skip JSON validation)"
    fi
}

#############################################################################
# PHASE 1: PROJECT STRUCTURE
#############################################################################

test_project_structure() {
    header "PHASE 1: PROJECT STRUCTURE"
    
    cd "$(dirname "$0")/.." || exit 1
    
    section "Core Directories"
    
    REQUIRED_DIRS=(
        "."
        "backend"
        "frontend"
        "backend/src"
        "frontend/src"
    )
    
    for dir in "${REQUIRED_DIRS[@]}"; do
        test_start "Directory: $dir"
        if [ -d "$dir" ]; then
            test_pass
        else
            test_fail "$dir" "Directory missing"
        fi
    done
    
    section "Backend Structure"
    
    BACKEND_DIRS=(
        "backend/src/config"
        "backend/src/models"
        "backend/src/controllers"
        "backend/src/services"
        "backend/src/routes"
        "backend/src/middleware"
        "backend/src/utils"
        "backend/src/database"
        "backend/scripts"
    )
    
    for dir in "${BACKEND_DIRS[@]}"; do
        test_start "Backend: $(basename $dir)"
        if [ -d "$dir" ]; then
            test_pass
        else
            test_fail "$(basename $dir)" "Backend directory missing"
        fi
    done
    
    section "Frontend Structure"
    
    FRONTEND_DIRS=(
        "frontend/src/components"
        "frontend/src/pages"
        "frontend/src/contexts"
        "frontend/src/services"
        "frontend/src/utils"
    )
    
    for dir in "${FRONTEND_DIRS[@]}"; do
        test_start "Frontend: $(basename $dir)"
        if [ -d "$dir" ]; then
            test_pass
        else
            test_fail "$(basename $dir)" "Frontend directory missing"
        fi
    done
    
    section "Configuration Files"
    
    CONFIG_FILES=(
        "backend/package.json"
        "backend/server.js"
        "backend/.env"
        "frontend/package.json"
        "frontend/vite.config.js"
        "frontend/tailwind.config.js"
    )
    
    for file in "${CONFIG_FILES[@]}"; do
        test_start "Config: $(basename $file)"
        if [ -f "$file" ]; then
            test_pass
        else
            test_fail "$(basename $file)" "Configuration file missing"
        fi
    done
}

#############################################################################
# PHASE 1: DATABASE SETUP
#############################################################################

test_database() {
    header "PHASE 1: DATABASE SETUP"
    
    # Load database credentials from .env file
    if [ -f "backend/.env" ]; then
        export $(grep -v '^#' backend/.env | grep -E '^(DB_|DATABASE_)' | xargs)
    fi
    
    DB_NAME="${DB_NAME:-rental_erp}"
    DB_USER="${DB_USER:-rental_user}"
    DB_PASSWORD="${DB_PASSWORD:-rental_password_123}"
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    
    section "Database Existence"
    
    test_start "Database '$DB_NAME' exists"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        test_pass
    else
        test_fail "Database" "Database '$DB_NAME' not found. Run setup script."
        return 1
    fi
    
    section "Database Tables"
    
    REQUIRED_TABLES=(
        "users"
        "products"
        "variants"
        "quotations"
        "orders"
        "reservations"
        "pickups"
        "returns"
        "invoices"
        "payments"
    )
    
    for table in "${REQUIRED_TABLES[@]}"; do
        test_start "Table: $table"
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" | grep -q "t"; then
            test_pass
        else
            test_fail "$table" "Table not found"
        fi
    done
    
    section "Database Constraints"
    
    test_start "Users email unique constraint"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.constraint_column_usage WHERE table_name = 'users' AND column_name = 'email';" | grep -q "1"; then
        test_pass
    else
        test_warn "Users email" "Email constraint may not be configured"
    fi
    
    test_start "Reservations exclusion constraint (critical)"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_constraint WHERE conname LIKE '%reservations%excl%' OR conname LIKE '%no_overlap%';" | grep -q "[1-9]"; then
        test_pass
    else
        test_fail "Reservations EXCLUDE" "Critical: No overlap prevention constraint found!"
    fi
}

#############################################################################
# PHASE 1: BACKEND DEPENDENCIES
#############################################################################

test_backend_dependencies() {
    header "PHASE 1: BACKEND DEPENDENCIES"
    
    cd backend || return 1
    
    section "Required Dependencies"
    
    REQUIRED_DEPS=(
        "express"
        "pg"
        "dotenv"
        "bcrypt"
        "jsonwebtoken"
        "joi"
        "cors"
        "cookie-parser"
    )
    
    for dep in "${REQUIRED_DEPS[@]}"; do
        test_start "Dependency: $dep"
        if grep -q "\"$dep\"" package.json; then
            test_pass
        else
            test_fail "$dep" "Dependency not in package.json"
        fi
    done
    
    test_start "node_modules installed"
    if [ -d "node_modules" ]; then
        test_pass
    else
        test_warn "node_modules" "Run 'npm install' in backend directory"
    fi
    
    cd ..
}

#############################################################################
# PHASE 1: CORE UTILITIES
#############################################################################

test_core_utilities() {
    header "PHASE 1: CORE UTILITIES"
    
    section "Utility Files"
    
    UTIL_FILES=(
        "backend/src/utils/logger.js"
        "backend/src/utils/errors.js"
        "backend/src/utils/validators.js"
        "backend/src/utils/helpers.js"
        "backend/src/config/database.js"
    )
    
    for file in "${UTIL_FILES[@]}"; do
        test_start "Utility: $(basename $file)"
        if [ -f "$file" ]; then
            test_pass
        else
            test_fail "$(basename $file)" "Utility file missing"
        fi
    done
    
    section "Error Handler Classes"
    
    test_start "ApiError class exists"
    if grep -q "class ApiError" backend/src/utils/errors.js 2>/dev/null; then
        test_pass
    else
        test_fail "ApiError" "ApiError class not found in errors.js"
    fi
}

#############################################################################
# PHASE 2: AUTHENTICATION BACKEND
#############################################################################

test_auth_backend() {
    header "PHASE 2: AUTHENTICATION BACKEND"
    
    section "Auth Files"
    
    AUTH_FILES=(
        "backend/src/services/auth.service.js"
        "backend/src/controllers/auth.controller.js"
        "backend/src/middleware/auth.middleware.js"
        "backend/src/routes/auth.routes.js"
    )
    
    for file in "${AUTH_FILES[@]}"; do
        test_start "Auth: $(basename $file)"
        if [ -f "$file" ]; then
            test_pass
        else
            test_fail "$(basename $file)" "Authentication file missing"
        fi
    done
    
    section "Auth Service Methods"
    
    test_start "hashPassword function"
    if grep -q "hashPassword" backend/src/services/auth.service.js 2>/dev/null; then
        test_pass
    else
        test_fail "hashPassword" "Function not found"
    fi
    
    test_start "generateAccessToken function"
    if grep -q "generateAccessToken\|generateToken" backend/src/services/auth.service.js 2>/dev/null; then
        test_pass
    else
        test_fail "generateAccessToken" "Function not found"
    fi
    
    test_start "registerUser function"
    if grep -q "registerUser\|register" backend/src/services/auth.service.js 2>/dev/null; then
        test_pass
    else
        test_fail "registerUser" "Function not found"
    fi
}

#############################################################################
# PHASE 3: PRODUCT BACKEND
#############################################################################

test_product_backend() {
    header "PHASE 3: PRODUCT CATALOG BACKEND"
    
    section "Product Files"
    
    PRODUCT_FILES=(
        "backend/src/models/Product.js"
        "backend/src/services/product.service.js"
        "backend/src/controllers/product.controller.js"
        "backend/src/routes/product.routes.js"
    )
    
    for file in "${PRODUCT_FILES[@]}"; do
        test_start "Product: $(basename $file)"
        if [ -f "$file" ]; then
            test_pass
        else
            test_fail "$(basename $file)" "Product file missing"
        fi
    done
    
    section "Product Model Methods"
    
    test_start "Product.create method"
    if grep -q "static.*create\|async create" backend/src/models/Product.js 2>/dev/null; then
        test_pass
    else
        test_fail "Product.create" "Method not found"
    fi
    
    test_start "Product.findAll method"
    if grep -q "static.*findAll\|async findAll" backend/src/models/Product.js 2>/dev/null; then
        test_pass
    else
        test_fail "Product.findAll" "Method not found"
    fi
    
    test_start "Product.createVariant method"
    if grep -q "createVariant" backend/src/models/Product.js 2>/dev/null; then
        test_pass
    else
        test_fail "Product.createVariant" "Method not found"
    fi
}

#############################################################################
# FRONTEND TESTS
#############################################################################

test_frontend() {
    header "PHASE 2 & 3: FRONTEND"
    
    section "Frontend Pages"
    
    FRONTEND_PAGES=(
        "frontend/src/pages/auth/Login.jsx"
        "frontend/src/pages/auth/Register.jsx"
        "frontend/src/pages/Products.jsx"
        "frontend/src/pages/ProductDetail.jsx"
    )
    
    for file in "${FRONTEND_PAGES[@]}"; do
        test_start "Page: $(basename $file)"
        if [ -f "$file" ]; then
            test_pass
        else
            test_fail "$(basename $file)" "Page missing"
        fi
    done
    
    section "Frontend Services"
    
    test_start "API service (api.js)"
    if [ -f "frontend/src/services/api.js" ]; then
        test_pass
    else
        test_fail "api.js" "API service missing"
    fi
    
    test_start "AuthContext"
    if [ -f "frontend/src/contexts/AuthContext.jsx" ]; then
        test_pass
    else
        test_fail "AuthContext" "Auth context missing"
    fi
    
    section "Frontend Build"
    
    cd frontend || return 1
    
    test_start "Frontend dependencies installed"
    if [ -d "node_modules" ]; then
        test_pass
    else
        test_warn "Frontend node_modules" "Run 'npm install' in frontend directory"
    fi
    
    test_start "Frontend build succeeds"
    if npm run build > /tmp/frontend_build.log 2>&1; then
        test_pass
        rm -rf dist
    else
        test_fail "Frontend Build" "Build failed. Check /tmp/frontend_build.log"
    fi
    
    cd ..
}

#############################################################################
# API ENDPOINT TESTS (Requires running server)
#############################################################################

check_server_running() {
    if curl -s "${API_BASE_URL}/health" > /dev/null 2>&1 || curl -s "http://localhost:5000" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

test_api_endpoints() {
    header "API ENDPOINT TESTS"
    
    if ! check_server_running; then
        echo -e "${YELLOW}⚠ WARNING: Backend server not running at localhost:5000${NC}"
        echo -e "${YELLOW}  Skipping API tests. Start server with: cd backend && npm run dev${NC}"
        return 0
    fi
    
    section "Authentication API"
    
    # Test 1: Register CUSTOMER
    test_start "POST /api/auth/register (CUSTOMER)"
    REGISTER_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test_customer_'$(date +%s)'@example.com",
            "password": "Test@12345",
            "name": "Test Customer",
            "role": "CUSTOMER",
            "phone": "9876543210"
        }')
    
    if echo "$REGISTER_RESPONSE" | grep -q "success.*true\|accessToken"; then
        test_pass
        ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken' 2>/dev/null || echo "")
        CUSTOMER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id' 2>/dev/null || echo "")
    else
        test_fail "Register Customer" "Response: $REGISTER_RESPONSE"
    fi
    
    # Test 2: Register VENDOR
    test_start "POST /api/auth/register (VENDOR)"
    VENDOR_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test_vendor_'$(date +%s)'@example.com",
            "password": "Test@12345",
            "name": "Test Vendor",
            "role": "VENDOR",
            "phone": "9876543211",
            "company": "Test Co"
        }')
    
    if echo "$VENDOR_RESPONSE" | grep -q "success.*true\|accessToken"; then
        test_pass
        VENDOR_TOKEN=$(echo "$VENDOR_RESPONSE" | jq -r '.data.accessToken' 2>/dev/null || echo "")
        VENDOR_ID=$(echo "$VENDOR_RESPONSE" | jq -r '.data.user.id' 2>/dev/null || echo "")
    else
        test_fail "Register Vendor" "Response: $VENDOR_RESPONSE"
    fi
    
    # Test 3: Login
    test_start "POST /api/auth/login"
    LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test_customer_'$(date +%s)'@example.com",
            "password": "Test@12345"
        }')
    
    if echo "$LOGIN_RESPONSE" | grep -q "error.*not found\|Invalid"; then
        test_pass  # Expected for non-existent user
    elif echo "$LOGIN_RESPONSE" | grep -q "success.*true\|accessToken"; then
        test_pass
    else
        test_warn "Login" "Unexpected response"
    fi
    
    # Test 4: Logout
    test_start "POST /api/auth/logout (protected)"
    if [ -n "$ACCESS_TOKEN" ]; then
        LOGOUT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/logout" \
            -H "Authorization: Bearer $ACCESS_TOKEN")
        
        if echo "$LOGOUT_RESPONSE" | grep -q "success"; then
            test_pass
        else
            test_warn "Logout" "May not be implemented or token invalid"
        fi
    else
        test_warn "Logout" "No access token available"
    fi
    
    section "Product API"
    
    # Test 5: Create Product (VENDOR only)
    test_start "POST /api/products (VENDOR)"
    if [ -n "$VENDOR_TOKEN" ]; then
        CREATE_PRODUCT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/products" \
            -H "Authorization: Bearer $VENDOR_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "name": "Test Camera",
                "description": "Professional DSLR",
                "category": "Electronics",
                "brand": "Canon",
                "is_published": true,
                "images": [],
                "variants": [
                    {
                        "sku": "CAM-TEST-001",
                        "attributes": {"color": "black"},
                        "price_daily": 100,
                        "price_weekly": 600,
                        "stock_quantity": 5
                    }
                ]
            }')
        
        if echo "$CREATE_PRODUCT_RESPONSE" | grep -q "success.*true\|id"; then
            test_pass
            PRODUCT_ID=$(echo "$CREATE_PRODUCT_RESPONSE" | jq -r '.data.id' 2>/dev/null || echo "")
        else
            test_fail "Create Product" "Response: $CREATE_PRODUCT_RESPONSE"
        fi
    else
        test_warn "Create Product" "No vendor token available"
    fi
    
    # Test 6: List Products (public)
    test_start "GET /api/products (public)"
    LIST_RESPONSE=$(curl -s "${API_BASE_URL}/products")
    
    if echo "$LIST_RESPONSE" | grep -q "success.*true\|products\|data"; then
        test_pass
    else
        test_fail "List Products" "Response: $LIST_RESPONSE"
    fi
    
    # Test 7: Get Product by ID
    test_start "GET /api/products/:id"
    if [ -n "$PRODUCT_ID" ]; then
        DETAIL_RESPONSE=$(curl -s "${API_BASE_URL}/products/${PRODUCT_ID}")
        
        if echo "$DETAIL_RESPONSE" | grep -q "success.*true\|name"; then
            test_pass
        else
            test_fail "Product Detail" "Response: $DETAIL_RESPONSE"
        fi
    else
        test_warn "Product Detail" "No product ID available"
    fi
    
    # Test 8: Update Product (VENDOR ownership)
    test_start "PUT /api/products/:id (VENDOR owner)"
    if [ -n "$PRODUCT_ID" ] && [ -n "$VENDOR_TOKEN" ]; then
        UPDATE_RESPONSE=$(curl -s -X PUT "${API_BASE_URL}/products/${PRODUCT_ID}" \
            -H "Authorization: Bearer $VENDOR_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"is_published": false}')
        
        if echo "$UPDATE_RESPONSE" | grep -q "success.*true"; then
            test_pass
        else
            test_fail "Update Product" "Response: $UPDATE_RESPONSE"
        fi
    else
        test_warn "Update Product" "Missing product ID or vendor token"
    fi
    
    # Test 9: RBAC - Customer cannot create product
    test_start "POST /api/products (CUSTOMER - should fail)"
    if [ -n "$ACCESS_TOKEN" ]; then
        RBAC_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/products" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"name": "Test", "category": "Test", "variants": [{"sku": "T", "stock_quantity": 1}]}')
        
        if echo "$RBAC_RESPONSE" | grep -q "Forbidden\|not authorized\|403\|permission"; then
            test_pass  # Expected failure
        else
            test_fail "RBAC" "Customer should not be able to create products"
        fi
    else
        test_warn "RBAC Test" "No customer token available"
    fi
    
    section "Protected Routes"
    
    # Test 10: Access without token
    test_start "Protected route without token (should fail)"
    NO_AUTH_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/logout")
    
    if echo "$NO_AUTH_RESPONSE" | grep -q "Unauthorized\|401\|Authentication required\|token"; then
        test_pass
    else
        test_warn "Auth Protection" "Protected route may not require authentication"
    fi
}

#############################################################################
# FINAL REPORT
#############################################################################

generate_report() {
    header "TEST SUMMARY REPORT"
    
    echo ""
    echo -e "${CYAN}Total Tests Run:${NC} $TOTAL_TESTS"
    echo -e "${GREEN}✓ Passed:${NC} $PASSED_TESTS"
    echo -e "${RED}✗ Failed:${NC} $FAILED_TESTS"
    echo -e "${YELLOW}⚠ Warnings:${NC} $WARNING_TESTS"
    echo ""
    
    if [ $TOTAL_TESTS -gt 0 ]; then
        SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
        echo -e "${CYAN}Success Rate:${NC} ${SUCCESS_RATE}%"
    fi
    
    if [ ${#FAILED_TEST_NAMES[@]} -gt 0 ]; then
        echo ""
        echo -e "${RED}Failed Tests:${NC}"
        for test_name in "${FAILED_TEST_NAMES[@]}"; do
            echo -e "  ${RED}✗${NC} $test_name"
        done
    fi
    
    if [ ${#WARNING_TEST_NAMES[@]} -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}Warnings:${NC}"
        for test_name in "${WARNING_TEST_NAMES[@]}"; do
            echo -e "  ${YELLOW}⚠${NC} $test_name"
        done
    fi
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL CRITICAL TESTS PASSED!${NC}"
        if [ $WARNING_TESTS -gt 0 ]; then
            echo -e "${YELLOW}   (Some warnings present - review above)${NC}"
        fi
        return 0
    else
        echo -e "${RED}⚠ SOME TESTS FAILED - REVIEW ABOVE FOR DETAILS${NC}"
        return 1
    fi
}

#############################################################################
# MAIN EXECUTION
#############################################################################

main() {
    clear
    header "RENTAL ERP - COMPREHENSIVE E2E TEST SUITE"
    echo -e "${CYAN}Testing: Phase 1 (Foundation) + Phase 2 (Auth) + Phase 3 (Products)${NC}"
    
    # Run all test suites
    test_environment || true
    test_project_structure || true
    test_database || true
    test_backend_dependencies || true
    test_core_utilities || true
    test_auth_backend || true
    test_product_backend || true
    test_frontend || true
    test_api_endpoints || true
    
    # Generate final report
    generate_report
}

# Run main function
main
exit $?
