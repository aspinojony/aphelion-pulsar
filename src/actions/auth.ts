'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { addUser, findUserByEmail, findUserById, User } from '@/lib/db';
import { randomUUID } from 'crypto';

const COOKIE_NAME = 'auth_session';

export async function register(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const inviteCode = formData.get('inviteCode') as string;
    const verificationCode = formData.get('verificationCode') as string;

    if (!username || !email || !password || !inviteCode || !verificationCode) {
        return { message: '请填写所有字段，包括验证码' };
    }

    // Verify Email Code
    const { verifyCode } = await import('@/lib/db');
    const isCodeValid = await verifyCode(email, verificationCode, 'register');
    if (!isCodeValid) {
        return { message: '邮箱验证码无效或已过期' };
    }

    // Validate Invite Code
    const { validateInviteCode } = await import('@/lib/db');
    const isValidInvite = validateInviteCode(inviteCode);
    if (!isValidInvite) {
        return { message: '无效或已使用的邀请码' };
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        return { message: '该邮箱已被注册' };
    }

    const newUser: User = {
        id: randomUUID(),
        username,
        email,
        passwordHash: password, // In production, hash this!
        createdAt: new Date().toISOString(),
        role: 'user',
        isBanned: 0,
        level: 1,
        experience: 0
    };

    await addUser(newUser, inviteCode);

    // Auto login
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, newUser.id, { httpOnly: true, path: '/' });

    redirect('/');
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { message: '请输入邮箱和密码' };
    }

    const user = await findUserByEmail(email);
    if (!user || user.passwordHash !== password) {
        return { message: '邮箱或密码错误' };
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, user.id, { httpOnly: true, path: '/' });

    redirect('/');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    redirect('/');
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;

    if (!userId) return null;

    const user = await findUserById(userId);
    return user || null;
}

export async function sendVerificationCode(email: string, type: 'register' | 'login') {
    if (!email) return { success: false, message: '请输入邮箱' };

    // Check if user exists for login
    if (type === 'login') {
        const user = await findUserByEmail(email);
        if (!user) return { success: false, message: '该邮箱未注册' };
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB
    const { createVerificationCode } = await import('@/lib/db');
    await createVerificationCode(email, code, type);

    // Send Email
    const { sendEmail } = await import('@/lib/mail');
    const subject = type === 'register' ? '欢迎注册 Aphelion Pulsar - 验证码' : '登录验证码 - Aphelion Pulsar';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">Aphelion Pulsar</h2>
            <p>您好！</p>
            <p>您的验证码是：<strong style="font-size: 24px; color: #4f46e5;">${code}</strong></p>
            <p>该验证码将在 5 分钟后过期。</p>
            <p>如果这不是您的操作，请忽略此邮件。</p>
        </div>
    `;

    const emailSent = await sendEmail(email, subject, html);

    if (!emailSent) {
        // Fallback for dev/mock
        console.log('==================================================');
        console.log(`[MOCK EMAIL] To: ${email} | Type: ${type} | Code: ${code}`);
        console.log('==================================================');
        return { success: true, message: '验证码已发送（未配置邮件服务，请查看控制台）' };
    }

    return { success: true, message: '验证码已发送至您的邮箱' };
}

export async function loginWithCode(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const code = formData.get('code') as string;

    if (!email || !code) {
        return { message: '请输入邮箱和验证码' };
    }

    const { verifyCode } = await import('@/lib/db');
    const isValid = await verifyCode(email, code, 'login');

    if (!isValid) {
        return { message: '验证码无效或已过期' };
    }

    const user = await findUserByEmail(email);
    if (!user) {
        return { message: '用户不存在' };
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, user.id, { httpOnly: true, path: '/' });

    redirect('/');
}
