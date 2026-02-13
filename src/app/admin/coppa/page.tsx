import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import styles from './Coppa.module.css';
import {
    Shield,
    UserCheck,
    Clock,
    Server,
    ArrowRight,
    Play,
    GraduationCap
} from 'lucide-react';

async function getCoppaMetrics() {
    const { data } = await supabase.from('v_coppa_metrics_today').select('*').single();
    return data || { new_requests: 0, consents_24h: 0, admin_access_24h: 0, age_verifications_24h: 0 };
}

async function getConsentCoverage() {
    const { data } = await supabase.from('v_coppa_consent_coverage').select('*');
    return data || [];
}

async function getPendingRequests() {
    const { data } = await supabase.from('v_coppa_pending_requests').select('*');
    return data || [];
}

async function getVendorHealth() {
    const { data } = await supabase.from('v_coppa_vendor_health').select('*');
    return data || [];
}

export default async function CoppaComplianceCenter() {
    const metrics = await getCoppaMetrics();
    const coverage = await getConsentCoverage();
    const requests = await getPendingRequests();
    const vendors = await getVendorHealth();

    const kpis = [
        { label: 'Pending Requests', value: metrics.new_requests, icon: Clock, color: 'var(--warning)' },
        { label: 'New Consents (24h)', value: metrics.consents_24h, icon: UserCheck, color: 'var(--success)' },
        { label: 'Admin Access Log', value: metrics.admin_access_24h, icon: Shield, color: 'var(--primary)' },
        { label: 'Age Gates (24h)', value: metrics.age_verifications_24h, icon: Shield, color: 'var(--accent)' },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="animate-fade-in">COPPA Compliance Center</h1>
                    <p className={styles.subtitle}>Privacy-first data processing & parental consent oversight</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/coppa/training" className={styles.secondaryActionBtn}>
                        <GraduationCap size={16} />
                        <span>Staff Training</span>
                    </Link>
                    <button className={styles.actionBtn}>
                        <Play size={16} />
                        <span>Run Retention Dry Run</span>
                    </button>
                </div>
            </header>

            <div className={styles.kpiGrid}>
                {kpis.map((item) => (
                    <div key={item.label} className="glass-card">
                        <div className={styles.kpiIcon} style={{ background: `${item.color}20`, color: item.color }}>
                            <item.icon size={24} />
                        </div>
                        <div className={styles.kpiInfo}>
                            <p className={styles.kpiLabel}>{item.label}</p>
                            <h3 className={styles.kpiValue}>{item.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.mainGrid}>
                <section className="glass-card">
                    <div className={styles.cardHeader}>
                        <h3>Consent Coverage</h3>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Age Band</th>
                                <th>Total Children</th>
                                <th>Consented</th>
                                <th>Coverage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coverage.length > 0 ? coverage.map((row: any) => (
                                <tr key={row.age_band}>
                                    <td>{row.age_band}</td>
                                    <td>{row.total_children}</td>
                                    <td>{row.consented_children}</td>
                                    <td>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${(row.consented_children / row.total_children) * 100}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className={styles.empty}>No child data processed yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="glass-card">
                    <div className={styles.cardHeader}>
                        <h3>Vendor Health</h3>
                    </div>
                    <div className={styles.vendorList}>
                        {vendors.map((vendor: any) => (
                            <div key={vendor.vendor_name} className={styles.vendorItem}>
                                <div className={styles.vendorInfo}>
                                    <Server size={18} className={vendor.health_status === 'healthy' ? styles.iconHealthy : styles.iconWarning} />
                                    <span>{vendor.vendor_name}</span>
                                </div>
                                <div className={styles.vendorStatus}>
                                    {vendor.dpa_signed ? (
                                        <span className={styles.badgeSuccess}>DPA Signed</span>
                                    ) : (
                                        <span className={styles.badgePending}>Pending DPA</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="glass-card" style={{ gridColumn: 'span 2' }}>
                    <div className={styles.cardHeader}>
                        <h3>Overdue Parent Requests</h3>
                        <Link href="/admin/coppa/requests" className={styles.viewAll}>
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Due Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length > 0 ? requests.map((req: any) => (
                                <tr key={req.id}>
                                    <td>{req.id.slice(0, 8)}...</td>
                                    <td>{req.request_type}</td>
                                    <td><span className={styles.badgeWarning}>{req.status}</span></td>
                                    <td>{new Date(req.due_at).toLocaleDateString()}</td>
                                    <td><button className={styles.inlineBtn}>Process</button></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className={styles.empty}>No pending parent data requests.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
}
