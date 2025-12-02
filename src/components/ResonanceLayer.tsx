'use client';

import { useEffect, useState, useRef } from 'react';
import { createResonance, fetchResonances } from '@/actions/resonance';

interface ResonancePoint {
    id: string;
    x: number;
    y: number;
    content: string;
}

export default function ResonanceLayer({ postId }: { postId: string }) {
    const [points, setPoints] = useState<ResonancePoint[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchResonances(postId).then(setPoints);
    }, [postId]);

    const handleDoubleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Optimistic update
        const tempId = Date.now().toString() + Math.random().toString(36).slice(2);
        const newPoint = { id: tempId, x, y, content: '✨' };
        setPoints(prev => [...prev, newPoint]);

        await createResonance(postId, '✨', x, y);
    };

    return (
        <div
            ref={containerRef}
            onDoubleClick={handleDoubleClick}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Let clicks pass through to text selection
                zIndex: 10
            }}
        >
            {/* Overlay to capture double clicks but allow text selection */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'auto',
                background: 'transparent'
            }} onDoubleClick={handleDoubleClick} />

            {points.map(p => (
                <div
                    key={p.id}
                    className="resonance-point"
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: '1.5rem',
                        pointerEvents: 'none',
                        animation: 'pulse 2s infinite'
                    }}
                >
                    {p.content}
                </div>
            ))}
            <style jsx>{`
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; text-shadow: 0 0 10px var(--primary); }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
