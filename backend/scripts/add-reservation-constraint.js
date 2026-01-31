require('dotenv').config();
const pool = require('../src/config/database');

const addConstraint = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Adding reservation overlap constraint...');
    
    await client.query('CREATE EXTENSION IF NOT EXISTS btree_gist;');
    console.log('✅ btree_gist extension enabled');
    
    const constraintCheck = await client.query(
      `SELECT constraint_name 
       FROM information_schema.table_constraints 
       WHERE table_name = 'reservations' 
       AND constraint_name = 'no_overlap'`
    );
    
    if (constraintCheck.rows.length > 0) {
      console.log('✅ Constraint already exists');
      return;
    }
    
    await client.query(`
      ALTER TABLE reservations 
      ADD CONSTRAINT no_overlap 
      EXCLUDE USING GIST (
        variant_id WITH =,
        tsrange(start_date, end_date) WITH &&
      ) WHERE (status = 'ACTIVE')
    `);
    
    console.log('✅ Overlap constraint added successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

addConstraint()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
