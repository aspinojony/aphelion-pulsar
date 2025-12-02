import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { getPostBySlug } from '@/lib/db';
import TableOfContents from '@/components/TableOfContents';
import Tag from '@/components/Tag';
import CommentSection from '@/components/CommentSection';
import 'highlight.js/styles/atom-one-dark.css'; // Import highlight.js style
import { Metadata } from 'next';
import { getCurrentUser } from '@/actions/auth';
import ResonanceLayer from '@/components/ResonanceLayer';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: '文章未找到',
            description: '请求的文章不存在'
        };
    }

    return {
        title: `${post.title} | aspinojony的小站`,
        description: post.excerpt || post.content.substring(0, 150),
        openGraph: {
            title: post.title,
            description: post.excerpt || post.content.substring(0, 150),
            type: 'article',
            publishedTime: post.date,
            authors: [post.authorName || 'aspinojony'],
            tags: post.tags,
        }
    };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const user = await getCurrentUser();

    return (
        <article className="container" style={{ paddingTop: '20px', paddingBottom: '50px', position: 'relative' }}>
            {/* Resonance Layer */}
            <ResonanceLayer postId={post.id} />

            <Link href="/blog" style={{ color: '#888', marginBottom: '2rem', display: 'inline-block' }}>
                &larr; 返回博客
            </Link>

            <div className="glass" style={{ padding: '3rem', borderRadius: '20px', marginBottom: '2rem' }}>
                <header style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>
                        <span className="text-gradient">{post.title}</span>
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem', color: '#888', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>5 分钟阅读</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {post.tags.map((tag: string) => <Tag key={tag} label={tag} />)}
                    </div>
                </header>

                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    <TableOfContents content={post.content} />
                </div>

                <div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                            h1: ({ node, ...props }) => {
                                const text = props.children?.toString() || '';
                                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                return <h1 id={id} {...props} />;
                            },
                            h2: ({ node, ...props }) => {
                                const text = props.children?.toString() || '';
                                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                return <h2 id={id} {...props} />;
                            },
                            h3: ({ node, ...props }) => {
                                const text = props.children?.toString() || '';
                                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                return <h3 id={id} {...props} />;
                            },
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>
            </div>

            <CommentSection slug={slug} />
        </article>
    );
}
