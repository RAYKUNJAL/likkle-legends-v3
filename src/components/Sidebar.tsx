import Link from 'next/link';
import {
    LayoutDashboard,
    Sparkles,
    BookOpen,
    Library,
    Users,
    GraduationCap,
    TrendingUp,
    Share2,
    Trophy,
    MessageSquare,
    CreditCard,
    ShieldCheck,
    Activity,
    Brain,
    Palette
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
    { label: 'Command Center', icon: LayoutDashboard, route: '/admin' },
    { label: 'AI Content Studio', icon: Brain, route: '/admin/content-studio' },
    { label: 'AI Story Studio', icon: Sparkles, route: '/admin/ai' },
    { label: 'Activities Manager', icon: Palette, route: '/admin/activities' },
    { label: 'Book Projects', icon: BookOpen, route: '/admin/books' },
    { label: 'Content Library', icon: Library, route: '/admin/content' },
    { label: 'Users & Families', icon: Users, route: '/admin/users' },
    { label: 'Teacher Portal', icon: GraduationCap, route: '/admin/teachers' },
    { label: 'Leads & Growth', icon: TrendingUp, route: '/admin/growth' },
    { label: 'Affiliate', icon: Share2, route: '/admin/affiliate' },
    { label: 'Viral Contests', icon: Trophy, route: '/admin/contests' },
    { label: 'Messaging Hub', icon: MessageSquare, route: '/admin/messaging' },
    { label: 'Billing', icon: CreditCard, route: '/admin/billing' },
    { label: 'COPPA Compliance', icon: ShieldCheck, route: '/admin/coppa' },
    { label: 'Jobs & Logs', icon: Activity, route: '/admin/logs' },
];

export default function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <span className="gradient-text">Likkle Legends</span>
                <span className={styles.version}>v3.1.0</span>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Link key={item.route} href={item.route} className={styles.navLink}>
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className={styles.footer}>
                <div className={styles.userProfile}>
                    <div className={styles.avatar}>LL</div>
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>Admin Legend</p>
                        <p className={styles.userRole}>Compliance Officer</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
