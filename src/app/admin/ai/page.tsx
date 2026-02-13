import { supabase } from '@/lib/supabase';
import { Sparkles, Languages, MapPin, History, PlayCircle } from 'lucide-react';
import styles from './AiStudio.module.css';
import Link from 'next/link';
import ProcessJobButton from '@/components/ProcessJobButton';


async function getRecentProjects() {
    const { data } = await supabase
        .from('book_projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
    return data || [];
}

async function getActiveJobs() {
    const { data } = await supabase
        .from('jobs')
        .select('*')
        .in('status', ['queued', 'running'])
        .order('created_at', { ascending: false });
    return data || [];
}

export default async function AiStoryStudio() {
    const projects = await getRecentProjects();
    const activeJobs = await getActiveJobs();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="gradient-text animate-fade-in">AI Story Studio</h1>
                    <p className={styles.subtitle}>Generate culturally accurate Caribbean folklore and original adventures.</p>
                </div>
                <Link href="/admin/ai/new" className={styles.createBtn}>
                    <Sparkles size={20} />
                    <span>Craft New Story</span>
                </Link>
            </header>

            <div className={styles.mainGrid}>
                <section className={styles.creationHub}>
                    <div className={`${styles.configCard} glass-card`}>
                        <h3><History size={20} /> Recent Drafts</h3>
                        <div className={styles.projectList}>
                            {projects.length > 0 ? projects.map(p => (
                                <div key={p.id} className={styles.projectItem}>
                                    <div className={styles.projectInfo}>
                                        <h4>{p.title || 'Untitled Story'}</h4>
                                        <span>{p.island_code} • {p.age_band} • {p.status}</span>
                                    </div>
                                    <Link href={`/admin/books/${p.id}`} className={styles.iconBtn}>
                                        <PlayCircle size={18} />
                                    </Link>
                                </div>
                            )) : (
                                <p className={styles.empty}>No recent drafts. Start crafting!</p>
                            )}
                        </div>
                        <Link href="/admin/books" className={styles.viewAll}>View all projects &rarr;</Link>
                    </div>

                    <div className={styles.toolsGrid}>
                        <div className="glass-card">
                            <Languages size={24} className={styles.toolIcon} />
                            <h4>Dialect Dial</h4>
                            <p>Toggle between Standard English and authentic Patois/Dialect versions.</p>
                        </div>
                        <div className="glass-card">
                            <MapPin size={24} className={styles.toolIcon} />
                            <h4>Island Tracks</h4>
                            <p>Inject island-specific folklore elements (Douens, Duppies, etc.).</p>
                        </div>
                    </div>
                </section>

                <aside className={styles.sidebar}>
                    <div className={`${styles.statusCard} glass-card`}>
                        <h3>Live Queue</h3>
                        {activeJobs.length > 0 ? activeJobs.map(job => (
                            <div key={job.id} className={styles.jobItem}>
                                <div className={styles.jobStatus} data-status={job.status}></div>
                                <div className={styles.jobText}>
                                    <p>{job.job_type.replace('_', ' ')}</p>
                                    <span>{job.status}...</span>
                                </div>
                            </div>
                        )) : (
                            <div className={styles.emptyQueue}>
                                <Sparkles size={32} />
                                <p>All engines idle. Ready for input.</p>
                            </div>
                        )}
                        <ProcessJobButton />
                    </div>


                    <div className={`${styles.statsCard} glass-card`}>
                        <div className={styles.stat}>
                            <span>AI Token Usage (24h)</span>
                            <strong>0</strong>
                        </div>
                        <div className={styles.stat}>
                            <span>Stories Generated</span>
                            <strong>{projects.length}</strong>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
