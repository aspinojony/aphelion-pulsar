'use client';

import { useState } from 'react';
import { purchaseItemAction } from '@/actions/shop';

export default function ShopItemCard({ item, userXp }: { item: any, userXp: number }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handlePurchase = async () => {
        if (userXp < item.price) {
            setMessage('XP 不足');
            return;
        }

        if (!confirm(`确定花费 ${item.price} XP 购买 "${item.name}" 吗？`)) return;

        setLoading(true);
        const res = await purchaseItemAction(item.id);
        setLoading(false);
        setMessage(res.message);
    };

    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>{item.icon}</div>
            <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.name}</h3>
                <p style={{ color: '#888', fontSize: '0.9rem', height: '40px' }}>{item.description}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{item.price} XP</span>
                <button
                    onClick={handlePurchase}
                    disabled={loading || userXp < item.price}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: userXp >= item.price ? 'var(--primary)' : '#333',
                        color: userXp >= item.price ? '#000' : '#666',
                        cursor: userXp >= item.price ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? '购买中...' : '购买'}
                </button>
            </div>
            {message && <p style={{ fontSize: '0.8rem', color: message.includes('成功') ? '#4ade80' : '#f87171', textAlign: 'center' }}>{message}</p>}
        </div>
    );
}
