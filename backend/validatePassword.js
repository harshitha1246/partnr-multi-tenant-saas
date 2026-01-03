const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost', // or your docker container name
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'partnr_db'
});

async function validatePassword(email, password) {
  try {
    const res = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      console.log('User not found');
      return;
    }
    const hash = res.rows[0].password_hash;
    const match = await bcrypt.compare(password, hash);
    if (match) {
      console.log('Password is correct ✅');
    } else {
      console.log('Password is incorrect ❌');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

// Test super_admin password
validatePassword('superadmin@testalpha.com', 'superadmin123');
