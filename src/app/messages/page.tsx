import { getCurrentUser } from '@/actions/auth';
import { getConversations } from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MessagesPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    const conversations = await getConversations(user.id);

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                <span className="text-gradient">我的消息</span>
            </h1>

            <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                {conversations.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                        <p>暂无消息记录</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>去其他用户主页发起聊天吧！</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {conversations.map(u => (
                            <Link
                                key={u.id}
                                href={`/messages/${u.id}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    textDecoration: 'none',
                                    transition: 'background 0.2s'
                                }}
                                className="hover-bg"
                            >
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    background: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {u.avatar ? (
                                        <img src={u.avatar} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>{u.username[0].toUpperCase()}</span>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{u.username}</h3>
                                    <p style={{ margin: '0.2rem 0 0', color: '#888', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        点击查看聊天记录
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
