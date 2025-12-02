const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(process.cwd(), 'aphelion.db');
const db = new Database(dbPath);

console.log('Starting content and follow seeding...');

// 1. Get Admin User
const admin = db.prepare("SELECT * FROM users WHERE username = 'aspinojony'").get();
if (!admin) {
    console.error('Admin user not found!');
    process.exit(1);
}
console.log(`Admin found: ${admin.username} (${admin.id})`);

// 2. Make all users follow admin
const users = db.prepare("SELECT id FROM users WHERE id != ?").all(admin.id);
console.log(`Found ${users.length} other users.`);

const insertFollow = db.prepare(`
    INSERT OR IGNORE INTO follows (id, followerId, followingId, createdAt)
    VALUES (?, ?, ?, ?)
`);

let followCount = 0;
const followTransaction = db.transaction((users) => {
    for (const user of users) {
        insertFollow.run(crypto.randomUUID(), user.id, admin.id, new Date().toISOString());
        followCount++;
    }
});

try {
    followTransaction(users);
    console.log(`Successfully made ${followCount} users follow admin.`);
} catch (error) {
    console.error('Error seeding follows:', error);
}

// 3. Seed Posts for Categories
const CATEGORIES = {
    'tech': [
        { title: '深入理解 React Server Components', content: 'React Server Components (RSC) 是 React 生态系统中的一项重大变革...' },
        { title: 'Next.js 15 的新特性解析', content: 'Next.js 15 带来了许多令人兴奋的新特性，包括改进的缓存策略...' },
        { title: 'TypeScript 高级类型实战', content: '在大型项目中，合理使用 TypeScript 的高级类型可以极大地提高代码的可维护性...' },
        { title: 'WebAssembly 在前端的应用前景', content: 'WebAssembly (Wasm) 正在改变我们在浏览器中运行高性能应用的方式...' },
        { title: 'CSS Grid 与 Flexbox 的最佳实践', content: '虽然 Flexbox 已经非常强大，但 CSS Grid 提供了二维布局的能力...' },
        { title: 'Node.js 性能优化指南', content: '在构建高并发的 Node.js 应用时，性能优化是必不可少的一环...' },
        { title: 'GraphQL vs REST: 如何选择？', content: 'GraphQL 和 REST 都是构建 API 的流行方式，但它们各有优缺点...' },
        { title: '前端工程化：从 Webpack 到 Vite', content: '构建工具的演进反映了前端开发的快速发展...' },
        { title: 'Rust 对 Web 开发的影响', content: 'Rust 语言以其内存安全和高性能著称，正在逐渐渗透到 Web 开发领域...' },
        { title: '微前端架构的落地与实践', content: '微前端架构允许我们将大型前端应用拆分为更小、更易管理的独立部分...' },
        { title: 'Docker 容器化部署入门', content: 'Docker 使得应用的部署变得更加简单和一致...' },
        { title: 'Kubernetes 核心概念解析', content: 'Kubernetes 是容器编排的事实标准...' },
        { title: 'Serverless 架构的优势与挑战', content: 'Serverless 架构让开发者可以专注于代码，而无需关心服务器的管理...' },
        { title: 'Web 安全：常见的攻击与防御', content: '了解 XSS, CSRF 等常见攻击方式对于构建安全的 Web 应用至关重要...' },
        { title: 'PWA (Progressive Web Apps) 的现状', content: 'PWA 旨在提供接近原生应用的 Web 体验...' },
        { title: 'AI 辅助编程的未来', content: '随着 GitHub Copilot 等工具的普及，AI 正在改变我们的编程方式...' },
        { title: '数据库设计范式与反范式', content: '在设计数据库时，我们需要在范式和性能之间找到平衡...' },
        { title: 'Redis 缓存策略详解', content: 'Redis 是高性能的键值存储，常用于缓存、消息队列等场景...' },
        { title: 'Linux 常用命令速查', content: '掌握 Linux 命令行是每个后端开发者的基本功...' },
        { title: 'Git 工作流最佳实践', content: '良好的 Git 工作流可以提高团队协作的效率...' }
    ],
    'daily': [
        { title: '周末的徒步旅行', content: '这个周末去了一趟山里，空气真的很好...' },
        { title: '最近读的一本好书', content: '强烈推荐《三体》，刘慈欣的想象力真是太惊人了...' },
        { title: '尝试做了一次红烧肉', content: '虽然过程有点曲折，但最后味道还不错...' },
        { title: '关于早起的思考', content: '最近尝试每天 6 点起床，感觉效率确实提高了不少...' },
        { title: '城市里的日落', content: '下班路上偶然抬头，看到了绝美的晚霞...' },
        { title: '我的书桌改造计划', content: '为了提高工作效率，我决定重新布置一下我的书桌...' },
        { title: '一部让人深思的电影', content: '昨晚看了《星际穿越》，对爱和时间有了新的理解...' },
        { title: '练习冥想的第 30 天', content: '坚持冥想一个月了，感觉心态平和了很多...' },
        { title: '咖啡与代码', content: '一杯好咖啡是写代码的最佳伴侣...' },
        { title: '记录生活中的小确幸', content: '生活中不缺少美，只是缺少发现美的眼睛...' },
        { title: '一次失败的烘焙经历', content: '原本想做戚风蛋糕，结果变成了大饼...' },
        { title: '雨天的心情', content: '下雨天总是让人感到一种莫名的宁静...' },
        { title: '断舍离：清理杂物', content: '清理了家里不用的东西，感觉空间变大了，心情也变好了...' },
        { title: '学习一门新语言的乐趣', content: '最近开始学习日语，虽然很难，但很有趣...' },
        { title: '关于旅行的意义', content: '旅行不仅仅是看风景，更是去体验不同的生活方式...' },
        { title: '养猫的快乐与烦恼', content: '虽然猫咪很可爱，但掉毛也是真的严重...' },
        { title: '健身房打卡日记', content: '今天练了腿，感觉明天要下不了床了...' },
        { title: '如何保持对生活的热情', content: '设定小目标，并为之努力，是保持热情的秘诀...' },
        { title: '怀念小时候的味道', content: '突然很想吃小时候校门口的炸串...' },
        { title: '给未来的自己写一封信', content: '希望未来的自己，依然保持初心，勇敢前行...' }
    ]
};

const insertPost = db.prepare(`
    INSERT INTO posts (id, slug, title, content, excerpt, category, tags, date, authorId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let postCount = 0;
const postTransaction = db.transaction(() => {
    for (const [category, posts] of Object.entries(CATEGORIES)) {
        for (const post of posts) {
            const id = crypto.randomUUID();
            const slug = crypto.randomBytes(8).toString('hex'); // Simple random slug
            const author = users[Math.floor(Math.random() * users.length)]; // Random author from users

            insertPost.run(
                id,
                slug,
                post.title,
                post.content,
                post.content.substring(0, 100) + '...', // Excerpt
                category,
                category === 'tech' ? 'tech,programming,code' : 'life,daily,thoughts', // Simple tags
                new Date().toISOString(),
                author.id
            );
            postCount++;
        }
    }
});

try {
    postTransaction();
    console.log(`Successfully added ${postCount} posts across categories.`);
} catch (error) {
    console.error('Error seeding posts:', error);
}

console.log('Seeding completed!');
