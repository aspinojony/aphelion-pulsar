import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';

const dbPath = path.join(process.cwd(), 'aphelion.db');

// Prevent multiple connections in development
const globalForDb = global as unknown as { db: any };
const db = globalForDb.db || new Database(dbPath);
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
// Force rebuild

// Initialize tables
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

// Interfaces
export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    bio?: string;
    avatar?: string;
    role: 'user' | 'admin';
    isBanned: number; // 0 or 1
    level: number;
    experience: number;
}

export interface InvitationCode {
    code: string;
    creatorId: string | null;
    isUsed: number;
    usedBy: string | null;
    createdAt: string;
}

export interface Post {
    id: string;
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    content: string;
    tags: string[];
    category: string;
    authorId: string;
    authorName: string;
    authorLevel?: number;
    isProtected?: boolean;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
}

export interface Follow {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: string;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    isRead: number; // 0 or 1
    senderName?: string;
    receiverName?: string;
    senderAvatar?: string;
    receiverAvatar?: string;
}

export interface Badge {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string;
    createdAt: string;
}

export interface UserBadge {
    userId: string;
    badgeId: string;
    awardedAt: string;
    badge: Badge;
}

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    type: 'decoration' | 'privilege';
    data: string; // JSON string
}

export interface UserItem {
    id: string;
    userId: string;
    itemId: string;
    purchasedAt: string;
    isEquipped: number;
    item: ShopItem;
}

export interface Resonance {
    id: string;
    postId: string;
    content: string;
    x: number;
    y: number;
    createdAt: string;
    userId?: string;
}

export interface VerificationCode {
    id: string;
    email: string;
    code: string;
    type: 'register' | 'login';
    expiresAt: string;
    createdAt: string;
}

export interface Friend {
    id: string;
    userId: string;
    friendId: string;
    status: 'pending' | 'accepted';
    createdAt: string;
    friend?: User; // Joined user data
}

// User Functions
export async function getUsers(page: number = 1, limit: number = 10, search: string = ''): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM users';
    let countQuery = 'SELECT COUNT(*) as count FROM users';
    const params: any[] = [];

    if (search) {
        const searchCondition = ' WHERE username LIKE ? OR email LIKE ?';
        query += searchCondition;
        countQuery += searchCondition;
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = db.prepare(query).all(...params) as User[];
    const total = (db.prepare(countQuery).get(...params.slice(0, -2)) as { count: number }).count;

    return { users, total };
}

