'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { addPost } from '@/lib/db';
import { getCurrentUser } from './auth';
import { randomUUID } from 'crypto';
import { createPostSchema } from '@/lib/schemas';

export async function createPostAction(prevState: any, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect('/login');
    }

    const rawData = {
      title: formData.get('title'),
      content: formData.get('content'),
      category: formData.get('category'),
      tags: formData.get('tags'),
      excerpt: formData.get('excerpt'),
    };

    const validatedFields = createPostSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        message: validatedFields.error.issues[0].message,
      };
    }

    const { title, content, category, tags: tagsString, excerpt } = validatedFields.data;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

    const newPost = {
      id: randomUUID(),
      slug: `${slug}-${randomUUID().substring(0, 8)}`,
      title,
      content,
      category: category || 'uncategorized',
      tags,
      excerpt: excerpt || content.substring(0, 150) + '...',
      date: new Date().toISOString().split('T')[0],
      authorId: user.id,
      authorName: user.username
    };

    await addPost(newPost);

  } catch (error) {
    console.error('Error in createPost:', error);
    return { message: 'Error creating post' };
  }

  revalidatePath('/');
  return { message: 'Post created successfully!' };
}
