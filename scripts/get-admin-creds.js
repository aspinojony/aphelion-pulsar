const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

const user = db.prepare("SELECT username, email, passwordHash FROM users WHERE username = 'aspinojony'").get();
console.log('User Credentials:', user);
