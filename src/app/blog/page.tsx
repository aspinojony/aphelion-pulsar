import Link from 'next/link';
import { getPosts } from '@/lib/db';
import Tag from '@/components/Tag';
import Pagination from '@/components/Pagination';

export default async function Blog({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page = '1' } = await searchParams;
    const currentPage = parseInt(page);
    const limit = 10;

    const { posts, total } = await getPosts(currentPage, limit);

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
                所有 <span className="text-gradient">文章</span>
            </h1>
            <div style={{ display: 'grid', gap: '2rem' }}>
                {posts.map((post) => (
                    <div key={post.id} className="glass" style={{ padding: '2rem', borderRadius: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '2rem' }}>{post.title}</h2>
                            <span style={{ color: '#888', fontSize: '0.9rem' }}>{new Date(post.date).toLocaleDateString()}</span>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            {post.tags.map((tag: string) => <Tag key={tag} label={tag} />)}
                        </div>

                        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#ccc' }}>{post.excerpt}</p>
                        <Link href={`/blog/${post.slug}`} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                            阅读全文 &rarr;
                        </Link>
                    </div>
                ))}
            </div>
            <Pagination total={total} limit={limit} />
        </div>
    );
}
