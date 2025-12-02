'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getFriends, getFriendRequests, respondToFriendRequest, sendFriendRequest, findUserById } from '@/lib/db';

const COOKIE_NAME = 'aphelion_session';

async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;
    if (!userId) return null;
    return await findUserById(userId);
}

export async function addFriend(friendId: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: '请先登录' };

    const result = await sendFriendRequest(user.id, friendId);
    revalidatePath('/user/[id]', 'page');
    return result;
}

export async function fetchFriends() {
    const user = await getCurrentUser();
    if (!user) return [];
    return await getFriends(user.id);
}

export async function fetchFriendRequests() {
    const user = await getCurrentUser();
    if (!user) return [];
    return await getFriendRequests(user.id);
}

export async function handleFriendRequest(requestId: string, action: 'accept' | 'reject') {
    await respondToFriendRequest(requestId, action);
    revalidatePath('/galaxy'); // Assuming chat is global or accessible from anywhere
    revalidatePath('/user/[id]', 'page');
}

export async function follow(targetUserId: string) {
    const user = await getCurrentUser();
    if (!user) return;

    const { followUser } = await import('@/lib/db');
    await followUser(user.id, targetUserId);
    revalidatePath('/user/[id]', 'page');
}

export async function unfollow(targetUserId: string) {
    const user = await getCurrentUser();
    if (!user) return;

    const { unfollowUser } = await import('@/lib/db');
    await unfollowUser(user.id, targetUserId);
    revalidatePath('/user/[id]', 'page');
}
