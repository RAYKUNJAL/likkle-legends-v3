'use client';

import Navbar from '@/components/Navbar';

export default function TermsPage() {
    return (
        <div style={{ background: 'var(--background)', color: 'white', minHeight: '100vh', paddingTop: '100px' }}>
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: '48px', marginBottom: '24px' }} className="gradient-text">Terms of Service</h1>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                    By using Likkle Legends v3.1.0, you agree to our terms of service.
                    All content is property of Island Flavors Universe.
                </p>
                {/* Add more legal copy here as needed */}
            </div>
        </div>
    );
}
