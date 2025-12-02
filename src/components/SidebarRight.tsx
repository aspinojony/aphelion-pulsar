import Link from 'next/link';
import { getCurrentUser } from '@/actions/auth';
import { getFollowers, getFollowing, getUserStats, getRecentUsers } from '@/lib/db';
import styles from './SidebarRight.module.css';

export default async function SidebarRight() {
    const user = await getCurrentUser();
    const recentUsers = await getRecentUsers();
    let followersCount = 0;
    let followingCount = 0;
    let postsCount = 0;
    let commentsCount = 0;

    if (user) {
        const followers = await getFollowers(user.id);
        const following = await getFollowing(user.id);
        const stats = await getUserStats(user.id);

        followersCount = followers.length;
        followingCount = following.length;
        postsCount = stats.postsCount;
        commentsCount = stats.commentsCount;
    }

    return (
        <aside className={styles.sidebar}>
            {user ? (
                <div className={`glass ${styles.card}`}>
                    <div className={styles.profileHeader}>
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className={styles.avatar} style={{ objectFit: 'cover' }} />
                        ) : (
                            <div className={styles.avatar}>{user.username[0].toUpperCase()}</div>
                        )}
                        <div className={styles.userInfo}>
                            <Link href={`/user/${user.id}`} className={styles.username}>{user.username}</Link>
                            <div className={styles.userMeta}>
                                <span>等级 Lv {user.level || 1}</span>
                                <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.5rem' }}>
                                    (XP: {user.experience || 0})
                                </span>
                            </div>
                            {/* Badges Display */}
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                {(await import('@/lib/db')).getUserBadges(user.id).then(badges =>
                                    badges.slice(0, 5).map(ub => (
                                        <span key={ub.badgeId} title={ub.badge.name} style={{ fontSize: '1rem', cursor: 'help' }}>
                                            {ub.badge.icon}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>主题</span>
                            <span className={styles.statValue}>{postsCount}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>评论</span>
                            <span className={styles.statValue}>{commentsCount}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>粉丝</span>
                            <span className={styles.statValue}>{followersCount}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>关注</span>
                            <span className={styles.statValue}>{followingCount}</span>
                        </div>
                    </div>

                    <Link href="/blog/new" className={styles.postButton}>
                        + 发帖
                    </Link>
                </div>
            ) : (
                <div className={`glass ${styles.card}`}>
                    <p className={styles.loginPrompt}>登录后参与互动</p>
                    <div className={styles.authButtons}>
                        <Link href="/login" className={styles.loginBtn}>登录</Link>
                        <Link href="/register" className={styles.registerBtn}>注册</Link>
                    </div>
                </div>
            )}

            <div className={`glass ${styles.card}`}>
                <h3 className={styles.sectionTitle}>快捷功能区</h3>
                <ul className={styles.linkList}>
                    {user?.role === 'admin' && (
                        <li><Link href="/admin" style={{ color: '#f87171' }}>🛡️ 管理后台</Link></li>
                    )}
                    <li><Link href="/settings">⚙️ 个人设置</Link></li>
                    <li><Link href="/messages">💬 我的消息</Link></li>
                    <li><Link href="/recommend">📚 推荐阅读</Link></li>
                    <li><Link href="/history">🕰️ 管理记录</Link></li>
                    <li><Link href="/lottery">🎉 幸运抽奖</Link></li>
                    <li><Link href="/shop">🎁 积分商城</Link></li>
                    <li><Link href="/invite">🔗 邀请好友</Link></li>
                    <li><Link href="/partners">🤝 合作商家</Link></li>
                    <li><Link href="/links">🔗 友站链接</Link></li>
                </ul>
            </div>

            <div className={`glass ${styles.card}`}>
                <h3 className={styles.sectionTitle}>欢迎新用户 🎉</h3>
                <div className={styles.newUserGrid}>
                    {recentUsers.length > 0 ? (
                        recentUsers.map(u => (
                            <Link key={u.id} href={`/user/${u.id}`} className={styles.newUserAvatar} title={u.username}>
                                {u.avatar ? (
                                    <img src={u.avatar} alt={u.username} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} />
                                ) : (
                                    u.username[0].toUpperCase()
                                )}
                            </Link>
                        ))
                    ) : (
                        <p style={{ color: '#888', fontSize: '0.8rem', gridColumn: '1 / -1', textAlign: 'center' }}>暂无新用户</p>
                    )}
                </div>
            </div>
        </aside>
    );
}
