#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime, timedelta

API_URL = "http://localhost:5000/api"
RESULTS = []

def log_test(test_num, test_name, passed, details=""):
    status = "✅ PASSED" if passed else "❌ FAILED"
    result = f"TEST {test_num}: {test_name} - {status}"
    if details:
        result += f"\n   Details: {details}"
    print(result)
    RESULTS.append({"test": test_num, "name": test_name, "passed": passed, "details": details})
    print()

print("=" * 60)
print("  COMPREHENSIVE E2E TEST SUITE")
print(f"  Started: {datetime.now()}")
print("=" * 60)
print()

# Test 1: Backend Health
print("TEST 1: Backend Health Check")
try:
    response = requests.get("http://localhost:5000/health", timeout=5)
    passed = response.status_code == 200 and "OK" in response.text
    log_test(1, "Backend Health Check", passed, f"Status: {response.status_code}")
except Exception as e:
    log_test(1, "Backend Health Check", False, str(e))
    exit(1)

# Test 2: Register Vendor
print("TEST 2: Register Fresh Vendor User")
timestamp = int(time.time())
vendor_email = f"vendor_{timestamp}@test.com"
vendor_data = {
    "name": "Test Vendor",
    "email": vendor_email,
    "password": "SecurePass123!",
    "phone": "+919876543210",
    "role": "VENDOR"
}

try:
    response = requests.post(f"{API_URL}/auth/register", json=vendor_data)
    data = response.json()
    
    if response.status_code == 201 and 'data' in data and 'accessToken' in data['data']:
        VENDOR_TOKEN = data['data']['accessToken']
        VENDOR_ID = data['data']['user']['id']
        log_test(2, "Vendor Registration", True, f"ID: {VENDOR_ID}, Email: {vendor_email}")
    else:
        log_test(2, "Vendor Registration", False, str(data))
        exit(1)
except Exception as e:
    log_test(2, "Vendor Registration", False, str(e))
    exit(1)

# Test 3: Register Customer
print("TEST 3: Register Fresh Customer User")
customer_email = f"customer_{timestamp}@test.com"
customer_data = {
    "name": "Test Customer",
    "email": customer_email,
    "password": "SecurePass123!",
    "phone": "+919876543211",
    "role": "CUSTOMER"
}

try:
    response = requests.post(f"{API_URL}/auth/register", json=customer_data)
    data = response.json()
    
    if response.status_code == 201 and 'data' in data and 'accessToken' in data['data']:
        CUSTOMER_TOKEN = data['data']['accessToken']
        CUSTOMER_ID = data['data']['user']['id']
        log_test(3, "Customer Registration", True, f"ID: {CUSTOMER_ID}, Email: {customer_email}")
    else:
        log_test(3, "Customer Registration", False, str(data))
        exit(1)
except Exception as e:
    log_test(3, "Customer Registration", False, str(e))
    exit(1)

# Test 4: Create Product (Vendor)
print("TEST 4: Create Product as Vendor")
product_data = {
    "name": "Professional Camera Kit",
    "description": "High-end DSLR camera with lenses",
    "category": "Electronics",
    "variants": [
        {
            "name": "Canon EOS R5 Kit",
            "sku": f"CAM-R5-{timestamp}",
            "price_per_day": 2000,
            "stock_quantity": 5
        },
        {
            "name": "Sony A7R IV Kit",
            "sku": f"CAM-SONY-{timestamp}",
            "price_per_day": 1800,
            "stock_quantity": 3
        }
    ]
}

try:
    headers = {"Authorization": f"Bearer {VENDOR_TOKEN}"}
    response = requests.post(f"{API_URL}/products", json=product_data, headers=headers)
    data = response.json()
    
    if response.status_code == 201 and 'data' in data:
        PRODUCT_ID = data['data']['id']
        VARIANT_ID = data['data']['variants'][0]['id']
        log_test(4, "Create Product as Vendor", True, f"Product ID: {PRODUCT_ID}, Variants: 2")
    else:
        log_test(4, "Create Product as Vendor", False, str(data))
        PRODUCT_ID = None
        VARIANT_ID = None
