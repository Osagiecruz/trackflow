const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

async function createAdmin() {
    const email = process.env.ADMIN_EMAIL;            //pulled from my .env
    const password = process.env.ADMIN_PASSWORD;      //set temporarily

    const existing = await db('agencies').where({ email }).first();
    if (existing) {
        console.log('Admin already exists:', email);
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

    console.log('✔ Admin account created:', email);
    process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });