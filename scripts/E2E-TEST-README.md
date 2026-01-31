# Comprehensive E2E Test Suite - README

## Overview
This is the **complete end-to-end test suite** for the Rental ERP project. It validates all implemented features across Phase 1 (Foundation), Phase 2 (Authentication), and Phase 3 (Product Catalog).

## What It Tests

### Phase 0: Environment (5 tests)
- ✅ Node.js installation and version
- ✅ PostgreSQL installation and version  
- ✅ PostgreSQL server running status
- ✅ cURL availability for API testing
- ✅ jq availability for JSON parsing

### Phase 1: Foundation (40+ tests)
**Project Structure:**
- Core directories (06_SRC, backend, frontend)
- Backend structure (8 directories)
- Frontend structure (5 directories)
- Configuration files (package.json, .env, vite.config.js, etc.)

**Database Setup:**
- Database existence check
- All 10 tables (users, products, variants, quotations, orders, reservations, pickups, returns, invoices, payments)
- Critical constraints (email unique, reservation overlap prevention)

**Backend Dependencies:**
- Express, pg, dotenv, bcrypt, jsonwebtoken, Joi, cors, cookie-parser
- node_modules installation check

**Core Utilities:**
- Logger, error handler, validators, helpers
- Database config
- ApiError class validation

### Phase 2: Authentication (15+ tests)
**Backend Files:**
- auth.service.js
- auth.controller.js
- auth.middleware.js
- auth.routes.js

**Service Methods:**
- hashPassword function
- generateAccessToken function
- registerUser function

**API Endpoints (if server running):**
- POST /api/auth/register (CUSTOMER)
- POST /api/auth/register (VENDOR)
- POST /api/auth/login
- POST /api/auth/logout

### Phase 3: Product Catalog (20+ tests)
**Backend Files:**
- Product model
- Product service
- Product controller
- Product routes

**Model Methods:**
- Product.create
- Product.findAll
- Product.createVariant

**API Endpoints (if server running):**
- POST /api/products (VENDOR only)
- GET /api/products (public)
- GET /api/products/:id
- PUT /api/products/:id (ownership check)
- RBAC validation (Customer cannot create)

**Frontend:**
- Login.jsx, Register.jsx
- Products.jsx, ProductDetail.jsx
- API service, AuthContext
- Frontend build validation

### Security & RBAC Tests
- Protected routes without token (401)
- Customer attempting vendor actions (403)
- Vendor ownership validation

## Usage

### Prerequisites
1. **Database Setup:**
   ```bash
   cd 06_SRC/backend/scripts
   sudo ./quick-setup.sh
   ```

2. **Install Dependencies:**
   ```bash
   # Backend
   cd 06_SRC/backend
   npm install
   
   # Frontend
   cd 06_SRC/frontend
   npm install
   ```

### Running Tests

#### Option 1: Without API Server (Structural Tests Only)
```bash
cd /path/to/GENERAL_PROJECT_TEMPLATE
./06_SRC/scripts/comprehensive-e2e-test.sh
```

This will test:
- File structure
- Database schema
- Code structure
- Dependencies
- Frontend build

**Skips:** API endpoint tests

#### Option 2: With API Server (Full E2E)
```bash
# Terminal 1: Start Backend
cd 06_SRC/backend
npm run dev

# Terminal 2: Run Tests
cd /path/to/GENERAL_PROJECT_TEMPLATE
./06_SRC/scripts/comprehensive-e2e-test.sh
```

This tests **everything**, including:
- All structural tests
- Live API endpoints
- Authentication flows
- Product CRUD operations
- RBAC enforcement

## Test Output

The script provides color-coded output:
- 🟢 **GREEN** = Test passed
- 🔴 **RED** = Test failed (critical issue)
- 🟡 **YELLOW** = Warning (non-critical)

### Example Output:
```
═══════════════════════════════════════════════════════════════
  PHASE 0: ENVIRONMENT CHECKS
═══════════════════════════════════════════════════════════════

━━━ Environment ━━━
  Testing: Node.js installed ... ✓ PASS
    Version: v18.17.0
  Testing: PostgreSQL installed ... ✓ PASS
    Version: 14.5
  Testing: PostgreSQL server running ... ✓ PASS
  Testing: cURL available ... ✓ PASS
  Testing: jq available (JSON parser) ... ✓ PASS

...

═══════════════════════════════════════════════════════════════
  TEST SUMMARY REPORT
═══════════════════════════════════════════════════════════════

Total Tests Run: 95
✓ Passed: 92
✗ Failed: 1
⚠ Warnings: 2

Success Rate: 96%

🎉 ALL CRITICAL TESTS PASSED!
   (Some warnings present - review above)
```

## Interpreting Results

### 100% Pass = Production Ready ✅
All systems operational, ready for deployment.

### 90-99% Pass = Minor Issues ⚠️
Check warnings:
- Missing optional dependencies (jq)
- Unimplemented endpoints
- Configuration recommendations

### <90% Pass = Critical Issues ❌
Review failed tests:
- Missing database tables
- Missing files
- API errors
- Security vulnerabilities

## Common Issues & Solutions

### "Database 'rental_erp' not found"
**Solution:**
```bash
cd 06_SRC/backend/scripts
sudo ./quick-setup.sh
```

### "Table not found"
**Solution:** Re-run database setup or manually run:
```bash
cd 06_SRC/backend
node scripts/init-db.js
```

### "Backend server not running"
**Solution:** API tests will be skipped. To run full suite:
```bash
cd 06_SRC/backend
npm run dev
```

### "Frontend build failed"
**Solution:**
```bash
cd 06_SRC/frontend
npm install
npm run build
```

### "API test failed with 500 error"
Check backend logs and database connection.

## CI/CD Integration

This script is designed for CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run E2E Tests
  run: |
    cd backend && npm run dev &
    sleep 5
    ./scripts/comprehensive-e2e-test.sh
```

**Exit Codes:**
- `0` = All tests passed
- `1` = Some tests failed

## Advanced Usage

### Running Specific Phases Only

Edit the script's `main()` function to comment out unwanted tests:

```bash
main() {
    # test_environment || true
    # test_project_structure || true
    test_api_endpoints || true  # Only API tests
    generate_report
}
```

### Adding Custom Tests

Add new test functions following the pattern:

```bash
test_my_feature() {
    header "MY FEATURE TESTS"
    
    test_start "My test description"
    if [ some_condition ]; then
        test_pass
    else
        test_fail "Test name" "Error message"
    fi
}
```

Then call it in `main()`.

## Maintenance

Update this test suite when:
- New features are added
- Database schema changes
- New API endpoints are created
- New dependencies are required

## Related Documentation

- **Implementation Guides:** `04_PROMPTS/TODO-*.md`
- **Architecture:** `00_PRD/architecture.md`
- **Tasks:** `02_PROGRESS/tasks.md`
- **Guide Summary:** `04_PROMPTS/GUIDE-SUMMARY.md`

## Support

If tests fail unexpectedly:
1. Review the error output
2. Check individual component guides
3. Verify database setup
4. Ensure all dependencies are installed
5. Check backend/frontend logs

---

**Last Updated:** 2026-01-31  
**Test Coverage:** Phase 1, 2, 3 (95+ tests)  
**Estimated Runtime:** 30-60 seconds (without API), 2-3 minutes (with API)
