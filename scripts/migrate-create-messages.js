const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Migrating database: Creating messages table...');

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    senderId TEXT,
    receiverId TEXT,
    content TEXT,
    createdAt TEXT,
    isRead INTEGER DEFAULT 0,
    FOREIGN KEY(senderId) REFERENCES users(id),
    FOREIGN KEY(receiverId) REFERENCES users(id)
  );
`);

console.log('Migration successful: messages table created.');
