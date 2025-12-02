'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { addComment as dbAddComment, Comment } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function addComment(prevState: any, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        return { message: '请先登录' };
    }

    const content = formData.get('content') as string;
    const slug = formData.get('slug') as string;

    if (!content || !slug) {
        return { message: '内容不能为空' };
    }

    const newComment: Comment = {
        id: randomUUID(),
        postId: slug,
        userId: user.id,
        username: user.username,
        content,
        createdAt: new Date().toISOString(),
    };

    await dbAddComment(newComment);

    revalidatePath(`/blog/${slug}`);
    return { message: 'success' };
}
