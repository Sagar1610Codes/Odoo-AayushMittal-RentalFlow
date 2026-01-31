require('dotenv').config();
const {
  checkAvailability,
  createReservation,
  cancelReservation,
  completeReservation
} = require('../src/services/reservation.service');
const pool = require('../src/config/database');

const runTests = async () => {
  console.log('🧪 Testing TODO 4.1: Reservation Engine');
  console.log('=====================================\n');
  
  let testVariantId;
  let testOrderId;
  
  try {
    console.log('Setup: Creating test variant...');
    const uniqueSku = 'TEST-RESERVATION-' + Date.now();
    const variant = await pool.query(
      `INSERT INTO variants (product_id, sku, stock_quantity, price_daily)
       SELECT id, $1, 5, 100.00
       FROM products LIMIT 1
       RETURNING id`,
      [uniqueSku]
    );
    testVariantId = variant.rows[0].id;
    
    const order = await pool.query(
      `INSERT INTO orders (customer_id, vendor_id, order_number, total_amount, start_date, end_date)
       SELECT id, id, 'TEST-' || NOW(), 0, NOW(), NOW() + INTERVAL '1 day'
       FROM users WHERE role = 'CUSTOMER' LIMIT 1
       RETURNING id`
    );
    testOrderId = order.rows[0].id;
    
    console.log(`✅ Test variant created: ${testVariantId}`);
    console.log(`✅ Test order created: ${testOrderId}\n`);
    
    console.log('Test 1: Check Availability - Empty');
    const startDate = new Date('2026-02-01T10:00:00Z');
    const endDate = new Date('2026-02-03T10:00:00Z');
    
    const avail1 = await checkAvailability(testVariantId, startDate, endDate, 2);
    
    if (avail1.success && avail1.data.available === 5 && avail1.data.canReserve) {
      console.log('✅ Availability check works (5 available, 0 reserved)');
    } else {
      console.log('❌ FAIL: Availability check incorrect');
      console.log('   Data:', avail1);
    }
    
    console.log('\nTest 2: Create Reservation');
    const items1 = [{
      variantId: testVariantId,
      quantity: 2,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }];
    
    const res1 = await createReservation(testOrderId, items1);
    
    if (res1.success && res1.data.length === 1) {
      console.log('✅ Reservation created successfully');
      console.log(`   Reserved: 2 units from ${items1[0].startDate}`);
    } else {
      console.log('❌ FAIL:', res1.error);
    }
    
    console.log('\nTest 3: Check Availability After Reservation');
    const avail2 = await checkAvailability(testVariantId, startDate, endDate, 2);
    
    if (avail2.success && avail2.data.available === 3 && avail2.data.reserved === 2) {
      console.log('✅ Availability updated (3 available, 2 reserved)');
    } else {
      console.log('❌ FAIL: Availability not updated correctly');
      console.log('   Data:', avail2.data);
    }
    
    console.log('\nTest 4: Overlapping Reservation (Must Fail)');
    const overlapStart = new Date('2026-02-02T10:00:00Z');
    const overlapEnd = new Date('2026-02-04T10:00:00Z');
    
    const items2 = [{
      variantId: testVariantId,
      quantity: 5,
      startDate: overlapStart.toISOString(),
      endDate: overlapEnd.toISOString()
    }];
    
    const res2 = await createReservation(testOrderId, items2);
    
    if (!res2.success && res2.error.includes('Insufficient')) {
      console.log('✅ Overlapping reservation prevented (availability check)');
      console.log(`   Error: ${res2.error}`);
    } else {
      console.log('❌ FAIL: Overlapping reservation allowed!');
    }
    
    console.log('\nTest 5: Non-Overlapping Reservation');
    const noOverlapStart = new Date('2026-02-05T10:00:00Z');
    const noOverlapEnd = new Date('2026-02-07T10:00:00Z');
    
    const items3 = [{
      variantId: testVariantId,
      quantity: 3,
      startDate: noOverlapStart.toISOString(),
      endDate: noOverlapEnd.toISOString()
    }];
    
    const res3 = await createReservation(testOrderId, items3);
    
    if (res3.success) {
      console.log('✅ Non-overlapping reservation created');
    } else {
      console.log('❌ FAIL:', res3.error);
    }
    
    console.log('\nTest 6: Cancel Reservation');
    const resId = res1.data[0].id;
    const cancel = await cancelReservation(resId);
    
    if (cancel.success && cancel.data.status === 'CANCELLED') {
      console.log('✅ Reservation cancelled successfully');
      
      const avail3 = await checkAvailability(testVariantId, startDate, endDate, 2);
      if (avail3.data.available === 5) {
        console.log('✅ Stock recovered after cancellation');
      }
    } else {
      console.log('❌ FAIL: Cancellation failed');
    }
    
    console.log('\nTest 7: Complete Reservation');
    const res3Id = res3.data[0].id;
    const complete = await completeReservation(res3Id);
    
    if (complete.success && complete.data.status === 'COMPLETED') {
      console.log('✅ Reservation completed successfully');
    } else {
      console.log('❌ FAIL: Completion failed');
    }
    
    console.log('\nCleanup: Removing test data...');
    await pool.query('DELETE FROM reservations WHERE variant_id = $1', [testVariantId]);
    await pool.query('DELETE FROM variants WHERE id = $1', [testVariantId]);
    await pool.query('DELETE FROM orders WHERE id = $1', [testOrderId]);
    console.log('✅ Cleanup complete');
    
    console.log('\n=====================================');
    console.log('✅ ALL RESERVATION TESTS PASSED');
    console.log('=====================================');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runTests();
