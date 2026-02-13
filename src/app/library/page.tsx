'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import { 
    BookOpen, Palette, Gamepad2, Music, FileText, Download, 
    Star, Heart, Clock, Filter, Search, Sparkles 
} from 'lucide-react';
import styles from './Library.module.css';

const supabase = createClient();

interface ContentItem {
    id: string;
    title: string;
    content_type: string;
    island_code: string;
    slug: string;
    track_tags: {
        subject?: string;
        ageBand?: string;
        keywords?: string[];
    };
}

const typeIcons: Record<string, React.ReactNode> = {
    worksheet: <FileText size={20} />,
    coloring: <Palette size={20} />,
    activity: <Sparkles size={20} />,
    game: <Gamepad2 size={20} />,
    song: <Music size={20} />,
    story: <BookOpen size={20} />,
};

const typeColors: Record<string, string> = {
    worksheet: '#7000FF',
    coloring: '#FF3366',
    activity: '#00FF94',
    game: '#00F5FF',
    song: '#FFB800',
    story: '#FF6B00',
};

export default function LibraryPage() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [filter, setFilter] = useState('all');
    const [ageFilter, setAgeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            let query = supabase
                .from('content_items')
                .select('*')
                .eq('published', true);

            if (filter !== 'all') {
                query = query.eq('content_type', filter);
            }

            const { data } = await query.order('created_at', { ascending: false });
            setContent(data || []);
            setLoading(false);
        }
        fetchContent();
    }, [filter]);

    const toggleFavorite = (id: string) => {
        setFavorites(prev => 
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const filteredContent = content.filter(item => {
        if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (ageFilter !== 'all' && item.track_tags?.ageBand !== ageFilter) {
            return false;
        }
        return true;
    });

    const categories = [
        { id: 'all', label: 'All', icon: <Star size={18} /> },
        { id: 'worksheet', label: 'Worksheets', icon: <FileText size={18} /> },
        { id: 'coloring', label: 'Coloring', icon: <Palette size={18} /> },
        { id: 'activity', label: 'Activities', icon: <Sparkles size={18} /> },
        { id: 'game', label: 'Games', icon: <Gamepad2 size={18} /> },
        { id: 'song', label: 'Songs', icon: <Music size={18} /> },
        { id: 'story', label: 'Stories', icon: <BookOpen size={18} /> },
    ];

    return (
        <div className={styles.page}>
            <Navbar />

            <header className={styles.header}>
                <div className={styles.container}>
                    <h1 className={styles.title}>
                        My <span className="gradient-text">Learning Library</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Discover worksheets, activities, and fun learning materials!
                    </p>
                </div>
            </header>

            <main className={styles.container}>
                <div className={styles.controls}>
                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search for activities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.ageFilter}>
                        <Filter size={16} />
                        <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
                            <option value="all">All Ages</option>
                            <option value="3-4">3-4 Years</option>
                            <option value="5-6">5-6 Years</option>
                            <option value="7-8">7-8 Years</option>
                        </select>
                    </div>
                </div>

                <div className={styles.categories}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`${styles.catBtn} ${filter === cat.id ? styles.active : ''}`}
                            onClick={() => setFilter(cat.id)}
                        >
                            {cat.icon}
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className={styles.loading}>Loading your content...</div>
                ) : filteredContent.length === 0 ? (
                    <div className={styles.empty}>
                        <Sparkles size={48} />
                        <h3>Content Coming Soon!</h3>
                        <p>We&apos;re creating amazing activities just for you!</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredContent.map((item) => (
                            <div 
                                key={item.id} 
                                className={`${styles.card} glass-card`}
                                style={{ '--accent': typeColors[item.content_type] || '#7000FF' } as React.CSSProperties}
                            >
                                <button 
                                    className={`${styles.favBtn} ${favorites.includes(item.id) ? styles.favorited : ''}`}
                                    onClick={() => toggleFavorite(item.id)}
                                >
                                    <Heart size={18} />
                                </button>

                                <div className={styles.cardIcon}>
                                    {typeIcons[item.content_type] || <Star size={24} />}
                                </div>

                                <h3>{item.title}</h3>

                                <div className={styles.tags}>
                                    <span className={styles.typeTag}>{item.content_type}</span>
                                    {item.track_tags?.ageBand && (
                                        <span className={styles.ageTag}>
                                            <Clock size={12} /> {item.track_tags.ageBand}
                                        </span>
                                    )}
                                </div>

                                <div className={styles.cardActions}>
                                    <button className={styles.viewBtn}>View</button>
                                    <button className={styles.downloadBtn}>
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sample Content for Demo */}
                {content.length === 0 && !loading && (
                    <div className={styles.sampleSection}>
                        <h3>Sample Content Preview</h3>
                        <div className={styles.grid}>
                            {[
                                { title: 'Caribbean Alphabet Fun', type: 'worksheet', age: '3-4' },
                                { title: 'Color the Carnival', type: 'coloring', age: '3-5' },
                                { title: 'Island Counting Game', type: 'game', age: '4-6' },
                                { title: 'Steel Pan Rhythms', type: 'song', age: '5-8' },
                                { title: 'Anansi the Spider', type: 'story', age: '4-7' },
                                { title: 'Make a Paper Parrot', type: 'activity', age: '5-8' },
                            ].map((sample, idx) => (
                                <div 
                                    key={idx} 
                                    className={`${styles.card} glass-card ${styles.sampleCard}`}
                                    style={{ '--accent': typeColors[sample.type] || '#7000FF' } as React.CSSProperties}
                                >
                                    <div className={styles.cardIcon}>
                                        {typeIcons[sample.type] || <Star size={24} />}
                                    </div>
                                    <h3>{sample.title}</h3>
                                    <div className={styles.tags}>
                                        <span className={styles.typeTag}>{sample.type}</span>
                                        <span className={styles.ageTag}>
                                            <Clock size={12} /> {sample.age}
                                        </span>
                                    </div>
                                    <span className={styles.comingSoon}>Coming Soon</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <footer className={styles.footer}>
                <p>© 2026 Likkle Legends. Learning made fun for Caribbean kids!</p>
            </footer>
        </div>
    );
}
