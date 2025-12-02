const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Seeding database...');

// Create tables (idempotent)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    passwordHash TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT,
    content TEXT,
    excerpt TEXT,
    category TEXT,
    tags TEXT,
    date TEXT,
    authorId TEXT,
    FOREIGN KEY(authorId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    content TEXT,
    createdAt TEXT,
    postId TEXT,
    userId TEXT,
    FOREIGN KEY(postId) REFERENCES posts(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS follows (
    id TEXT PRIMARY KEY,
    followerId TEXT,
    followingId TEXT,
    createdAt TEXT,
    UNIQUE(followerId, followingId),
    FOREIGN KEY(followerId) REFERENCES users(id),
    FOREIGN KEY(followingId) REFERENCES users(id)
  );
`);

// Add Demo User
const userId = randomUUID();
try {
    const stmt = db.prepare('INSERT INTO users (id, username, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)');
    stmt.run(userId, 'demo_user', 'demo@example.com', 'hashed_password_placeholder', new Date().toISOString());
    console.log('User created:', userId);
} catch (e) {
    console.log('User already exists or error:', e.message);
}

// Add Demo Post
try {
    const stmt = db.prepare(`
        INSERT INTO posts (id, slug, title, content, excerpt, category, tags, date, authorId) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
        randomUUID(),
        'hello-world-sqlite',
        'Hello World (SQLite)',
        '# Hello World\n\nThis is a post stored in SQLite using better-sqlite3!',
        'Welcome to the new database...',
        'tech',
        'sqlite,nodejs',
        new Date().toISOString().split('T')[0],
        userId
    );
    console.log('Post created');
} catch (e) {
    console.log('Post already exists or error:', e.message);
}

console.log('Seeding complete.');
