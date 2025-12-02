const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Migrating database: Adding bio column to users table...');

try {
    db.exec('ALTER TABLE users ADD COLUMN bio TEXT');
    console.log('Migration successful: bio column added.');
} catch (e) {
    if (e.message.includes('duplicate column name')) {
        console.log('Migration skipped: bio column already exists.');
    } else {
        console.error('Migration failed:', e.message);
    }
}
