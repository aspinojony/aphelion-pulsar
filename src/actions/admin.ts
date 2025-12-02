'use server';

import { getCurrentUser } from './auth';
import { deletePost, deleteComment, updateUser, getUsers, getPosts } from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
    }
    return user;
}

export async function deletePostAction(postId: string) {
    try {
        await checkAdmin();
        await deletePost(postId);
        revalidatePath('/');
        revalidatePath('/admin');
    } catch (error) {
        console.error('Failed to delete post:', error);
    }
}

export async function deleteCommentAction(commentId: string) {
    try {
        await checkAdmin();
        await deleteComment(commentId);
        revalidatePath('/admin');
    } catch (error) {
        console.error('Failed to delete comment:', error);
    }
}

export async function toggleBanUserAction(userId: string, isBanned: number) {
    try {
        await checkAdmin();
        await updateUser(userId, { isBanned });
        revalidatePath('/admin');
    } catch (error) {
        console.error('Failed to toggle ban:', error);
    }
}
