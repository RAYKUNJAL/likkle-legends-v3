import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Book, Clock, CheckCircle, MoreVertical } from 'lucide-react';
import styles from './Books.module.css';

async function getBookProjects() {
    const { data } = await supabase
        .from('book_projects')
        .select('*, owner:users(first_name)')
        .order('created_at', { ascending: false });
    return data || [];
}

export default async function BookProjects() {
    const projects = await getBookProjects();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="animate-fade-in">Book Projects</h1>
                    <p className={styles.subtitle}>Collaborative AI-assisted story building for Caribbean heritage</p>
                </div>
                <button className={styles.createBtn}>
                    <Plus size={20} />
                    <span>New Book Project</span>
                </button>
            </header>

            <div className={styles.statsRow}>
                <div className="glass-card">
                    <p>Total Projects</p>
                    <h3>{projects.length}</h3>
                </div>
                <div className="glass-card">
                    <p>In Review</p>
                    <h3>{projects.filter(p => p.status === 'in_review').length}</h3>
                </div>
                <div className="glass-card">
                    <p>Published</p>
                    <h3>{projects.filter(p => p.status === 'published').length}</h3>
                </div>
            </div>

            <div className={styles.projectGrid}>
                {projects.length > 0 ? projects.map((project) => (
                    <div key={project.id} className={`${styles.projectCard} glass-card`}>
                        <div className={styles.cardTop}>
                            <div className={styles.badge} data-status={project.status}>
                                {project.status === 'published' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                {project.status.replace('_', ' ')}
                            </div>
                            <button className={styles.moreBtn}><MoreVertical size={18} /></button>
                        </div>

                        <div className={styles.cardContent}>
                            <h3 className={styles.projectTitle}>{project.title}</h3>
                            <p className={styles.projectMeta}>{project.island_code} • {project.age_band}</p>
                        </div>

                        <div className={styles.cardFooter}>
                            <div className={styles.author}>
                                <div className={styles.avatarMini}>{project.owner?.first_name?.[0] || 'A'}</div>
                                <span>{project.owner?.first_name || 'Admin'}</span>
                            </div>
                            <Link href={`/admin/books/${project.id}`} className={styles.editLink}>
                                Details
                            </Link>
                        </div>
                    </div>
                )) : (
                    <div className={styles.emptyState}>
                        <Book size={48} />
                        <p>No active book projects found.</p>
                        <button className={styles.outlineBtn}>Start First Draft</button>
                    </div>
                )}
            </div>
        </div>
    );
}
