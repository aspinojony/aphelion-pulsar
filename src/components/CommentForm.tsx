'use client';

import { useActionState } from 'react';
import { addComment } from '@/actions/comments';
import { useRef } from 'react';

export default function CommentForm({ slug }: { slug: string }) {
    const [state, action, isPending] = useActionState(addComment, null);
    const formRef = useRef<HTMLFormElement>(null);

    // Reset form on success
    if (state?.message === 'success' && formRef.current) {
        formRef.current.reset();
    }

    return (
        <form ref={formRef} action={action} style={{ marginTop: '2rem' }}>
            <input type="hidden" name="slug" value={slug} />
            <div style={{ marginBottom: '1rem' }}>
                <textarea
                    name="content"
                    required
                    placeholder="写下你的评论..."
                    style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(0,0,0,0.2)',
                        color: '#fff',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                    }}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    type="submit"
                    disabled={isPending}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '8px',
                        background: '#fff',
                        color: '#000',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: isPending ? 'not-allowed' : 'pointer',
                        opacity: isPending ? 0.7 : 1
                    }}
                >
                    {isPending ? '提交中...' : '发表评论'}
                </button>
            </div>
        </form>
    );
}
