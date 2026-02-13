// Training page
import { GraduationCap, ShieldCheck, CheckCircle, FileText, Play } from 'lucide-react';
import styles from './Training.module.css';

const modules = [
    { id: 1, title: 'Introduction to COPPA', duration: '5 min', status: 'completed' },
    { id: 2, title: 'Defining Child PII', duration: '8 min', status: 'ready' },
    { id: 3, title: 'Workflow: Verifying Parental Consent', duration: '12 min', status: 'locked' },
    { id: 4, title: 'Data Retention & Deletion Laws', duration: '10 min', status: 'locked' },
    { id: 5, title: 'Emergency Incident Procedures', duration: '15 min', status: 'locked' },
];

export default function CoppaTraining() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="animate-fade-in">Compliance Training Portal</h1>
                    <p className={styles.subtitle}>Mandatory certification for all administrators and compliance officers.</p>
                </div>
                <div className={styles.badge}>
                    <ShieldCheck size={18} />
                    <span>Status: Training Required</span>
                </div>
            </header>

            <div className={styles.mainGrid}>
                <section className={styles.modules}>
                    <h3><GraduationCap size={20} /> Training Curriculum</h3>
                    <div className={styles.moduleList}>
                        {modules.map(module => (
                            <div key={module.id} className={`${styles.moduleItem} glass-card`} data-status={module.status}>
                                <div className={styles.moduleIcon}>
                                    {module.status === 'completed' ? <CheckCircle size={20} /> : <Play size={20} />}
                                </div>
                                <div className={styles.moduleContent}>
                                    <h4>{module.title}</h4>
                                    <span>{module.duration} • {module.status}</span>
                                </div>
                                {module.status === 'ready' && (
                                    <button className={styles.startBtn}>Start Module</button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <aside className={styles.sidebar}>
                    <div className={`${styles.certCard} glass-card`}>
                        <FileText size={48} />
                        <h4>Your Certificate</h4>
                        <p>Complete all modules to generate your annual COPPA compliance certificate.</p>
                        <button className={styles.disabledBtn} disabled>Download PDF</button>
                    </div>

                    <div className={`${styles.infoCard} glass-card`}>
                        <h4>Next Steps</h4>
                        <ul>
                            <li>Finish all 5 modules</li>
                            <li>Pass the 10-question quiz</li>
                            <li>Sign the Legal DPA</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
