'use client';

import { useState } from 'react';
import { 
    Sparkles, BookOpen, Palette, Gamepad2, Music, FileText, 
    Scissors, Brain, Download, Save, RefreshCw, CheckCircle,
    GraduationCap, Globe, Clock, Target
} from 'lucide-react';
import styles from './ContentStudio.module.css';

type ContentCategory = 'worksheet' | 'coloring' | 'activity' | 'craft' | 'game' | 'song' | 'story' | 'flashcard';
type AgeBand = '3-4' | '5-6' | '7-8';
type Subject = 'literacy' | 'numeracy' | 'science' | 'social_studies' | 'art' | 'music' | 'caribbean_culture' | 'language_arts';

interface GeneratedContent {
    title: string;
    description: string;
    instructions: string;
    content: string;
    teacherNotes?: string;
    learningObjectives: string[];
    materials?: string[];
    duration?: string;
    difficulty: string;
    caribbeanContext: string;
    keywords: string[];
}

const contentTypes = [
    { id: 'worksheet', label: 'Worksheet', icon: <FileText size={20} />, desc: 'Printable learning sheets' },
    { id: 'coloring', label: 'Coloring Page', icon: <Palette size={20} />, desc: 'Caribbean-themed coloring' },
    { id: 'activity', label: 'Activity', icon: <Brain size={20} />, desc: 'Interactive learning' },
    { id: 'craft', label: 'Arts & Craft', icon: <Scissors size={20} />, desc: 'Hands-on projects' },
    { id: 'game', label: 'Game', icon: <Gamepad2 size={20} />, desc: 'Fun learning games' },
    { id: 'song', label: 'Song', icon: <Music size={20} />, desc: 'Educational songs' },
    { id: 'story', label: 'Story', icon: <BookOpen size={20} />, desc: 'Caribbean stories' },
    { id: 'flashcard', label: 'Flashcards', icon: <Target size={20} />, desc: 'Quick learning cards' },
];

const subjects = [
    { id: 'literacy', label: 'Literacy & Reading' },
    { id: 'numeracy', label: 'Numeracy & Math' },
    { id: 'science', label: 'Science & Nature' },
    { id: 'social_studies', label: 'Social Studies' },
    { id: 'art', label: 'Art & Creativity' },
    { id: 'music', label: 'Music & Movement' },
    { id: 'caribbean_culture', label: 'Caribbean Culture' },
    { id: 'language_arts', label: 'Language Arts' },
];

const islands = [
    { code: 'ALL', name: 'Pan-Caribbean' },
    { code: 'TT', name: 'Trinidad & Tobago' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'HT', name: 'Haiti' },
    { code: 'LC', name: 'St. Lucia' },
    { code: 'GY', name: 'Guyana' },
    { code: 'BB', name: 'Barbados' },
    { code: 'GD', name: 'Grenada' },
];