except Exception as e:
    log_test(4, "Create Product as Vendor", False, str(e))
    PRODUCT_ID = None
    VARIANT_ID = None

# Test 5: Get All Products (Public)
print("TEST 5: Get All Products (Public Access)")
try:
    response = requests.get(f"{API_URL}/products")
    data = response.json()
    
    if response.status_code == 200 and 'data' in data:
        product_count = len(data['data']['products'])
        log_test(5, "Get All Products", True, f"Found {product_count} products")
    else:
        log_test(5, "Get All Products", False, str(data))
except Exception as e:
    log_test(5, "Get All Products", False, str(e))

# Test 6: Get Product by ID
if PRODUCT_ID:
    print("TEST 6: Get Product by ID")
    try:
        response = requests.get(f"{API_URL}/products/{PRODUCT_ID}")
        data = response.json()
        
        if response.status_code == 200 and 'data' in data:
            log_test(6, "Get Product by ID", True, f"Name: {data['data']['name']}")
        else:
            log_test(6, "Get Product by ID", False, str(data))
    except Exception as e:
        log_test(6, "Get Product by ID", False, str(e))
else:
    log_test(6, "Get Product by ID", False, "No product ID available")

# Test 7: Update Product
if PRODUCT_ID:
    print("TEST 7: Update Product as Vendor")
    try:
        headers = {"Authorization": f"Bearer {VENDOR_TOKEN}"}
        update_data = {
            "name": "Professional Camera Kit - UPDATED",
            "description": "Updated description"
        }
        response = requests.put(f"{API_URL}/products/{PRODUCT_ID}", json=update_data, headers=headers)
        data = response.json()
        
        passed = response.status_code in [200, 201]
        log_test(7, "Update Product", passed, str(data) if not passed else "Product updated")
    except Exception as e:
        log_test(7, "Update Product", False, str(e))
else:
    log_test(7, "Update Product", False, "No product ID available")

# Test 8: RBAC - Customer Cannot Create Product
print("TEST 8: RBAC - Customer Cannot Create Product")
try:
    headers = {"Authorization": f"Bearer {CUSTOMER_TOKEN}"}
    response = requests.post(f"{API_URL}/products", json=product_data, headers=headers)
    data = response.json()
    
    passed = response.status_code == 403 or 'error' in data
    log_test(8, "RBAC - Customer Product Creation Blocked", passed, "Correctly rejected")
except Exception as e:
    log_test(8, "RBAC - Customer Product Creation Blocked", False, str(e))

# Test 9: Check Reservation Availability
if VARIANT_ID:
    print("TEST 9: Check Reservation Availability")
    try:
        start_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        
        response = requests.get(f"{API_URL}/reservations/availability", params={
            "variant_id": VARIANT_ID,
            "start_date": start_date,
            "end_date": end_date,
            "quantity": 2
        })
        data = response.json()
        
        if response.status_code == 200 and 'data' in data:
            available = data['data']['available']
            log_test(9, "Check Reservation Availability", True, f"Available: {available}, Stock: {data['data']['available_stock']}")
        else:
            log_test(9, "Check Reservation Availability", False, str(data))
    except Exception as e:
        log_test(9, "Check Reservation Availability", False, str(e))
else:
    log_test(9, "Check Reservation Availability", False, "No variant ID available")

