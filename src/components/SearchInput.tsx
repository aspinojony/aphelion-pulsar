'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function SearchInput({ placeholder }: { placeholder: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [term, setTerm] = useState(searchParams.get('q') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (term) {
                params.set('q', term);
            } else {
                params.delete('q');
            }
            params.set('page', '1'); // Reset to page 1 on search
            router.push(`?${params.toString()}`);
        });
    };

    return (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={placeholder}
                style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.2)',
                    color: '#fff'
                }}
            />
            <button
                type="submit"
                disabled={isPending}
                style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    background: 'var(--primary)',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                {isPending ? '搜索中...' : '搜索'}
            </button>
        </form>
    );
}
