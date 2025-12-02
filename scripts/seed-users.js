const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

const BATCH_SIZE = 100;

console.log(`Generating ${BATCH_SIZE} users...`);

const insertUser = db.prepare(`
    INSERT INTO users (id, username, email, passwordHash, createdAt, bio, avatar, role, isBanned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const generatedUsers = [];

const transaction = db.transaction((users) => {
    for (const user of users) {
        insertUser.run(
            user.id,
            user.username,
            user.email,
            user.passwordHash,
            user.createdAt,
            user.bio,
            user.avatar,
            user.role,
            user.isBanned
        );
    }
});

for (let i = 0; i < BATCH_SIZE; i++) {
    const id = crypto.randomUUID();
    const randomStr = crypto.randomBytes(4).toString('hex');
    const username = `user_${randomStr}`;
    const email = `${username}@example.com`;
    const password = crypto.randomBytes(6).toString('hex'); // Random 12 char password
    const seed = crypto.randomBytes(4).toString('hex');
    const avatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

    generatedUsers.push({
        id,
        username,
        email,
        passwordHash: password,
        createdAt: new Date().toISOString(),
        bio: 'This is a generated user.',
        avatar,
        role: 'user',
        isBanned: 0
    });
}

try {
    transaction(generatedUsers);
    console.log(`Successfully added ${BATCH_SIZE} users.`);
    console.log('Here are the first 5 generated users (username : password):');
    generatedUsers.slice(0, 5).forEach(u => {
        console.log(`${u.username} : ${u.passwordHash}`);
    });
} catch (error) {
    console.error('Error seeding users:', error);
}
