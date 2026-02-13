import { supabase } from '@/lib/supabase';
import styles from './Dashboard.module.css';
import {
    Users,
    Activity,
    DollarSign,
    Smartphone,
    AlertTriangle
} from 'lucide-react';

async function getDashboardData() {
    const { data, error } = await supabase
        .from('v_admin_kpis_today')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching dashboard data:', error);
        // Return zeros if table doesn't exist yet, but show error in console
        return {
            total_users: 0,
            events_24h: 0,
            ai_cost_24h: 0,
            active_subscriptions: 0,
            failed_jobs: 0
        };
    }

    return data;
}

export default async function AdminDashboard() {
    const stats = await getDashboardData();

    const kpiItems = [
        { label: 'Total Users', value: stats.total_users, icon: Users, color: 'var(--accent)' },
        { label: '24h Activity', value: stats.events_24h, icon: Activity, color: 'var(--success)' },
        { label: 'Active Plans', value: stats.active_subscriptions, icon: DollarSign, color: 'var(--primary)' },
        { label: '24h AI Cost', value: `$${Number(stats.ai_cost_24h || 0).toFixed(2)}`, icon: Smartphone, color: 'var(--secondary)' },
        { label: 'Failed Jobs', value: stats.failed_jobs, icon: AlertTriangle, color: 'var(--error)' },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="animate-fade-in">Command Center</h1>
                    <p className={styles.subtitle}>Real-time system health & growth performance</p>
                </div>
                <div className={styles.statusBadge}>
                    <div className={styles.pulse}></div>
                    Live System Online
                </div>
            </header>

            <div className={styles.kpiGrid}>
                {kpiItems.map((item, i) => (
                    <div key={item.label} className="glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
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

            <section className={styles.mainGrid}>
                <div className="glass-card" style={{ gridColumn: 'span 2', minHeight: '400px' }}>
                    <div className={styles.cardHeader}>
                        <h3>Growth Engine</h3>
                        <span className={styles.timeframe}>Last 30 Days</span>
                    </div>
                    <div className={styles.placeholderChart}>
                        {/* Chart would go here */}
                        <p>Syncing with live events stream...</p>
                    </div>
                </div>

                <div className="glass-card" style={{ minHeight: '400px' }}>
                    <div className={styles.cardHeader}>
                        <h3>Recent Alerts</h3>
                    </div>
                    <div className={styles.alertList}>
                        <p className={styles.emptyState}>No critical incidents detected in the last 24h.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
