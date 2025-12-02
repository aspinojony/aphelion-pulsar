const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Maximizing admin stats and badges...');

try {
    // 1. Find Admin User
    const admin = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();

    if (!admin) {
        console.error('No admin user found!');
        process.exit(1);
    }

    console.log(`Found admin user: ${admin.username} (${admin.id})`);

    // 2. Maximize Level and XP
    // Level 100, XP 999999
    db.prepare('UPDATE users SET level = ?, experience = ? WHERE id = ?').run(100, 999999, admin.id);
    console.log('Updated admin level to 100 and XP to 999999.');

    // 3. Award All Badges
    const allBadges = db.prepare('SELECT id, name FROM badges').all();
    const awardBadgeStmt = db.prepare('INSERT OR IGNORE INTO user_badges (userId, badgeId, awardedAt) VALUES (?, ?, ?)');

    let awardedCount = 0;
    for (const badge of allBadges) {
        const result = awardBadgeStmt.run(admin.id, badge.id, new Date().toISOString());
        if (result.changes > 0) {
            awardedCount++;
            console.log(`Awarded badge: ${badge.name}`);
        }
    }

    console.log(`Successfully awarded ${awardedCount} new badges to admin.`);
    console.log('Admin is now fully powered up! 🚀');

} catch (error) {
    console.error('Operation failed:', error);
    process.exit(1);
}
