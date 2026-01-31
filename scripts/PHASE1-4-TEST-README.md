# Phase 1-4 E2E Test Suite - README

## Overview
Comprehensive end-to-end test suite for **Phases 1-4** of the Rental ERP system, excluding Phase 5 (Quotations).

## What It Tests

### Phase 2: Authentication (4 tests)
- ✅ Customer registration
- ✅ Vendor registration
- ✅ Login functionality
- ✅ Protected route rejection without token

### Phase 3: Products (6 tests)
- ✅ Product creation (VENDOR only)
- ✅ RBAC validation (Customer cannot create)
- ✅ Product listing (public)
- ✅ Product details by ID
- ✅ Product search by category
- ✅ Product update (ownership check)

### Phase 4: Reservations (3 tests)
- ✅ Availability checking (public endpoint)
- ✅ Availability validation with high quantity
- ✅ Stock reduction after reservation

### Phase 4: Orders (7 tests)
- ✅ Order creation with automatic reservations
- ✅ Customer order listing
- ✅ Order details by ID
- ✅ Automatic reservation creation
- ✅ Stock reserved correctly
- ✅ Order cancellation
- ✅ Stock release after cancellation

### Integration (1 test)
- ✅ Complete rental flow (browse → reserve → cancel)

**Total: 21 API Tests**

## Prerequisites

1. **Backend Server Running:**
   ```bash
   cd 06_SRC/backend
   npm run dev
   ```

2. **Database Running:**
   ```bash
   # PostgreSQL must be running
   # Database 'rental_erp' must exist
   ```

3. **Dependencies Installed:**
   ```bash
   # Backend
   cd 06_SRC/backend
   npm install
   
   # jq for JSON parsing (optional but recommended)
   sudo apt-get install jq
   ```

## How to Run

```bash
cd 06_SRC
./scripts/phase1-4-e2e-test.sh
```

## What Happens

1. **Server Check:** Verifies backend is running at `localhost:5000`

2. **Authentication Flow:**
   - Registers a unique customer (timestamped email)
   - Registers a unique vendor
   - Tests login
   - Validates protected routes

3. **Product Flow:**
   - Vendor creates a product with variant
   - Tests RBAC (customer rejection)
   - Lists products
   - Fetches product details
   - Searches by category
   - Updates product

4. **Reservation Flow:**
   - Checks availability for variant
   - Tests quantity validation
   - Verifies stock management

5. **Order Flow:**
   - Customer creates order
   - System auto-creates reservations
   - Verifies stock reduction
   - Customer cancels order
   - Verifies stock release

6. **Report:**
   - Shows pass/fail count
   - Displays success rate
   - Lists coverage areas

## Sample Output

```
═══════════════════════════════════════════════════════════════
  PHASE 2: AUTHENTICATION SYSTEM
═══════════════════════════════════════════════════════════════

━━━ User Registration ━━━
  [1] Register CUSTOMER user ... ✓ PASS
  [2] Register VENDOR user ... ✓ PASS

━━━ Login & Authentication ━━━
  [3] Login with customer credentials ... ✓ PASS
  [4] Protected route rejection (no token) ... ✓ PASS

═══════════════════════════════════════════════════════════════
  PHASE 3: PRODUCT CATALOG
═══════════════════════════════════════════════════════════════

━━━ Product Creation (VENDOR) ━━━
  [5] Create product with variants (VENDOR) ... ✓ PASS
    Product ID: 42
  [6] RBAC: Customer cannot create product ... ✓ PASS

...

═══════════════════════════════════════════════════════════════
  TEST SUMMARY REPORT
═══════════════════════════════════════════════════════════════

Total Tests: 21
✓ Passed: 21
✗ Failed: 0

Success Rate: 100%

Test Coverage:
  ✅ Phase 1: Foundation (structural tests)
  ✅ Phase 2: Authentication (registration, login, RBAC)
  ✅ Phase 3: Products (CRUD, search, ownership)
  ✅ Phase 4: Reservations (availability, creation, stock management)
  ✅ Phase 4: Orders (creation, retrieval, cancellation)
  ✅ Integration (end-to-end flow)

═══════════════════════════════════════════════════════════════
🎉 ALL TESTS PASSED! SYSTEM IS FULLY FUNCTIONAL
```

## Test Details

### Variables Captured During Tests
- `CUSTOMER_TOKEN` - JWT token for customer
- `VENDOR_TOKEN` - JWT token for vendor
- `CUSTOMER_ID` - Customer user ID
- `VENDOR_ID` - Vendor user ID
- `PRODUCT_ID` - Created product ID
- `VARIANT_ID` - Created variant ID
- `ORDER_ID` - Created order ID
- `RESERVATION_ID` - Created reservation ID

These are used across tests to simulate real user flows.

### Data Cleanup
The script creates test data but **does not clean it up automatically**. This allows you to:
- Inspect data after tests
- Manually verify database state
- Debug failures

To clean up manually:
```sql
-- Delete test users
DELETE FROM users WHERE email LIKE 'test_%@example.com';

-- Delete test products
DELETE FROM products WHERE name LIKE '%Test%' OR name LIKE '%Camera%';
```

## Interpreting Results

### 100% Pass = Ready for Production ✅
All critical flows working perfectly.

### 90-99% Pass = Minor Issues ⚠️
Some non-critical tests failed. Review output for details.

### <90% Pass = Critical Issues ❌
Review failed tests and fix before proceeding.

## Common Issues

### "Backend server not running"
**Solution:**
```bash
cd 06_SRC/backend
npm run dev
```

### "Registration failed"
**Possible causes:**
- Database not running
- Missing tables
- Email already exists (cached from previous run)

**Solution:**
- Verify database is up
- Run `node backend/scripts/db-setup.js`
- Script uses timestamped emails to avoid duplicates

### "Product creation failed"
**Possible causes:**
- Vendor token not obtained
- Missing product table
- FK constraint violations

**Solution:**
- Check previous test (vendor registration) passed
- Verify database schema

### "Order creation failed"
**Possible causes:**
- Missing order/reservation tables
- Variant ID not captured
- Insufficient stock

**Solution:**
- Ensure product creation test passed
- Check variant_id extraction from product response

## Exit Codes

- `0` = All tests passed
- `1` = Some tests failed

Perfect for CI/CD pipelines.

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Run E2E Tests
  run: |
    cd 06_SRC/backend
    npm run dev &
    sleep 5
    cd ..
    ./scripts/phase1-4-e2e-test.sh
```

## Next Steps

After all tests pass:
1. ✅ Implement Phase 5 (Quotations)
2. ✅ Implement Phase 6 (Pickup/Return)
3. ✅ Add frontend E2E tests (Playwright/Cypress)
4. ✅ Add performance testing
5. ✅ Add load testing

## Related Files

- **Main Test Suite:** `comprehensive-e2e-test.sh` (structural tests)
- **Implementation Guides:** `04_PROMPTS/TODO-*.md`
- **Architecture:** `00_PRD/architecture.md`

---

**Last Updated:** 2026-01-31  
**Test Count:** 21 API tests  
**Runtime:** ~10-15 seconds  
**Coverage:** Phase 1-4 (Auth, Products, Reservations, Orders)
