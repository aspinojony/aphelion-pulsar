import { getPosts as dbGetPosts, getPostBySlug as dbGetPostBySlug } from './db';
import { Post } from './db';

// Re-export Post interface
export type { Post };

// Wrapper functions to maintain compatibility but fetch from DB
export async function getPosts(): Promise<Post[]> {
  const result = await dbGetPosts(1, 100); // Fetch more posts for legacy compatibility
  return result.posts;
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return await dbGetPostBySlug(slug);
}