export async function addUser(user: User, inviteCode: string): Promise<void> {
    const transaction = db.transaction(() => {
        // 1. Create User
        const stmt = db.prepare('INSERT INTO users (id, username, email, passwordHash, createdAt, bio, avatar, role, isBanned, level, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        stmt.run(user.id, user.username, user.email, user.passwordHash, user.createdAt, user.bio || '', user.avatar || '', 'user', 0, 1, 0);

        // 2. Mark invite code as used
        const updateInvite = db.prepare('UPDATE invitation_codes SET isUsed = 1, usedBy = ? WHERE code = ?');
        updateInvite.run(user.id, inviteCode);

        // 3. Award XP to inviter
        const invite = db.prepare('SELECT creatorId FROM invitation_codes WHERE code = ?').get(inviteCode) as InvitationCode;
        if (invite && invite.creatorId) {
            addExperience(invite.creatorId, 50);
        }
    });

    transaction();
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
    const fields = [];
    const values = [];

    if (data.username) {
        fields.push('username = ?');
        values.push(data.username);
    }
    if (data.bio !== undefined) {
        fields.push('bio = ?');
        values.push(data.bio);
    }
    if (data.avatar !== undefined) {
        fields.push('avatar = ?');
        values.push(data.avatar);
    }
    if (data.role) {
        fields.push('role = ?');
        values.push(data.role);
    }
    if (data.isBanned !== undefined) {
        fields.push('isBanned = ?');
        values.push(data.isBanned);
    }
    // Level and Experience are usually updated via specific functions, but allowing here for admin edits
    if (data.level !== undefined) {
        fields.push('level = ?');
        values.push(data.level);
    }
    if (data.experience !== undefined) {
        fields.push('experience = ?');
        values.push(data.experience);
    }

    if (fields.length === 0) return;

    values.push(id);
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
}

// Badge Functions
export async function getBadges(): Promise<Badge[]> {
    return db.prepare('SELECT * FROM badges').all() as Badge[];
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
    return db.prepare(`
        SELECT ub.*, b.slug, b.name, b.description, b.icon, b.createdAt as badgeCreatedAt
        FROM user_badges ub
        JOIN badges b ON ub.badgeId = b.id
        WHERE ub.userId = ?
        ORDER BY ub.awardedAt DESC
    `).all(userId).map((row: any) => ({
        userId: row.userId,
        badgeId: row.badgeId,
        awardedAt: row.awardedAt,
        badge: {
            id: row.badgeId,
            slug: row.slug,
            name: row.name,
            description: row.description,
            icon: row.icon,
            createdAt: row.badgeCreatedAt
        }
    }));
}

export async function awardBadge(userId: string, badgeSlug: string): Promise<void> {
    const badge = db.prepare('SELECT id FROM badges WHERE slug = ?').get(badgeSlug) as Badge;
    if (!badge) return;

    try {
        db.prepare('INSERT INTO user_badges (userId, badgeId, awardedAt) VALUES (?, ?, ?)').run(userId, badge.id, new Date().toISOString());
    } catch (e) {
        // Ignore if already awarded
    }
}

// Shop Functions
export async function getShopItems(): Promise<ShopItem[]> {
    return db.prepare('SELECT * FROM shop_items').all() as ShopItem[];
}

export async function getUserItems(userId: string): Promise<UserItem[]> {
    return db.prepare(`
        SELECT ui.*, si.name, si.description, si.price, si.icon, si.type, si.data
        FROM user_items ui
        JOIN shop_items si ON ui.itemId = si.id
        WHERE ui.userId = ?
        ORDER BY ui.purchasedAt DESC
    `).all(userId).map((row: any) => ({
        id: row.id,
        userId: row.userId,
        itemId: row.itemId,
        purchasedAt: row.purchasedAt,
        isEquipped: row.isEquipped,
        item: {
            id: row.itemId,
            name: row.name,
            description: row.description,
            price: row.price,
            icon: row.icon,
            type: row.type,
            data: row.data
        }
    }));
}

export async function purchaseItem(userId: string, itemId: string): Promise<{ success: boolean; message: string }> {
    const user = db.prepare('SELECT experience FROM users WHERE id = ?').get(userId) as User;
    const item = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(itemId) as ShopItem;

    if (!user || !item) return { success: false, message: 'User or item not found' };
    if (user.experience < item.price) return { success: false, message: 'Not enough XP' };

    const transaction = db.transaction(() => {
        // Deduct XP
        db.prepare('UPDATE users SET experience = experience - ? WHERE id = ?').run(item.price, userId);
        // Add Item
        db.prepare('INSERT INTO user_items (id, userId, itemId, purchasedAt) VALUES (?, ?, ?, ?)').run(randomUUID(), userId, itemId, new Date().toISOString());
    });

    try {
        transaction();
        return { success: true, message: 'Purchase successful!' };
    } catch (e) {
        return { success: false, message: 'Transaction failed' };
    }
}

// Resonance Functions
export async function addResonance(resonance: Resonance): Promise<void> {
    const stmt = db.prepare('INSERT INTO resonances (id, postId, content, x, y, createdAt, userId) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(resonance.id, resonance.postId, resonance.content, resonance.x, resonance.y, resonance.createdAt, resonance.userId);
}

export async function getResonances(postId: string): Promise<Resonance[]> {
    return db.prepare('SELECT * FROM resonances WHERE postId = ?').all(postId) as Resonance[];
}

// Verification Functions
export async function createVerificationCode(email: string, code: string, type: 'register' | 'login'): Promise<void> {
    // Delete existing codes for this email and type
    db.prepare('DELETE FROM verification_codes WHERE email = ? AND type = ?').run(email, type);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
    db.prepare('INSERT INTO verification_codes (id, email, code, type, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
        randomUUID(), email, code, type, expiresAt, new Date().toISOString()
    );
}

export async function verifyCode(email: string, code: string, type: 'register' | 'login'): Promise<boolean> {
    const record = db.prepare('SELECT * FROM verification_codes WHERE email = ? AND type = ? AND code = ?').get(email, type, code) as VerificationCode;

    if (!record) return false;

    if (new Date(record.expiresAt) < new Date()) {
        db.prepare('DELETE FROM verification_codes WHERE id = ?').run(record.id);
        return false;
    }

    // Code is valid, delete it
    db.prepare('DELETE FROM verification_codes WHERE id = ?').run(record.id);
    return true;
}

// Friend Functions
export async function sendFriendRequest(userId: string, friendId: string): Promise<{ success: boolean; message: string }> {
    if (userId === friendId) return { success: false, message: '不能添加自己为好友' };

    const existing = db.prepare('SELECT * FROM friends WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)').get(userId, friendId, friendId, userId) as Friend;

    if (existing) {
        if (existing.status === 'accepted') return { success: false, message: '已经是好友了' };
        if (existing.userId === userId) return { success: false, message: '已发送过请求' };
        return { success: false, message: '对方已发送请求，请去处理' };
    }

    db.prepare('INSERT INTO friends (id, userId, friendId, status, createdAt) VALUES (?, ?, ?, ?, ?)').run(
        randomUUID(), userId, friendId, 'pending', new Date().toISOString()
    );
    return { success: true, message: '好友请求已发送' };
}

export async function getFriends(userId: string): Promise<Friend[]> {
    // Get accepted friends where user is either sender or receiver
    const friends = db.prepare(`
        SELECT f.*, u.id as uid, u.username, u.avatar, u.level, u.role
        FROM friends f
        JOIN users u ON (f.userId = u.id OR f.friendId = u.id)
        WHERE (f.userId = ? OR f.friendId = ?) AND f.status = 'accepted' AND u.id != ?
    `).all(userId, userId, userId) as any[];

    return friends.map(f => ({
        id: f.id,
        userId: userId,
        friendId: f.uid,
        status: 'accepted',
        createdAt: f.createdAt,
        friend: {
            id: f.uid,
            username: f.username,
            avatar: f.avatar,
            level: f.level,
            role: f.role
        } as User
    }));
}

export async function getFriendRequests(userId: string): Promise<Friend[]> {
    // Get pending requests received by user
    const requests = db.prepare(`
        SELECT f.*, u.id as uid, u.username, u.avatar, u.level
        FROM friends f
        JOIN users u ON f.userId = u.id
        WHERE f.friendId = ? AND f.status = 'pending'
    `).all(userId) as any[];

    return requests.map(r => ({
        id: r.id,
        userId: r.userId,
        friendId: userId,
        status: 'pending',
        createdAt: r.createdAt,
        friend: {
            id: r.uid,
            username: r.username,
            avatar: r.avatar,
            level: r.level
        } as User
    }));
}

export async function respondToFriendRequest(requestId: string, action: 'accept' | 'reject'): Promise<void> {
    if (action === 'reject') {
        db.prepare('DELETE FROM friends WHERE id = ?').run(requestId);
    } else {
        db.prepare('UPDATE friends SET status = "accepted" WHERE id = ?').run(requestId);
    }
}

// Public Chat Message Functions
export async function createPublicMessage(senderId: string, content: string): Promise<void> {
    db.prepare('INSERT INTO messages (id, senderId, content, createdAt) VALUES (?, ?, ?, ?)').run(
        randomUUID(), senderId, content, new Date().toISOString()
    );
}

export async function getPublicMessages(limit: number = 50): Promise<any[]> {
    const messages = db.prepare(`
        SELECT m.*, u.username as senderName, u.avatar as senderAvatar
        FROM messages m
        JOIN users u ON m.senderId = u.id
        WHERE m.receiverId IS NULL
        ORDER BY m.createdAt DESC
        LIMIT ?
    `).all(limit) as any[];

    return messages.reverse(); // Return in chronological order
}

// Leveling Functions
export function addExperience(userId: string, amount: number) {
    const user = db.prepare('SELECT level, experience FROM users WHERE id = ?').get(userId) as User;
    if (!user) return;

    let newExperience = user.experience + amount;
    let newLevel = user.level;

    // Simple leveling curve: Level * 100 XP required for next level
    // Lv 1 -> 2: 100 XP
    // Lv 2 -> 3: 200 XP
    // Lv 3 -> 4: 300 XP
    let requiredXp = newLevel * 100;

    while (newExperience >= requiredXp) {
        newExperience -= requiredXp;
        newLevel++;
        requiredXp = newLevel * 100;
    }

    db.prepare('UPDATE users SET level = ?, experience = ? WHERE id = ?').run(newLevel, newExperience, userId);
}

// Invite Functions
export function validateInviteCode(code: string): boolean {
    const invite = db.prepare('SELECT 1 FROM invitation_codes WHERE code = ? AND isUsed = 0').get(code);
    return !!invite;
}

export function generateInviteCode(creatorId: string): string {
    const code = 'INV-' + randomUUID().substring(0, 8).toUpperCase();
    db.prepare('INSERT INTO invitation_codes (code, creatorId, isUsed, createdAt) VALUES (?, ?, 0, ?)').run(code, creatorId, new Date().toISOString());
    return code;
}

export function getUserInviteCodes(userId: string): InvitationCode[] {
    return db.prepare('SELECT * FROM invitation_codes WHERE creatorId = ? ORDER BY createdAt DESC').all(userId) as InvitationCode[];
}


// Admin Functions
export async function deletePost(postId: string): Promise<void> {
    // Delete comments first
    db.prepare('DELETE FROM comments WHERE postId = ?').run(postId);
    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
}

export async function deleteComment(commentId: string): Promise<void> {
    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
}

// Message Functions
export async function sendMessage(message: Message): Promise<void> {
    const stmt = db.prepare('INSERT INTO messages (id, senderId, receiverId, content, createdAt, isRead) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(message.id, message.senderId, message.receiverId, message.content, message.createdAt, message.isRead);
}

export async function getMessages(userId1: string, userId2: string): Promise<Message[]> {
    return db.prepare(`
        SELECT m.*, 
               u1.username as senderName, u1.avatar as senderAvatar,
               u2.username as receiverName, u2.avatar as receiverAvatar
        FROM messages m
        JOIN users u1 ON m.senderId = u1.id
        JOIN users u2 ON m.receiverId = u2.id
        WHERE (m.senderId = ? AND m.receiverId = ?) 
           OR (m.senderId = ? AND m.receiverId = ?)
        ORDER BY m.createdAt ASC
    `).all(userId1, userId2, userId2, userId1) as Message[];
}

export async function getConversations(userId: string): Promise<User[]> {
    // Get unique users that the current user has exchanged messages with
    const users = db.prepare(`
        SELECT DISTINCT u.*
        FROM users u
        JOIN messages m ON (m.senderId = u.id AND m.receiverId = ?) 
                        OR (m.receiverId = u.id AND m.senderId = ?)
    `).all(userId, userId) as User[];
    return users;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export async function getRecentUsers(limit: number = 4): Promise<User[]> {
    return db.prepare('SELECT * FROM users ORDER BY createdAt DESC LIMIT ?').all(limit) as User[];
}

// Post Functions
export async function getPosts(page: number = 1, limit: number = 10, search: string = '', category: string = '', authorId: string = '', currentUserId?: string): Promise<{ posts: Post[], total: number }> {
    const offset = (page - 1) * limit;
    let query = `
        SELECT p.*, u.username as authorName, u.level as authorLevel
        FROM posts p 
        JOIN users u ON p.authorId = u.id
    `;
    let countQuery = `
        SELECT COUNT(*) as count 
        FROM posts p 
        JOIN users u ON p.authorId = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
        conditions.push('(p.title LIKE ? OR p.content LIKE ? OR u.username LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
        conditions.push('p.category = ?');
        params.push(category);
    }

    if (authorId) {
        conditions.push('p.authorId = ?');
        params.push(authorId);
    }

    if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
    }

    query += ' ORDER BY p.date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rawPosts = db.prepare(query).all(...params) as any[];
    // For count query, we need to remove limit and offset params
    const countParams = params.slice(0, -2);
    const total = (db.prepare(countQuery).get(...countParams) as { count: number }).count;

    const posts = rawPosts.map(p => {
        // Content Protection Logic
        // If author level >= 3 (Advanced User) and viewer is not logged in (currentUserId is undefined)
        // Mask the content and excerpt
        let content = p.content;
        let excerpt = p.excerpt;
        let isProtected = false;

        if (p.authorLevel >= 3 && !currentUserId) {
            content = '🔒 该内容仅限会员查看，请登录后阅读。';
            excerpt = '🔒 该内容仅限会员查看...';
            isProtected = true;
        }

        return {
            ...p,
            content,
            excerpt,
            isProtected,
            tags: p.tags ? p.tags.split(',') : []
        };
    });

    return { posts, total };
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const post = db.prepare(`
        SELECT p.*, u.username as authorName 
        FROM posts p 
        JOIN users u ON p.authorId = u.id 
        WHERE p.slug = ?
    `).get(slug) as any;

    if (!post) return undefined;
    return {
        ...post,
        tags: post.tags ? post.tags.split(',') : []
    };
}

export async function addPost(post: Post): Promise<void> {
    const stmt = db.prepare(`
        INSERT INTO posts (id, slug, title, content, excerpt, category, tags, date, authorId) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
        post.id,
        post.slug,
        post.title,
        post.content,
        post.excerpt,
        post.category,
        post.tags.join(','),
        post.date,
        post.authorId
    );
}

// Comment Functions
export async function getComments(postId: string): Promise<Comment[]> {
    const comments = db.prepare(`
        SELECT c.*, u.username 
        FROM comments c 
        JOIN users u ON c.userId = u.id 
        WHERE c.postId = ? 
        ORDER BY c.createdAt DESC
    `).all(postId) as Comment[];
    return comments;
}

export async function addComment(comment: Comment): Promise<void> {
    const stmt = db.prepare('INSERT INTO comments (id, content, createdAt, postId, userId) VALUES (?, ?, ?, ?, ?)');
    stmt.run(comment.id, comment.content, comment.createdAt, comment.postId, comment.userId);
}

// Social Functions
export async function followUser(followerId: string, followingId: string): Promise<void> {
    try {
        const stmt = db.prepare('INSERT INTO follows (id, followerId, followingId, createdAt) VALUES (?, ?, ?, ?)');
        stmt.run(randomUUID(), followerId, followingId, new Date().toISOString());
    } catch (e) {
        // Ignore unique constraint violation
    }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
    const stmt = db.prepare('DELETE FROM follows WHERE followerId = ? AND followingId = ?');
    stmt.run(followerId, followingId);
}

export async function getFollowers(userId: string): Promise<User[]> {
    return db.prepare(`
        SELECT u.* 
        FROM users u 
        JOIN follows f ON u.id = f.followerId 
        WHERE f.followingId = ?
    `).all(userId) as User[];
}

export async function getFollowing(userId: string): Promise<User[]> {
    return db.prepare(`
        SELECT u.* 
        FROM users u 
        JOIN follows f ON u.id = f.followingId 
        WHERE f.followerId = ?
    `).all(userId) as User[];
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = db.prepare('SELECT 1 FROM follows WHERE followerId = ? AND followingId = ?').get(followerId, followingId);
    return !!result;
}

export async function getUserStats(userId: string): Promise<{ postsCount: number; commentsCount: number }> {
    const postsCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE authorId = ?').get(userId) as { count: number };
    const commentsCount = db.prepare('SELECT COUNT(*) as count FROM comments WHERE userId = ?').get(userId) as { count: number };
    return {
        postsCount: postsCount.count,
        commentsCount: commentsCount.count
    };
}
