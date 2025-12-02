import { getComments } from '@/lib/db';
import { getCurrentUser } from '@/actions/auth';
import CommentForm from './CommentForm';
import Link from 'next/link';

export default async function CommentSection({ slug }: { slug: string }) {
    const comments = await getComments(slug);
    const user = await getCurrentUser();

    return (
        <section style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>评论 ({comments.length})</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                {comments.length === 0 ? (
                    <p style={{ color: '#888', fontStyle: 'italic' }}>暂无评论，来抢沙发吧！</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <Link href={`/user/${comment.userId}`} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                                    {comment.username}
                                </Link>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p style={{ color: '#ddd', lineHeight: '1.6' }}>{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            {user ? (
                <CommentForm slug={slug} />
            ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <p style={{ marginBottom: '1rem', color: '#ccc' }}>登录后参与评论</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>登录</Link>
                        <span style={{ color: '#666' }}>|</span>
                        <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>注册</Link>
                    </div>
                </div>
            )}
        </section>
    );
}
