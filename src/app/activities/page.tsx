'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import { Palette, Music, Gamepad2, BookOpen, Star, Lock } from 'lucide-react';
import styles from './Activities.module.css';

const supabase = createClient();

interface Activity {
    id: string;
    title: string;
    content_type: string;
    island_code: string;
    slug: string;
    published: boolean;
}

const activityIcons: Record<string, React.ReactNode> = {
    activity: <Palette size={24} />,
    game: <Gamepad2 size={24} />,
    song: <Music size={24} />,
    story: <BookOpen size={24} />,
};

const islandColors: Record<string, string> = {
    TT: '#FF3366',
    JM: '#00FF94',
    HT: '#7000FF',
    LC: '#00F5FF',
    GY: '#FFB800',
};

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            const query = supabase
                .from('content_items')
                .select('id, title, content_type, island_code, slug, published')
                .eq('published', true)
                .in('content_type', ['activity', 'game', 'song']);

            if (filter !== 'all') {
                query.eq('content_type', filter);
            }

            const { data } = await query.order('created_at', { ascending: false });
            setActivities(data || []);
            setLoading(false);
        }

        fetchActivities();
    }, [filter]);

    const categories = [
        { id: 'all', label: 'All Activities', icon: <Star size={18} /> },
        { id: 'activity', label: 'Arts & Crafts', icon: <Palette size={18} /> },
        { id: 'game', label: 'Games', icon: <Gamepad2 size={18} /> },
        { id: 'song', label: 'Songs', icon: <Music size={18} /> },
    ];

    return (
        <div className={styles.page}>
            <Navbar />

            <header className={styles.header}>
                <div className={styles.container}>
                    <h1 className={styles.title}>
                        Island <span className="gradient-text">Activities</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Fun games, crafts, and songs celebrating Caribbean culture
                    </p>
                </div>
            </header>

            <main className={styles.container}>
                <div className={styles.filters}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`${styles.filterBtn} ${filter === cat.id ? styles.active : ''}`}
                            onClick={() => setFilter(cat.id)}
                        >
                            {cat.icon}
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className={styles.loading}>Loading activities...</div>
                ) : activities.length === 0 ? (
                    <div className={styles.empty}>
                        <Palette size={48} />
                        <h3>Activities Coming Soon!</h3>
                        <p>We&apos;re preparing exciting activities for you. Check back soon!</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className={`${styles.card} glass-card`}
                                style={{ '--accent': islandColors[activity.island_code] || '#7000FF' } as React.CSSProperties}
                            >
                                <div className={styles.cardIcon}>
                                    {activityIcons[activity.content_type] || <Star size={24} />}
                                </div>
                                <h3>{activity.title}</h3>
                                <span className={styles.tag}>{activity.content_type}</span>
                                <button className={styles.playBtn}>
                                    Start Activity
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <section className={styles.comingSoon}>
                    <h2>Coming Soon</h2>
                    <div className={styles.previewGrid}>
                        {[
                            { title: 'Color the Caribbean Map', type: 'activity', locked: true },
                            { title: 'Island Matching Game', type: 'game', locked: true },
                            { title: 'Calypso Sing-Along', type: 'song', locked: true },
                            { title: 'Make a Steel Pan', type: 'activity', locked: true },
                        ].map((item, idx) => (
                            <div key={idx} className={`${styles.previewCard} glass-card`}>
                                <Lock size={20} className={styles.lockIcon} />
                                <span className={styles.previewTitle}>{item.title}</span>
                                <span className={styles.previewType}>{item.type}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <p>© 2026 Likkle Legends. Handcrafted for the diaspora.</p>
            </footer>
        </div>
    );
}
