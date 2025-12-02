'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { purchaseItem } from '@/lib/db';

export async function purchaseItemAction(itemId: string) {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, message: '请先登录' };
    }

    const result = await purchaseItem(user.id, itemId);
    revalidatePath('/shop');
    return result;
}
