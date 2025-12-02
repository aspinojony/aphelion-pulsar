'use client';

import { useState } from 'react';

export default function LotteryPage() {
    const [result, setResult] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const handleSpin = () => {
        setIsSpinning(true);
        setResult(null);

        // Simulate network request/spinning
        setTimeout(() => {
            const prizes = [
                '🎉 恭喜获得 10 积分！',
                '🌟 运气爆棚，获得 50 积分！',
                '😢 很遗憾，本次未中奖，再接再厉！',
                '🎁 获得神秘小礼品一份！',
                '✨ 获得 "幸运之星" 徽章！'
            ];
            const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
            setResult(randomPrize);
            setIsSpinning(false);
        }, 2000);
    };

    return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>
                <span className="text-gradient">幸运抽奖</span>
            </h1>
            <p style={{ marginBottom: '3rem', color: '#888', fontSize: '1.2rem' }}>每天一次，试试你的手气！</p>

            <div className="glass" style={{ padding: '3rem', borderRadius: '20px', maxWidth: '500px', width: '100%' }}>
                <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>
                    {isSpinning ? '🎰' : '🎁'}
                </div>

                {result && (
                    <div style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold', color: result.includes('😢') ? '#888' : 'var(--primary)', animation: 'fadeIn 0.5s ease' }}>
                        {result}
                    </div>
                )}

                <button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    style={{
                        padding: '1rem 3rem',
                        fontSize: '1.5rem',
                        borderRadius: '50px',
                        border: 'none',
                        background: isSpinning ? '#333' : 'var(--primary)',
                        color: isSpinning ? '#888' : '#000',
                        cursor: isSpinning ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        transform: isSpinning ? 'scale(0.95)' : 'scale(1)',
                        boxShadow: isSpinning ? 'none' : '0 0 20px rgba(74, 222, 128, 0.5)'
                    }}
                >
                    {isSpinning ? '抽奖中...' : '开始抽奖'}
                </button>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
