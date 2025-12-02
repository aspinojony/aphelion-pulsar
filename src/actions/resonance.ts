'use server';

import { addResonance, getResonances, Resonance } from '@/lib/db';
import { randomUUID } from 'crypto';
import { getCurrentUser } from './auth';

export async function createResonance(postId: string, content: string, x: number, y: number) {
    const user = await getCurrentUser();

    const resonance: Resonance = {
        id: randomUUID(),
        postId,
        content,
        x,
        y,
        createdAt: new Date().toISOString(),
        userId: user?.id
    };

    await addResonance(resonance);
    return resonance;
}

export async function fetchResonances(postId: string) {
    return await getResonances(postId);
}
