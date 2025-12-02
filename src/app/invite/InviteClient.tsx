'use client';

import { useState } from 'react';

export default function InviteClient({ code, isUsed }: { code: string, isUsed: boolean }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '1rem',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px dashed rgba(255,255,255,0.2)',
            opacity: isUsed ? 0.5 : 1
        }}>
            <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '1px', textDecoration: isUsed ? 'line-through' : 'none' }}>
                {code}
            </span>
            {isUsed ? (
                <span style={{ color: '#f87171', fontSize: '0.9rem' }}>已使用</span>
            ) : (
                <button
                    onClick={handleCopy}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: copied ? '#4ade80' : 'var(--primary)',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {copied ? '已复制' : '复制'}
                </button>
            )}
        </div>
    );
}
