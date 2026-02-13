'use client';

import Navbar from '@/components/Navbar';

export default function PolicyPage() {
    return (
        <div style={{ background: 'var(--background)', color: 'white', minHeight: '100vh', paddingTop: '100px' }}>
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: '48px', marginBottom: '24px' }} className="gradient-text">Privacy Policy</h1>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                    Welcome to Likkle Legends. This policy is currently being updated for v3.1.0 and COPPA compliance.
                    Your privacy and the safety of your children are our top priorities.
                </p>
                {/* Add more legal copy here as needed */}
            </div>
        </div>
    );
}
