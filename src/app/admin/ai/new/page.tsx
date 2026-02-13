'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Sparkles, ArrowLeft, Send, Map, BookOpen } from 'lucide-react';
import styles from './NewProject.module.css';
import Link from 'next/link';

export default function NewStoryProject() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        age_band: '3-5',
        island_code: 'TT',
        dialect_mode: 'standard_english',
        goal: '',
        prompt: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create the project
            const { data: project, error: pError } = await supabase
                .from('book_projects')
                .insert({
                    title: formData.title,
                    age_band: formData.age_band,
                    island_code: formData.island_code,
                    dialect_mode: formData.dialect_mode,
                    goal: formData.goal,
                    status: 'draft'
                })
                .select()
                .single();

            if (pError) throw pError;

            // 2. Queue the AI Job (Outline Generation)
            const { error: jError } = await supabase
                .from('jobs')
                .insert({
                    job_type: 'ai_outline',
                    payload: {
                        project_id: project.id,
                        prompt: formData.prompt
                    }
                });

            if (jError) throw jError;

            router.push('/admin/ai');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error'; alert('Error starting project: ' + message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/admin/ai" className={styles.backBtn}><ArrowLeft size={20} /></Link>
                <h1 className="animate-fade-in">New Story Project</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                <div className={styles.mainFields}>
                    <div className="glass-card">
                        <div className={styles.sectionHeader}>
                            <BookOpen size={20} /> <span>Story Basics</span>
                        </div>
                        <div className={styles.field}>
                            <label>Story Title</label>
                            <input
                                type="text"
                                placeholder="e.g. The Brave Little Anansi"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label>Age Band</label>
                                <select
                                    value={formData.age_band}
                                    onChange={(e) => setFormData({ ...formData, age_band: e.target.value })}
                                >
                                    <option value="0-2">0-2 years</option>
                                    <option value="3-5">3-5 years</option>
                                    <option value="6-9">6-9 years</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Island Context</label>
                                <select
                                    value={formData.island_code}
                                    onChange={(e) => setFormData({ ...formData, island_code: e.target.value })}
                                >
                                    <option value="TT">Trinidad & Tobago</option>
                                    <option value="JM">Jamaica</option>
                                    <option value="HT">Haiti</option>
                                    <option value="LC">St. Lucia</option>
                                    <option value="GY">Guyana</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <div className={styles.sectionHeader}>
                            <Sparkles size={20} /> <span>The Hook (AI Prompt)</span>
                        </div>
                        <div className={styles.field}>
                            <label>What happens in this story?</label>
                            <textarea
                                placeholder="A magical hummingbird helps a lost child find their way home through the Northern Range..."
                                value={formData.prompt}
                                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                rows={5}
                                required
                            />
                            <p className={styles.hint}>Be specific about characters, island landmarks, and the lesson learned.</p>
                        </div>
                    </div>
                </div>

                <aside className={styles.optionsCards}>
                    <div className="glass-card">
                        <div className={styles.sectionHeader}>
                            <Map size={20} /> <span>Dialect</span>
                        </div>
                        <div className={styles.optionList}>
                            <label className={styles.option}>
                                <input
                                    type="radio"
                                    name="dialect"
                                    checked={formData.dialect_mode === 'standard_english'}
                                />
                                <span>Standard English</span>
                            </label>
                            <label className={styles.option}>
                                <input
                                    type="radio"
                                    name="dialect"
                                    checked={formData.dialect_mode === 'local_dialect'}
                                />
                                <span>Local Dialect (Authentic)</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Initializing...' : (
                            <>
                                <Send size={20} />
                                <span>Begin Generation</span>
                            </>
                        )}
                    </button>
                </aside>
            </form>
        </div>
    );
}
