'use server';
import { getCurrentUser } from './auth';
import fs from 'fs';

export async function checkSession() {
    console.log('checkSession called');
    const user = await getCurrentUser();
    console.log('User:', user?.username);
    try {
        fs.writeFileSync('c:/Users/86166/.gemini/antigravity/playground/aphelion-pulsar/session_debug.txt', `User: ${user?.username}\n`);
    } catch (e) {
        console.error(e);
    }
    return user ? `Logged in as ${user.username}` : 'Not logged in';
}
