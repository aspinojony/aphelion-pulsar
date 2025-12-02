'use client';

import { useEffect, useState } from 'react';

export default function RetroTerminal() {
    const [active, setActive] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Toggle with Alt + T
            if (e.altKey && (e.key === 't' || e.key === 'T')) {
                e.preventDefault(); // Prevent browser default behavior if any
                setActive(prev => !prev);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!active) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#0a0a0a',
            color: '#33ff00',
            fontFamily: "'Courier New', monospace",
            zIndex: 9999,
            padding: '2rem',
            overflow: 'hidden',
            textShadow: '0 0 5px #33ff00'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 2px, 3px 100%',
                pointerEvents: 'none'
            }} />

            <h1 style={{ fontSize: '4rem', marginBottom: '2rem' }}>APHELION PULSAR TERMINAL</h1>
            <p>&gt; SYSTEM INITIALIZED...</p>
            <p>&gt; USER DETECTED...</p>
            <p>&gt; MODE: RETRO_active</p>
            <br />
            <p>Press <span style={{ background: '#33ff00', color: '#000', padding: '0 4px' }}>Alt + T</span> to exit...</p>

            <div style={{ marginTop: '4rem', border: '2px solid #33ff00', padding: '2rem', maxWidth: '600px' }}>
                <p>&gt; NAVIGATION MENU:</p>
                <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
                    <li>[1] <a href="/" style={{ color: 'inherit', textDecoration: 'underline' }}>HOME</a></li>
                    <li>[2] <a href="/blog" style={{ color: 'inherit', textDecoration: 'underline' }}>BLOG</a></li>
                    <li>[3] <a href="/galaxy" style={{ color: 'inherit', textDecoration: 'underline' }}>GALAXY MAP</a></li>
                    <li>[4] <a href="/shop" style={{ color: 'inherit', textDecoration: 'underline' }}>XP STORE</a></li>
                </ul>
            </div>
        </div>
    );
}
