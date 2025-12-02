import { findUserById, getFollowers, getFollowing, isFollowing } from '@/lib/db';
import { getCurrentUser } from '@/actions/auth';
import { notFound } from 'next/navigation';
import { follow, unfollow } from '@/actions/social';
import Link from 'next/link';

export default async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await findUserById(id);

    if (!user) {
        notFound();
    }

    const currentUser = await getCurrentUser();
    const followers = await getFollowers(id);
    const following = await getFollowing(id);
    const isFollowingUser = currentUser ? await isFollowing(currentUser.id, id) : false;
    const isSelf = currentUser?.id === id;

    return (
        <main className="container" style={{ paddingTop: '120px', paddingBottom: '50px' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                            <span className="text-gradient">{user.username}</span>
                        </h1>
                        <p style={{ color: '#888' }}>加入时间: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>

                    {currentUser && !isSelf && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <form action={async () => {
                                'use server';
                                const { addFriend } = await import('@/actions/social');
                                await addFriend(id);
                            }}>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '9999px',
                                        background: 'rgba(79, 70, 229, 0.2)',
                                        color: '#fff',
                                        border: '1px solid rgba(79, 70, 229, 0.5)',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ➕ 加好友
                                </button>
                            </form>
                            <form action={isFollowingUser ? unfollow.bind(null, id) : follow.bind(null, id)}>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '9999px',
                                        background: isFollowingUser ? 'transparent' : '#fff',
                                        color: isFollowingUser ? '#fff' : '#000',
                                        border: isFollowingUser ? '1px solid rgba(255,255,255,0.2)' : 'none',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isFollowingUser ? '取消关注' : '关注'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '2rem 0' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{followers.length}</div>
                        <div style={{ color: '#888' }}>粉丝</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{following.length}</div>
                        <div style={{ color: '#888' }}>关注</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>粉丝列表</h3>
                        {followers.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>暂无粉丝</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {followers.map(f => (
                                    <Link key={f.id} href={`/user/${f.id}`} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'block' }}>
                                        {f.username}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>关注列表</h3>
                        {following.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>暂无关注</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {following.map(f => (
                                    <Link key={f.id} href={`/user/${f.id}`} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'block' }}>
                                        {f.username}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
