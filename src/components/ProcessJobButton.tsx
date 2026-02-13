'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

export default function ProcessJobButton() {
    const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');

    const handleProcess = async () => {
        setStatus('processing');
        try {
            const res = await fetch('/api/jobs/process', { method: 'POST' });
            const data = await res.json();
            console.log('Process result:', data);
            setStatus('done');
            setTimeout(() => setStatus('idle'), 2000);
            window.location.reload(); // Refresh to see changes
        } catch (err) {
            console.error(err);
            setStatus('idle');
        }
    };

    return (
        <button
            onClick={handleProcess}
            disabled={status === 'processing'}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: status === 'processing' ? 'var(--secondary)' : 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                opacity: status === 'processing' ? 0.7 : 1,
                fontSize: '14px',
                fontWeight: 600,
                marginTop: '10px',
                width: '100%'
            }}
        >
            <Play size={16} />
            {status === 'processing' ? 'Processing...' : status === 'done' ? 'Success!' : 'Manually Process Next Job'}
        </button>
    );
}
