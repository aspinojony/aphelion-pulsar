const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Migrating database for Verification Codes...');

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS verification_codes (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            code TEXT NOT NULL,
            type TEXT NOT NULL, -- 'register' or 'login'
            expiresAt TEXT NOT NULL,
            createdAt TEXT NOT NULL
        );
    `);
    console.log('Created verification_codes table.');

} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}

console.log('Migration completed successfully.');