# Test 10: Create Order with Reservations
if VARIANT_ID:
    print("TEST 10: Create Order as Customer")
    try:
        headers = {"Authorization": f"Bearer {CUSTOMER_TOKEN}"}
        start_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        
        order_data = {
            "items": [
                {
                    "variant_id": VARIANT_ID,
                    "quantity": 2,
                    "start_date": start_date,
                    "end_date": end_date
                }
            ]
        }
        
        response = requests.post(f"{API_URL}/orders", json=order_data, headers=headers)
        data = response.json()
        
        if response.status_code == 201 and 'data' in data:
            ORDER_ID = data['data']['id']
            log_test(10, "Create Order with Reservations", True, f"Order ID: {ORDER_ID}, Number: {data['data']['order_number']}")
        else:
            log_test(10, "Create Order with Reservations", False, str(data))
            ORDER_ID = None
    except Exception as e:
        log_test(10, "Create Order with Reservations", False, str(e))
        ORDER_ID = None
else:
    log_test(10, "Create Order with Reservations", False, "No variant ID available")
    ORDER_ID = None

# Test 11: Get Customer Orders
print("TEST 11: Get Customer Orders")
try:
    headers = {"Authorization": f"Bearer {CUSTOMER_TOKEN}"}
    response = requests.get(f"{API_URL}/orders", headers=headers)
    data = response.json()
    
    if response.status_code == 200 and 'data' in data:
        order_count = len(data['data'])
        log_test(11, "Get Customer Orders", True, f"Found {order_count} orders")
    else:
        log_test(11, "Get Customer Orders", False, str(data))
except Exception as e:
    log_test(11, "Get Customer Orders", False, str(e))

# Test 12: Get Customer Reservations
print("TEST 12: Get Customer Reservations")
try:
    headers = {"Authorization": f"Bearer {CUSTOMER_TOKEN}"}
    response = requests.get(f"{API_URL}/reservations", headers=headers)
    data = response.json()
    
    if response.status_code == 200 and 'data' in data:
        reservation_count = len(data['data'])
        log_test(12, "Get Customer Reservations", True, f"Found {reservation_count} reservations")
    else:
        log_test(12, "Get Customer Reservations", False, str(data))
except Exception as e:
    log_test(12, "Get Customer Reservations", False, str(e))

# Test 13: Cancel Order
if ORDER_ID:
    print("TEST 13: Cancel Order")
    try:
        headers = {"Authorization": f"Bearer {CUSTOMER_TOKEN}"}
        response = requests.delete(f"{API_URL}/orders/{ORDER_ID}", headers=headers)
        
        passed = response.status_code in [200, 204]
        log_test(13, "Cancel Order", passed, "Order cancelled successfully" if passed else f"Status: {response.status_code}")
    except Exception as e:
        log_test(13, "Cancel Order", False, str(e))
else:
    log_test(13, "Cancel Order", False, "No order ID available")

# Test 14: Delete Product
if PRODUCT_ID:
    print("TEST 14: Delete Product as Vendor")
    try:
        headers = {"Authorization": f"Bearer {VENDOR_TOKEN}"}
        response = requests.delete(f"{API_URL}/products/{PRODUCT_ID}", headers=headers)
        
        passed = response.status_code in [200, 204]
        log_test(14, "Delete Product", passed, "Product deleted successfully" if passed else f"Status: {response.status_code}")
    except Exception as e:
        log_test(14, "Delete Product", False, str(e))
else:
    log_test(14, "Delete Product", False, "No product ID available")

# Summary
print("\n" + "=" * 60)
print("  TEST SUMMARY")
print("=" * 60)
passed_count = sum(1 for r in RESULTS if r['passed'])
total_count = len(RESULTS)
print(f"\nTotal Tests: {total_count}")
print(f"Passed: {passed_count} ✅")
print(f"Failed: {total_count - passed_count} ❌")
print(f"Success Rate: {(passed_count/total_count*100):.1f}%")
print(f"\nCompleted: {datetime.now()}")
print("=" * 60)

# Save detailed results
with open('test_results_detailed.json', 'w') as f:
    json.dump({"timestamp": str(datetime.now()), "results": RESULTS, "summary": {"total": total_count, "passed": passed_count, "failed": total_count - passed_count}}, f, indent=2)

print("\n✅ Detailed results saved to test_results_detailed.json")

# Exit with appropriate code
exit(0 if passed_count == total_count else 1)
