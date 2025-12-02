const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Migrating database for badges...');

try {
    // 1. Create badges table
    db.exec(`
        CREATE TABLE IF NOT EXISTS badges (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE,
            name TEXT,
            description TEXT,
            icon TEXT,
            createdAt TEXT
        );
    `);
    console.log('Created badges table.');

    // 2. Create user_badges table
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_badges (
            userId TEXT,
            badgeId TEXT,
            awardedAt TEXT,
            PRIMARY KEY (userId, badgeId),
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(badgeId) REFERENCES badges(id)
        );
    `);
    console.log('Created user_badges table.');

    // 3. Seed initial badges
    const badges = [
        { slug: 'pioneer', name: '先驱者', description: '早期加入社区的用户', icon: '🚀' },
        { slug: 'writer', name: '创作者', description: '发布了第一篇文章', icon: '✍️' },
        { slug: 'influencer', name: '布道者', description: '成功邀请了新朋友加入', icon: '🌟' },
        { slug: 'admin', name: '管理员', description: '社区的守护者', icon: '🛡️' },
        { slug: 'lucky', name: '欧皇', description: '在抽奖中获得大奖', icon: '🍀' }
    ];

    const insertBadge = db.prepare('INSERT OR IGNORE INTO badges (id, slug, name, description, icon, createdAt) VALUES (?, ?, ?, ?, ?, ?)');

    for (const badge of badges) {
        insertBadge.run(randomUUID(), badge.slug, badge.name, badge.description, badge.icon, new Date().toISOString());
    }
    console.log('Seeded initial badges.');

    // 4. Award 'pioneer' badge to existing users (first 100)
    const pioneerBadge = db.prepare("SELECT id FROM badges WHERE slug = 'pioneer'").get();
    const users = db.prepare("SELECT id FROM users ORDER BY createdAt ASC LIMIT 100").all();
    const awardBadge = db.prepare('INSERT OR IGNORE INTO user_badges (userId, badgeId, awardedAt) VALUES (?, ?, ?)');

    if (pioneerBadge) {
        for (const user of users) {
            awardBadge.run(user.id, pioneerBadge.id, new Date().toISOString());
        }
        console.log(`Awarded 'pioneer' badge to ${users.length} users.`);
    }

    // 5. Award 'admin' badge to admin users
    const adminBadge = db.prepare("SELECT id FROM badges WHERE slug = 'admin'").get();
    const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();

    if (adminBadge) {
        for (const admin of admins) {
            awardBadge.run(admin.id, adminBadge.id, new Date().toISOString());
        }
        console.log(`Awarded 'admin' badge to ${admins.length} admins.`);
    }

} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}

console.log('Migration completed successfully.');
