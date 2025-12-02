import { getCurrentUser } from '@/actions/auth';
import { getPosts } from '@/lib/db';
import PostCard from '@/components/PostCard';
import { redirect } from 'next/navigation';

export default async function HistoryPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    const { posts } = await getPosts(1, 20, '', '', user.id);

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                <span className="text-gradient">管理记录</span>
            </h1>
            <p style={{ marginBottom: '2rem', color: '#888' }}>您最近发布的文章</p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <p style={{ color: '#666' }}>暂无发布记录</p>
                )}
            </div>
        </div>
    );
}
