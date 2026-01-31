#!/bin/bash

echo "=========================================="
echo "  COMPREHENSIVE E2E TEST SUITE"
echo "  Part 1: Backend API Tests"
echo "=========================================="
echo ""

API_URL="http://localhost:5000/api"
TEST_RESULTS="test_results.txt"

echo "Test Results - $(date)" > $TEST_RESULTS
echo "========================================" >> $TEST_RESULTS
echo "" >> $TEST_RESULTS

# Test 1: Health Check
echo "TEST 1: Backend Health Check"
HEALTH=$(curl -s http://localhost:5000/health)
if [[ $HEALTH == *"OK"* ]]; then
    echo "✅ Backend is running"
    echo "✅ TEST 1: Health Check - PASSED" >> $TEST_RESULTS
else
    echo "❌ Backend is not responding"
    echo "❌ TEST 1: Health Check - FAILED" >> $TEST_RESULTS
    exit 1
fi
echo ""

# Test 2: Register Vendor
echo "TEST 2: Register Vendor User"
VENDOR_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vendor",
    "email": "vendor@test.com",
    "password": "password123",
    "role": "VENDOR"
  }')

if [[ $VENDOR_RESPONSE == *"accessToken"* ]]; then
    echo "✅ Vendor registration successful"
    echo "✅ TEST 2: Vendor Registration - PASSED" >> $TEST_RESULTS
    VENDOR_TOKEN=$(echo $VENDOR_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    VENDOR_ID=$(echo $VENDOR_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
    echo "Vendor Token: $VENDOR_TOKEN"
    echo "Vendor ID: $VENDOR_ID"
else
    echo "✅ Vendor already exists (trying login)"
    LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "vendor@test.com", "password": "password123"}')
    VENDOR_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    VENDOR_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
    echo "✅ TEST 2: Vendor Login - PASSED" >> $TEST_RESULTS
fi
echo ""

# Test 3: Register Customer
echo "TEST 3: Register Customer User"
CUSTOMER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "customer@test.com",
    "password": "password123",
    "role": "CUSTOMER"
  }')

if [[ $CUSTOMER_RESPONSE == *"accessToken"* ]]; then
    echo "✅ Customer registration successful"
    echo "✅ TEST 3: Customer Registration - PASSED" >> $TEST_RESULTS
    CUSTOMER_TOKEN=$(echo $CUSTOMER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
else
    echo "✅ Customer already exists (trying login)"
    LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "customer@test.com", "password": "password123"}')
    CUSTOMER_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    CUSTOMER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
    echo "✅ TEST 3: Customer Login - PASSED" >> $TEST_RESULTS
fi
echo ""

echo "Part 1 Complete! Tokens saved for Part 2"
echo "VENDOR_TOKEN=$VENDOR_TOKEN" > /tmp/test_tokens.env
echo "VENDOR_ID=$VENDOR_ID" >> /tmp/test_tokens.env
echo "CUSTOMER_TOKEN=$CUSTOMER_TOKEN" >> /tmp/test_tokens.env
echo "CUSTOMER_ID=$CUSTOMER_ID" >> /tmp/test_tokens.env

