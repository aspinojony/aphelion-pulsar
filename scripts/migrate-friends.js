const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Migrating database for Friends system...');

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS friends (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            friendId TEXT NOT NULL,
            status TEXT NOT NULL, -- 'pending', 'accepted'
            createdAt TEXT NOT NULL,
            UNIQUE(userId, friendId)
        );
    `);
    console.log('Created friends table.');

} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}

console.log('Migration completed successfully.');
