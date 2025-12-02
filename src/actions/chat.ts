'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getPublicMessages, createPublicMessage, findUserById } from '@/lib/db';

const COOKIE_NAME = 'aphelion_session';

async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;
    if (!userId) return null;
    return await findUserById(userId);
}

export async function createMessage(content: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error('未登录');

    await createPublicMessage(user.id, content);
    revalidatePath('/');
}

export async function getMessages() {
    return await getPublicMessages();
}
