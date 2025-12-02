import { getPosts } from '@/lib/db';
import PostCard from '@/components/PostCard';

export default async function RecommendPage() {
    // In a real app, this would be a sophisticated recommendation algorithm
    // For now, we'll just fetch some posts and shuffle them or pick the first few
    const { posts } = await getPosts(1, 20);

    // Simple shuffle
    const recommendedPosts = posts.sort(() => 0.5 - Math.random()).slice(0, 10);

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
                <span className="text-gradient">推荐阅读</span>
            </h1>
            <p style={{ marginBottom: '2rem', color: '#888' }}>为您精选的优质内容</p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {recommendedPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
