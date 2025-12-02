'use client';

import { createPostAction } from '@/actions/post';
import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function PostForm() {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState('');
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    const handleManualSubmit = () => {
        const form = formRef.current;
        if (!form) return;

        const formData = new FormData(form);

        // Client-side validation
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;

        if (!title?.trim() || !content?.trim()) {
            setMessage('标题和内容不能为空');
            return;
        }

        startTransition(async () => {
            const res = await createPostAction(null, formData);
            if (res?.message) {
                setMessage(res.message);
                if (res.message === 'Post created successfully!') {
                    setTimeout(() => {
                        router.push('/');
                    }, 1500);
                }
            }
        });
    };

    return (
        <form
            ref={formRef}
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            {message && <p style={{ color: message.includes('success') || message.includes('成功') ? 'green' : 'red' }}>{message}</p>}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>标题</label>
                <input
                    type="text"
                    name="title"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: '#111', color: '#fff' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>分类</label>
                    <select
                        name="category"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: '#111', color: '#fff' }}
                    >
                        <option value="tech">技术</option>
                        <option value="life">生活</option>
                        <option value="dev">开发</option>
                        <option value="daily">日常</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>标签</label>
                    <input
                        type="text"
                        name="tags"
                        placeholder="用逗号分隔"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: '#111', color: '#fff' }}
                    />
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>内容 (Markdown)</label>
                <textarea
                    name="content"
                    required
                    rows={15}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #333', background: '#111', color: '#fff', fontFamily: 'monospace' }}
                />
            </div>

            <button
                type="button"
                onClick={handleManualSubmit}
                disabled={isPending}
                style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    opacity: isPending ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                }}
            >
                {isPending ? '发布中...' : '发布文章'}
            </button>
        </form>
    );
}
