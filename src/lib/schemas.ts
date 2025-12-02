import { z } from 'zod';

export const createPostSchema = z.object({
    title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
    content: z.string().min(1, '内容不能为空'),
    category: z.string().optional(),
    tags: z.string().optional(),
    excerpt: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
