const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Migrating database: Adding role and isBanned columns to users table...');

try {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    console.log('Migration successful: role column added.');
} catch (e) {
    if (e.message.includes('duplicate column name')) {
        console.log('Migration skipped: role column already exists.');
    } else {
        console.error('Migration failed (role):', e.message);
    }
}

try {
    db.exec("ALTER TABLE users ADD COLUMN isBanned INTEGER DEFAULT 0");
    console.log('Migration successful: isBanned column added.');
} catch (e) {
    if (e.message.includes('duplicate column name')) {
        console.log('Migration skipped: isBanned column already exists.');
    } else {
        console.error('Migration failed (isBanned):', e.message);
    }
}
