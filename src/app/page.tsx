import { getPosts } from "@/lib/db";
import PostCard from "@/components/PostCard";
import styles from "./page.module.css";

import Pagination from "@/components/Pagination";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const { category, page = '1' } = await searchParams;
  const currentPage = parseInt(page);
  const limit = 10;

  const { posts, total } = await getPosts(currentPage, limit, '', category || '');

  const title = category
    ? `${category === 'daily' ? '日常' : category === 'tech' ? '技术' : category} 频道`
    : '最新文章';

  return (
    <>
      {!category && (
        <div className={styles.hero}>
          <h1 className={styles.title}>
            欢迎来到 <span className={styles.textGradient}>aspinojony的小站</span>
          </h1>
          <p className={styles.subtitle}>分享关于技术、设计与未来的思考与故事。</p>
        </div>
      )}

      <h2 className={styles.sectionTitle}>
        {title}
      </h2>

      <div className={styles.postList}>
        {posts.length === 0 ? (
          <p className={styles.emptyState}>暂无文章</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      <Pagination total={total} limit={limit} />
    </>
  );
}
