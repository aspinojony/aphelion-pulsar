const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Migrating database for Resonance...');

try {
    // 1. Create resonance table
    db.exec(`
        CREATE TABLE IF NOT EXISTS resonances (
            id TEXT PRIMARY KEY,
            postId TEXT,
            content TEXT, -- For text selection or simple 'like'
            x INTEGER, -- Percentage X position
            y INTEGER, -- Percentage Y position
            createdAt TEXT,
            userId TEXT, -- Optional, can be anonymous
            FOREIGN KEY(postId) REFERENCES posts(id)
        );
    `);
    console.log('Created resonances table.');

} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}

console.log('Migration completed successfully.');
