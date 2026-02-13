'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, Palette, Music, Gamepad2, Trash2, Edit, Eye, Globe } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import styles from './AdminActivities.module.css';

const supabase = createClient();

interface Activity {
    id: string;
    title: string;
    content_type: string;
    island_code: string;
    slug: string;
    published: boolean;
    created_at: string;
}

const activityTypes = [
    { id: 'activity', label: 'Arts & Crafts', icon: <Palette size={18} /> },
    { id: 'game', label: 'Game', icon: <Gamepad2 size={18} /> },
    { id: 'song', label: 'Song', icon: <Music size={18} /> },
];

const islands = [
    { code: 'TT', name: 'Trinidad & Tobago' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'HT', name: 'Haiti' },
    { code: 'LC', name: 'St. Lucia' },
    { code: 'GY', name: 'Guyana' },
];

export default function AdminActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        content_type: 'activity',
        island_code: 'TT',
        slug: '',
    });
    const [assetUrl, setAssetUrl] = useState('');

    const fetchActivities = useCallback(async () => {
        const { data } = await supabase
            .from('content_items')
            .select('*')
            .in('content_type', ['activity', 'game', 'song'])
            .order('created_at', { ascending: false });
        setActivities(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => {
            fetchActivities();
        });
    }, [fetchActivities]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-');

        const { error } = await supabase.from('content_items').insert({
            ...formData,
            slug,
            published: false,
        });

        if (!error) {
            setShowCreate(false);
            setFormData({ title: '', content_type: 'activity', island_code: 'TT', slug: '' });
            setAssetUrl('');
            fetchActivities();
        }
    }

    async function togglePublish(id: string, currentStatus: boolean) {
        await supabase.from('content_items').update({ published: !currentStatus }).eq('id', id);
        fetchActivities();
    }

    async function deleteActivity(id: string) {
        if (confirm('Delete this activity?')) {
            await supabase.from('content_items').delete().eq('id', id);
            fetchActivities();
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Activities Manager</h1>
                    <p className={styles.subtitle}>Create and manage activities for the kids portal</p>
                </div>
                <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
                    <Plus size={18} /> New Activity
                </button>
            </header>

            {showCreate && (
                <div className={styles.modal}>
                    <div className={`${styles.modalContent} glass-card`}>
                        <h2>Create New Activity</h2>
                        <form onSubmit={handleCreate}>
                            <div className={styles.field}>
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Color the Caribbean Map"
                                    required
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Type</label>
                                    <select
                                        value={formData.content_type}
                                        onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                                    >
                                        {activityTypes.map((t) => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label>Island</label>
                                    <select
                                        value={formData.island_code}
                                        onChange={(e) => setFormData({ ...formData, island_code: e.target.value })}
                                    >
                                        {islands.map((i) => (
                                            <option key={i.code} value={i.code}>{i.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <FileUpload
                                bucket="activities"
                                path={`${formData.content_type}/${formData.island_code}`}
                                accept="image/*,application/pdf"
                                label="Activity Asset (Image or PDF)"
                                onUploadComplete={(url) => setAssetUrl(url)}
                                onError={(err) => console.error(err)}
                            />

                            <div className={styles.actions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowCreate(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    Create Activity
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.stats}>
                <div className="glass-card">
                    <p>Total Activities</p>
                    <h3>{activities.length}</h3>
                </div>
                <div className="glass-card">
                    <p>Published</p>
                    <h3>{activities.filter(a => a.published).length}</h3>
                </div>
                <div className="glass-card">
                    <p>Drafts</p>
                    <h3>{activities.filter(a => !a.published).length}</h3>
                </div>
            </div>

            <section className={`${styles.tableSection} glass-card`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Island</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className={styles.loading}>Loading...</td></tr>
                        ) : activities.length === 0 ? (
                            <tr><td colSpan={5} className={styles.empty}>No activities yet. Create your first one!</td></tr>
                        ) : activities.map((activity) => (
                            <tr key={activity.id}>
                                <td>{activity.title}</td>
                                <td>
                                    <span className={styles.typeBadge}>
                                        {activityTypes.find(t => t.id === activity.content_type)?.icon}
                                        {activity.content_type}
                                    </span>
                                </td>
                                <td>{activity.island_code}</td>
                                <td>
                                    <span className={activity.published ? styles.published : styles.draft}>
                                        {activity.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actionBtns}>
                                        <button
                                            title={activity.published ? 'Unpublish' : 'Publish'}
                                            onClick={() => togglePublish(activity.id, activity.published)}
                                        >
                                            <Globe size={16} />
                                        </button>
                                        <button title="Preview">
                                            <Eye size={16} />
                                        </button>
                                        <button title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            title="Delete"
                                            className={styles.deleteBtn}
                                            onClick={() => deleteActivity(activity.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
