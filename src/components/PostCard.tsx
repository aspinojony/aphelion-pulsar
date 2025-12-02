import Link from 'next/link';
import Tag from './Tag';
import styles from './PostCard.module.css';
import { Post } from '@/lib/db';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <span className={styles.date}>{post.date}</span>
            </div>

            <div className={styles.tags}>
                {post.tags.map((tag: string) => <Tag key={tag} label={tag} />)}
            </div>

            <p className={styles.excerpt}>
                {post.excerpt}
            </p>
        </div>
    );
}
