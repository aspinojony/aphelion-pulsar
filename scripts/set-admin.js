const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

try {
    const info = db.prepare("UPDATE users SET role = 'admin' WHERE username = 'aspinojony'").run();
    console.log(`Updated ${info.changes} users to admin role.`);
} catch (e) {
    console.error('Error updating user role:', e);
}
