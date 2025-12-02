import { getCurrentUser } from '@/actions/auth';
import { getUsers, getPosts, type User, type Post } from '@/lib/db';
import { redirect } from 'next/navigation';
import { deletePostAction, toggleBanUserAction } from '@/actions/admin';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; page?: string; q?: string }> }) {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
        redirect('/');
    }

    const { tab = 'users', page = '1', q = '' } = await searchParams;
    const currentPage = parseInt(page);
    const limit = 10;

    let usersData: { users: User[]; total: number } = { users: [], total: 0 };
    let postsData: { posts: Post[]; total: number } = { posts: [], total: 0 };

    if (tab === 'users') {
        usersData = await getUsers(currentPage, limit, q);
    } else {
        postsData = await getPosts(currentPage, limit, q);
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                <span className="text-gradient">超级管理员后台</span>
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Link
                    href="/admin?tab=users"
                    style={{
                        padding: '1rem',
                        color: tab === 'users' ? 'var(--primary)' : '#888',
                        borderBottom: tab === 'users' ? '2px solid var(--primary)' : 'none',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    用户管理
                </Link>
                <Link
                    href="/admin?tab=posts"
                    style={{
                        padding: '1rem',
                        color: tab === 'posts' ? 'var(--primary)' : '#888',
                        borderBottom: tab === 'posts' ? '2px solid var(--primary)' : 'none',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    帖子管理
                </Link>
            </div>

            {tab === 'users' ? (
                <section className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>用户列表 ({usersData.total})</h2>
                    </div>

                    <SearchInput placeholder="搜索用户名或邮箱..." />

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '1rem' }}>用户</th>
                                    <th style={{ padding: '1rem' }}>邮箱</th>
                                    <th style={{ padding: '1rem' }}>角色</th>
                                    <th style={{ padding: '1rem' }}>状态</th>
                                    <th style={{ padding: '1rem' }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersData.users.map((u: any) => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {u.avatar ? <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.username[0].toUpperCase()}
                                            </div>
                                            {u.username}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{u.email}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                background: u.role === 'admin' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                                color: u.role === 'admin' ? '#000' : '#fff',
                                                fontSize: '0.8rem'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ color: u.isBanned ? '#f87171' : '#4ade80' }}>
                                                {u.isBanned ? '已禁言' : '正常'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {u.role !== 'admin' && (
                                                <form action={toggleBanUserAction.bind(null, u.id, u.isBanned ? 0 : 1)}>
                                                    <button
                                                        type="submit"
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '4px',
                                                            border: 'none',
                                                            background: u.isBanned ? '#4ade80' : '#f87171',
                                                            color: u.isBanned ? '#000' : '#fff',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {u.isBanned ? '解禁' : '禁言'}
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination total={usersData.total} limit={limit} />
                </section>
            ) : (
                <section className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>帖子列表 ({postsData.total})</h2>
                    </div>

                    <SearchInput placeholder="搜索帖子标题、内容或作者..." />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {postsData.posts.map((post: any) => (
                            <div key={post.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px'
                            }}>
                                <div>
                                    <Link href={`/blog/${post.slug}`} style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', textDecoration: 'none' }} className="hover-text">
                                        {post.title}
                                    </Link>
                                    <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.25rem' }}>
                                        By {post.authorName} · {new Date(post.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <form action={deletePostAction.bind(null, post.id)}>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '4px',
                                            border: '1px solid #f87171',
                                            background: 'transparent',
                                            color: '#f87171',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-bg-red"
                                    >
                                        删除
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                    <Pagination total={postsData.total} limit={limit} />
                </section>
            )}
        </div>
    );
}
