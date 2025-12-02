const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Setting admin level to 5...');

try {
    const admin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
    if (admin) {
        db.prepare('UPDATE users SET level = 5, experience = 500 WHERE id = ?').run(admin.id);
        console.log(`Updated admin (ID: ${admin.id}) to Level 5.`);
    } else {
        console.log('Admin user not found.');
    }
} catch (error) {
    console.error('Failed to update admin level:', error);
}
