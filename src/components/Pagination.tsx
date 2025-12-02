'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function Pagination({ total, limit }: { total: number; limit: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const totalPages = Math.ceil(total / limit);

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: 'none',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1
                }}
            >
                上一页
            </button>
            <span style={{ display: 'flex', alignItems: 'center', color: '#888' }}>
                {currentPage} / {totalPages}
            </span>
            <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: 'none',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1
                }}
            >
                下一页
            </button>
        </div>
    );
}
