const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Migrating database for new features...');

try {
    // 1. Time Capsule: Add unlockAt to posts
    try {
        db.exec('ALTER TABLE posts ADD COLUMN unlockAt TEXT');
        console.log('Added unlockAt column to posts table.');
    } catch (e) {
        console.log('unlockAt column likely already exists.');
    }

    // 2. XP Store: Create items and user_items tables
    db.exec(`
        CREATE TABLE IF NOT EXISTS shop_items (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            price INTEGER,
            icon TEXT,
            type TEXT, -- 'decoration', 'privilege'
            data TEXT -- JSON data for specific effects
        );

        CREATE TABLE IF NOT EXISTS user_items (
            id TEXT PRIMARY KEY,
            userId TEXT,
            itemId TEXT,
            purchasedAt TEXT,
            isEquipped INTEGER DEFAULT 0,
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(itemId) REFERENCES shop_items(id)
        );
    `);
    console.log('Created shop_items and user_items tables.');

    // 3. Seed Shop Items
    const items = [
        { name: '金色传说', description: '评论区昵称变为金色', price: 500, icon: '✨', type: 'decoration', data: '{"color": "#ffd700"}' },
        { name: '赛博霓虹', description: '评论区昵称变为霓虹色', price: 800, icon: '🌈', type: 'decoration', data: '{"className": "text-gradient"}' },
        { name: '邀请卡', description: '额外获得 3 个邀请码生成额度', price: 200, icon: '📩', type: 'privilege', data: '{"inviteCount": 3}' },
        { name: '置顶卡', description: '置顶一篇文章 24 小时', price: 1000, icon: '📌', type: 'privilege', data: '{"duration": 86400}' }
    ];

    const insertItem = db.prepare('INSERT OR IGNORE INTO shop_items (id, name, description, price, icon, type, data) VALUES (?, ?, ?, ?, ?, ?, ?)');

    for (const item of items) {
        insertItem.run(randomUUID(), item.name, item.description, item.price, item.icon, item.type, item.data);
    }
    console.log('Seeded shop items.');

} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}

console.log('Migration completed successfully.');
