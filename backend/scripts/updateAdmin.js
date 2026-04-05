require('dotenv').config({ path: '../.env' });

const bcrypt = require('bcryptjs');
const knex = require('knex')({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
});

async function updateAdmin() {
  const hash = await bcrypt.hash('Osagiecruz1', 12);
  const n = await knex('agencies')
    .where({ email: 'trackflow.eu@gmail.com' })
    .update({ email: 'kestervesper@gmail.com', password_hash: hash });
  console.log('Updated', n, 'rows');
  await knex.destroy();
  process.exit(0);
}

updateAdmin().catch(err => { console.error(err.message); process.exit(1); });