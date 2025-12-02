const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Migrating database for leveling and invites...');

try {
    // 1. Add level and experience columns to users table
    try {
        db.prepare('ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1').run();
        console.log('Added level column to users.');
    } catch (e) {
        console.log('level column likely already exists.');
    }

    try {
        db.prepare('ALTER TABLE users ADD COLUMN experience INTEGER DEFAULT 0').run();
        console.log('Added experience column to users.');
    } catch (e) {
        console.log('experience column likely already exists.');
    }

    // 2. Create invitation_codes table
    db.exec(`
        CREATE TABLE IF NOT EXISTS invitation_codes (
            code TEXT PRIMARY KEY,
            creatorId TEXT,
            isUsed INTEGER DEFAULT 0,
            usedBy TEXT,
            createdAt TEXT,
            FOREIGN KEY(creatorId) REFERENCES users(id),
            FOREIGN KEY(usedBy) REFERENCES users(id)
        );
    `);
    console.log('Created invitation_codes table.');

    // 3. Create a default invite code for initial use if not exists
    const defaultCode = 'APHELION-WELCOME';
    const exists = db.prepare('SELECT 1 FROM invitation_codes WHERE code = ?').get(defaultCode);

    if (!exists) {
        // Assign to admin if possible, else null
        const admin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
        const creatorId = admin ? admin.id : null;

        db.prepare(`
            INSERT INTO invitation_codes (code, creatorId, isUsed, createdAt)
            VALUES (?, ?, 0, ?)
        `).run(defaultCode, creatorId, new Date().toISOString());
        console.log(`Created default invite code: ${defaultCode}`);
    }

} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}

console.log('Migration completed successfully.');
