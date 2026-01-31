#!/bin/bash

echo "=========================================="
echo "  Part 2: Product CRUD Operations"
echo "=========================================="
echo ""

API_URL="http://localhost:5000/api"
source /tmp/test_tokens.env

# Test 4: Create Product (Vendor)
echo "TEST 4: Create Product as Vendor"
PRODUCT_RESPONSE=$(curl -s -X POST $API_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -d '{
    "name": "Test Camera",
    "description": "Professional DSLR Camera for rent",
    "category": "Electronics",
    "variants": [
      {
        "name": "Canon EOS R5",
        "sku": "CAM-R5-001",
        "price_per_day": 1500,
        "stock_quantity": 5
      },
      {
        "name": "Canon EOS R6",
        "sku": "CAM-R6-001",
        "price_per_day": 1200,
        "stock_quantity": 3
      }
    ]
  }')

if [[ $PRODUCT_RESPONSE == *'"id"'* ]]; then
    echo "✅ Product created successfully"
    echo "✅ TEST 4: Create Product - PASSED" >> test_results.txt
    PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "Product ID: $PRODUCT_ID"
    echo "PRODUCT_ID=$PRODUCT_ID" >> /tmp/test_tokens.env
else
    echo "❌ Product creation failed"
    echo "Response: $PRODUCT_RESPONSE"
    echo "❌ TEST 4: Create Product - FAILED" >> test_results.txt
fi
echo ""

# Test 5: Get All Products (Public)
echo "TEST 5: Get All Products (Public Access)"
PRODUCTS_LIST=$(curl -s $API_URL/products)
if [[ $PRODUCTS_LIST == *'"products"'* ]]; then
    echo "✅ Products list retrieved"
    PRODUCT_COUNT=$(echo $PRODUCTS_LIST | grep -o '"id":[0-9]*' | wc -l)
    echo "Total products: $PRODUCT_COUNT"
    echo "✅ TEST 5: Get Products List - PASSED" >> test_results.txt
else
    echo "❌ Failed to get products"
    echo "❌ TEST 5: Get Products List - FAILED" >> test_results.txt
fi
echo ""

# Test 6: Get Product by ID
echo "TEST 6: Get Product by ID"
if [ ! -z "$PRODUCT_ID" ]; then
    PRODUCT_DETAIL=$(curl -s $API_URL/products/$PRODUCT_ID)
    if [[ $PRODUCT_DETAIL == *'"name"'* ]]; then
        echo "✅ Product details retrieved"
        echo "✅ TEST 6: Get Product by ID - PASSED" >> test_results.txt
    else
        echo "❌ Failed to get product details"
        echo "❌ TEST 6: Get Product by ID - FAILED" >> test_results.txt
    fi
else
    echo "⚠️  No product ID available, skipping"
    echo "⚠️  TEST 6: Get Product by ID - SKIPPED" >> test_results.txt
fi
echo ""

# Test 7: Update Product (Vendor)
echo "TEST 7: Update Product as Vendor"
if [ ! -z "$PRODUCT_ID" ]; then
    UPDATE_RESPONSE=$(curl -s -X PUT $API_URL/products/$PRODUCT_ID \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $VENDOR_TOKEN" \
      -d '{
        "name": "Test Camera - Updated",
        "description": "Professional DSLR Camera - Now with discount!",
        "category": "Electronics"
      }')
    
    if [[ $UPDATE_RESPONSE == *'"success":true'* ]] || [[ $UPDATE_RESPONSE == *'"name":"Test Camera - Updated"'* ]]; then
        echo "✅ Product updated successfully"
        echo "✅ TEST 7: Update Product - PASSED" >> test_results.txt
    else
        echo "❌ Product update failed"
        echo "Response: $UPDATE_RESPONSE"
        echo "❌ TEST 7: Update Product - FAILED" >> test_results.txt
    fi
else
    echo "⚠️  No product ID available, skipping"
    echo "⚠️  TEST 7: Update Product - SKIPPED" >> test_results.txt
fi
echo ""

# Test 8: Try to create product as Customer (should fail)
echo "TEST 8: Try to Create Product as Customer (Should Fail)"
CUSTOMER_PRODUCT=$(curl -s -X POST $API_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "name": "Unauthorized Product",
    "description": "This should not be created",
    "category": "Test"
  }')

if [[ $CUSTOMER_PRODUCT == *'"error"'* ]] || [[ $CUSTOMER_PRODUCT == *'Forbidden'* ]] || [[ $CUSTOMER_PRODUCT == *'Unauthorized'* ]]; then
    echo "✅ Customer correctly blocked from creating products"
    echo "✅ TEST 8: RBAC - Customer Product Creation Blocked - PASSED" >> test_results.txt
else
    echo "❌ RBAC FAILURE: Customer was able to create product!"
    echo "❌ TEST 8: RBAC - Customer Product Creation Blocked - FAILED" >> test_results.txt
fi
echo ""

echo "Part 2 Complete!"
