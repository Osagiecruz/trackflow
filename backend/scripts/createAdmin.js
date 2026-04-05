require('dotenv').config({ path: '../.env' });

const bcrypt = require('bcryptjs');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
});

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const existing = await db('agencies').where({ email }).first();
  if (existing) {
    console.log('Admin already exists:', email);
    await db.destroy();
    process.exit(0);
  }

  const password_hash = await bcrypt.hash(password, 12);
  await db('agencies').insert({
    name: 'Admin',
    email,
    password_hash,
    plan: 'enterprise',
    is_active: true,
    email_verified: true,
  });

  console.log('✓ Admin account created:', email);
  await db.destroy();
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });