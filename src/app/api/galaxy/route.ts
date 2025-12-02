import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/db';

export async function GET() {
    const { posts } = await getPosts(1, 100);

    const nodes: any[] = [];
    const links: any[] = [];
    const tagsMap = new Map<string, string>(); // tag -> nodeId

    // 1. Create Post Nodes
    posts.forEach(post => {
        nodes.push({
            id: `post-${post.id}`,
            label: post.title,
            type: 'post',
            slug: post.slug,
            radius: 5 + Math.random() * 3, // Random size for stars
            color: '#38bdf8', // Blue stars
            x: 0, y: 0, vx: 0, vy: 0
        });

        // 2. Collect Tags
        post.tags.forEach(tag => {
            if (!tagsMap.has(tag)) {
                const tagId = `tag-${tag}`;
                tagsMap.set(tag, tagId);
                nodes.push({
                    id: tagId,
                    label: tag,
                    type: 'tag',
                    radius: 8, // Larger for tags (centers)
                    color: '#f472b6', // Pink nebulas
                    x: 0, y: 0, vx: 0, vy: 0
                });
            }

            // 3. Link Post to Tag
            links.push({
                source: `post-${post.id}`,
                target: tagsMap.get(tag)
            });
        });
    });

    return NextResponse.json({ nodes, links });
}
