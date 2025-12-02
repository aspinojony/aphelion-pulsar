'use client';

import { useActionState, useState } from 'react';
import { register, sendVerificationCode } from '@/actions/auth';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary)',
                color: '#000',
                fontWeight: 'bold',
                cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.7 : 1
            }}
        >
            {pending ? '注册中...' : '注册'}
        </button>
    );
}

export default function RegisterPage() {
    const [state, formAction] = useActionState(register, null);
    const [email, setEmail] = useState('');
    const [countdown, setCountdown] = useState(0);

    const handleSendCode = async () => {
        if (!email) {
            alert('请先输入邮箱');
            return;
        }
        const res = await sendVerificationCode(email, 'register');
        if (res.success) {
            alert(res.message);
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '12px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>加入社区</h1>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>用户名</label>
                        <input
                            name="username"
                            type="text"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: '#fff'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>邮箱</label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: '#fff'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>验证码</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                name="verificationCode"
                                type="text"
                                required
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: '#fff'
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={countdown > 0}
                                style={{
                                    padding: '0 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--primary)',
                                    background: 'none',
                                    color: 'var(--primary)',
                                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                                    opacity: countdown > 0 ? 0.5 : 1,
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {countdown > 0 ? `${countdown}s` : '获取验证码'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>密码</label>
                        <input
                            name="password"
                            type="password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: '#fff'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>邀请码</label>
                        <input
                            name="inviteCode"
                            type="text"
                            required
                            placeholder="请输入邀请码"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: '#fff'
                            }}
                        />
                    </div>

                    {state?.message && (
                        <div style={{ color: '#f87171', fontSize: '0.9rem', textAlign: 'center' }}>
                            {state.message}
                        </div>
                    )}

                    <SubmitButton />

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link href="/login" style={{ color: '#888', fontSize: '0.9rem' }}>
                            已有账号？去登录
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
