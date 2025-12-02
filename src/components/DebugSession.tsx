'use client';
import { checkSession } from '@/actions/debug';
import { useState } from 'react';

export default function DebugSession() {
    const [status, setStatus] = useState('');
    return (
        <button
            id="debug-session-btn"
            onClick={async () => {
                const res = await checkSession();
                setStatus(res);
            }}
            style={{ padding: '10px', background: 'red', color: 'white', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        >
            Check Session: {status}
        </button>
    );
}
