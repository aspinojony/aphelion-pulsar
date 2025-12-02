'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { updateUser } from '@/lib/db';
import { z } from 'zod';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const profileSchema = z.object({
    bio: z.string().max(160, '个人简介不能超过160个字符').optional(),
    avatarUrl: z.string().optional(),
});

export async function updateProfileAction(prevState: any, formData: FormData) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { message: '请先登录' };
        }

        const bio = formData.get('bio') as string;
        const avatarUrl = formData.get('avatarUrl') as string;
        const avatarFile = formData.get('avatarFile') as File;

        // Validate text fields
        const validatedFields = profileSchema.safeParse({ bio, avatarUrl });

        if (!validatedFields.success) {
            return {
                message: validatedFields.error.issues[0].message,
            };
        }

        let finalAvatarPath = user.avatar; // Default to existing

        // Handle File Upload
        if (avatarFile && avatarFile.size > 0) {
            // Validate file size (e.g., 2MB)
            if (avatarFile.size > 2 * 1024 * 1024) {
                return { message: '图片大小不能超过 2MB' };
            }

            // Validate file type
            if (!avatarFile.type.startsWith('image/')) {
                return { message: '请上传有效的图片文件' };
            }

            const bytes = await avatarFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const filename = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${avatarFile.type.split('/')[1]}`;
            const uploadDir = join(process.cwd(), 'public', 'uploads');
            const filepath = join(uploadDir, filename);

            await writeFile(filepath, buffer);
            finalAvatarPath = `/uploads/${filename}`;
        }
        // Handle Preset URL (only if no file uploaded)
        else if (avatarUrl) {
            finalAvatarPath = avatarUrl;
        }

        await updateUser(user.id, {
            bio: validatedFields.data.bio,
            avatar: finalAvatarPath
        });

        revalidatePath('/settings');
        revalidatePath(`/user/${user.id}`);

        return { message: '个人资料更新成功！' };

    } catch (error) {
        console.error('Error updating profile:', error);
        return { message: '更新失败，请重试' };
    }
}
