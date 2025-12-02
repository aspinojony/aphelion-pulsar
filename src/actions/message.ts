'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { sendMessage } from '@/lib/db';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const messageSchema = z.object({
    receiverId: z.string(),
    content: z.string().min(1, '消息内容不能为空').max(1000, '消息内容过长'),
});

export async function sendMessageAction(prevState: any, formData: FormData) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { message: '请先登录' };
        }

        const rawData = {
            receiverId: formData.get('receiverId'),
            content: formData.get('content'),
        };

        const validatedFields = messageSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                message: validatedFields.error.issues[0].message,
            };
        }

        const { receiverId, content } = validatedFields.data;

        await sendMessage({
            id: randomUUID(),
            senderId: user.id,
            receiverId: receiverId,
            content: content,
            createdAt: new Date().toISOString(),
            isRead: 0,
        });

        revalidatePath(`/messages/${receiverId}`);
        return { message: '发送成功', success: true };

    } catch (error) {
        console.error('Error sending message:', error);
        return { message: '发送失败，请重试' };
    }
}