export default function ContentStudioPage() {
    const [category, setCategory] = useState<ContentCategory>('worksheet');
    const [ageBand, setAgeBand] = useState<AgeBand>('5-6');
    const [subject, setSubject] = useState<Subject>('literacy');
    const [island, setIsland] = useState('ALL');
    const [topic, setTopic] = useState('');
    const [dialect, setDialect] = useState<'standard' | 'local'>('standard');
    const [includeTeacherNotes, setIncludeTeacherNotes] = useState(true);
    
    const [generating, setGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [saved, setSaved] = useState(false);

    async function handleGenerate() {
        setGenerating(true);
        setSaved(false);
        setGeneratedContent(null);

        try {
            const response = await fetch('/api/content/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    ageBand,
                    subject,
                    island,
                    topic: topic || undefined,
                    dialectMode: dialect,
                    includeTeacherNotes
                })
            });

            const data = await response.json();
            if (data.success) {
                setGeneratedContent(data.content);
            } else {
                alert('Generation failed: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to generate content');
        } finally {
            setGenerating(false);
        }
    }

    async function handleSave() {
        setSaved(true);
        // Content is auto-saved by the API, this is just UI feedback
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.agentBadge}>
                        <Sparkles size={20} />
                        <span>AI Content Agent</span>
                    </div>
                    <h1>Content Studio</h1>
                    <p className={styles.subtitle}>
                        Generate educational content for Caribbean children ages 3-8
                    </p>
                </div>
            </header>

            <div className={styles.mainGrid}>
                {/* Left Panel - Configuration */}
                <div className={styles.configPanel}>
                    <section className="glass-card">
                        <h3 className={styles.sectionTitle}>
                            <Target size={18} /> Content Type
                        </h3>
                        <div className={styles.typeGrid}>
                            {contentTypes.map((type) => (
                                <button
                                    key={type.id}
                                    className={`${styles.typeBtn} ${category === type.id ? styles.active : ''}`}
                                    onClick={() => setCategory(type.id as ContentCategory)}
                                >
                                    {type.icon}
                                    <span>{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="glass-card">
                        <h3 className={styles.sectionTitle}>
                            <GraduationCap size={18} /> Age & Subject
                        </h3>
                        
                        <div className={styles.field}>
                            <label>Age Band</label>
                            <div className={styles.ageButtons}>
                                {['3-4', '5-6', '7-8'].map((age) => (
                                    <button
                                        key={age}
                                        className={`${styles.ageBtn} ${ageBand === age ? styles.active : ''}`}
                                        onClick={() => setAgeBand(age as AgeBand)}
                                    >
                                        {age} years
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label>Subject Area</label>
                            <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)}>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label>Specific Topic (Optional)</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Counting tropical fruits"
                            />
                        </div>
                    </section>

                    <section className="glass-card">
                        <h3 className={styles.sectionTitle}>
                            <Globe size={18} /> Caribbean Context
                        </h3>
                        
                        <div className={styles.field}>
                            <label>Island Focus</label>
                            <select value={island} onChange={(e) => setIsland(e.target.value)}>
                                {islands.map((i) => (
                                    <option key={i.code} value={i.code}>{i.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label>Language Style</label>
                            <div className={styles.dialectToggle}>
                                <button
                                    className={dialect === 'standard' ? styles.active : ''}
                                    onClick={() => setDialect('standard')}
                                >
                                    Standard English
                                </button>
                                <button
                                    className={dialect === 'local' ? styles.active : ''}
                                    onClick={() => setDialect('local')}
                                >
                                    Local Dialect
                                </button>
                            </div>
                        </div>

                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={includeTeacherNotes}
                                onChange={(e) => setIncludeTeacherNotes(e.target.checked)}
                            />
                            <span>Include Teacher Notes</span>
                        </label>
                    </section>

                    <button
                        className={styles.generateBtn}
                        onClick={handleGenerate}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <RefreshCw size={20} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Content
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel - Preview */}
                <div className={styles.previewPanel}>
                    {!generatedContent ? (
                        <div className={styles.emptyPreview}>
                            <Sparkles size={48} />
                            <h3>Ready to Create</h3>
                            <p>Configure your content settings and click Generate to create educational materials for Caribbean children.</p>
                        </div>
                    ) : (
                        <div className={styles.contentPreview}>
                            <div className={styles.previewHeader}>
                                <div>
                                    <h2>{generatedContent.title}</h2>
                                    <p className={styles.previewDesc}>{generatedContent.description}</p>
                                </div>
                                <div className={styles.previewActions}>
                                    <button className={styles.actionBtn} onClick={handleSave}>
                                        {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                                        {saved ? 'Saved' : 'Save'}
                                    </button>
                                    <button className={styles.actionBtn}>
                                        <Download size={18} />
                                        Export
                                    </button>
                                </div>
                            </div>

                            <div className={styles.previewMeta}>
                                <span className={styles.metaBadge}>
                                    <Clock size={14} /> {generatedContent.duration || '15-20 mins'}
                                </span>
                                <span className={styles.metaBadge}>
                                    <Target size={14} /> {generatedContent.difficulty}
                                </span>
                                <span className={styles.metaBadge}>
                                    <Globe size={14} /> {island}
                                </span>
                            </div>

                            <div className={styles.previewSection}>
                                <h4>Learning Objectives</h4>
                                <ul>
                                    {generatedContent.learningObjectives.map((obj, i) => (
                                        <li key={i}>{obj}</li>
                                    ))}
                                </ul>
                            </div>

                            {generatedContent.materials && generatedContent.materials.length > 0 && (
                                <div className={styles.previewSection}>
                                    <h4>Materials Needed</h4>
                                    <div className={styles.materialsList}>
                                        {generatedContent.materials.map((mat, i) => (
                                            <span key={i} className={styles.materialTag}>{mat}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.previewSection}>
                                <h4>Instructions</h4>
                                <div className={styles.instructionsBox}>
                                    {generatedContent.instructions}
                                </div>
                            </div>

                            <div className={styles.previewSection}>
                                <h4>Content</h4>
                                <div className={styles.contentBox}>
                                    <pre>{generatedContent.content}</pre>
                                </div>
                            </div>

                            <div className={styles.previewSection}>
                                <h4>Caribbean Context</h4>
                                <p className={styles.contextBox}>{generatedContent.caribbeanContext}</p>
                            </div>

                            {generatedContent.teacherNotes && (
                                <div className={styles.previewSection}>
                                    <h4>
                                        <GraduationCap size={16} /> Teacher Notes
                                    </h4>
                                    <div className={styles.teacherNotes}>
                                        {generatedContent.teacherNotes}
                                    </div>
                                </div>
                            )}

                            <div className={styles.keywordsSection}>
                                {generatedContent.keywords.map((kw, i) => (
                                    <span key={i} className={styles.keyword}>#{kw}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
