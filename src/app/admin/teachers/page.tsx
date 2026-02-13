'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    GraduationCap, Users, BookOpen, Download, Plus, Search,
    CheckCircle, Clock, Star, Filter, BarChart3, FileText
} from 'lucide-react';
import styles from './Teachers.module.css';

const supabase = createClient();

interface Teacher {
    id: string;
    user_id: string;
    school_name: string;
    teacher_count: number;
    student_count: number;
    verified: boolean;
    created_at: string;
    user?: { first_name: string; email: string };
}

interface ContentItem {
    id: string;
    title: string;
    content_type: string;
    island_code: string;
    published: boolean;
}

export default function TeacherPortalPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [content, setContent] = useState<ContentItem[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'resources' | 'curriculum'>('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [teachersRes, contentRes] = await Promise.all([
                supabase.from('educator_accounts').select('*, user:users(first_name, email)'),
                supabase.from('content_items').select('*').eq('published', true).limit(20)
            ]);
            setTeachers(teachersRes.data || []);
            setContent(contentRes.data || []);
            setLoading(false);
        }
        fetchData();
    }, []);

    const verifiedTeachers = teachers.filter(t => t.verified).length;
    const totalStudents = teachers.reduce((sum, t) => sum + (t.student_count || 0), 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1><GraduationCap size={28} /> Teacher Portal</h1>
                    <p className={styles.subtitle}>Manage educators, curriculum resources, and student progress</p>
                </div>
                <button className={styles.primaryBtn}>
                    <Plus size={18} /> Invite Teacher
                </button>
            </header>

            <div className={styles.tabs}>
                {[
                    { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
                    { id: 'teachers', label: 'Teachers', icon: <Users size={18} /> },
                    { id: 'resources', label: 'Resources', icon: <BookOpen size={18} /> },
                    { id: 'curriculum', label: 'Curriculum', icon: <FileText size={18} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className={styles.overviewGrid}>
                    <div className={`glass-card ${styles.statCard}`}>
                        <div className={styles.statIcon}><GraduationCap size={24} /></div>
                        <div>
                            <p className={styles.statLabel}>Total Teachers</p>
                            <h3>{teachers.length}</h3>
                        </div>
                    </div>
                    <div className={`glass-card ${styles.statCard}`}>
                        <div className={styles.statIcon} style={{ background: 'rgba(0, 255, 148, 0.1)', color: '#00FF94' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className={styles.statLabel}>Verified</p>
                            <h3>{verifiedTeachers}</h3>
                        </div>
                    </div>
                    <div className={`glass-card ${styles.statCard}`}>
                        <div className={styles.statIcon} style={{ background: 'rgba(0, 245, 255, 0.1)', color: '#00F5FF' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <p className={styles.statLabel}>Total Students</p>
                            <h3>{totalStudents}</h3>
                        </div>
                    </div>
                    <div className={`glass-card ${styles.statCard}`}>
                        <div className={styles.statIcon} style={{ background: 'rgba(255, 184, 0, 0.1)', color: '#FFB800' }}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className={styles.statLabel}>Resources</p>
                            <h3>{content.length}</h3>
                        </div>
                    </div>

                    <div className={`glass-card ${styles.recentSection}`}>
                        <h3>Recent Teacher Signups</h3>
                        {teachers.slice(0, 5).map((teacher) => (
                            <div key={teacher.id} className={styles.teacherRow}>
                                <div className={styles.teacherInfo}>
                                    <span className={styles.teacherName}>{teacher.user?.first_name || 'Teacher'}</span>
                                    <span className={styles.schoolName}>{teacher.school_name}</span>
                                </div>
                                <span className={teacher.verified ? styles.verified : styles.pending}>
                                    {teacher.verified ? 'Verified' : 'Pending'}
                                </span>
                            </div>
                        ))}
                        {teachers.length === 0 && <p className={styles.empty}>No teachers yet</p>}
                    </div>

                    <div className={`glass-card ${styles.curriculumPreview}`}>
                        <h3>Caribbean Curriculum Areas</h3>
                        <div className={styles.curriculumGrid}>
                            {[
                                { name: 'Literacy', color: '#FF3366', count: 24 },
                                { name: 'Numeracy', color: '#7000FF', count: 18 },
                                { name: 'Science', color: '#00FF94', count: 12 },
                                { name: 'Culture', color: '#00F5FF', count: 30 },
                                { name: 'Arts', color: '#FFB800', count: 15 },
                                { name: 'Music', color: '#FF6B00', count: 20 },
                            ].map((area) => (
                                <div key={area.name} className={styles.curriculumItem}>
                                    <div className={styles.curriculumBar} style={{ background: area.color, width: `${area.count * 2}%` }} />
                                    <span>{area.name}</span>
                                    <span className={styles.curriculumCount}>{area.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'teachers' && (
                <div className={styles.teachersSection}>
                    <div className={styles.searchBar}>
                        <Search size={18} />
                        <input type="text" placeholder="Search teachers..." />
                        <button><Filter size={18} /> Filter</button>
                    </div>

                    <div className={`glass-card ${styles.tableCard}`}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Teacher</th>
                                    <th>School</th>
                                    <th>Students</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className={styles.loading}>Loading...</td></tr>
                                ) : teachers.length === 0 ? (
                                    <tr><td colSpan={5} className={styles.empty}>No teachers registered yet</td></tr>
                                ) : teachers.map((teacher) => (
                                    <tr key={teacher.id}>
                                        <td>
                                            <div className={styles.teacherCell}>
                                                <div className={styles.avatar}>{teacher.user?.first_name?.[0] || 'T'}</div>
                                                <div>
                                                    <p>{teacher.user?.first_name || 'Teacher'}</p>
                                                    <small>{teacher.user?.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{teacher.school_name || 'Not specified'}</td>
                                        <td>{teacher.student_count || 0}</td>
                                        <td>
                                            <span className={teacher.verified ? styles.verified : styles.pending}>
                                                {teacher.verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={styles.actionBtn}>View</button>
                                            {!teacher.verified && (
                                                <button className={styles.verifyBtn}>Verify</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'resources' && (
                <div className={styles.resourcesSection}>
                    <div className={styles.resourcesHeader}>
                        <h3>Downloadable Resources for Teachers</h3>
                        <p>Curated Caribbean-focused educational materials</p>
                    </div>

                    <div className={styles.resourceGrid}>
                        {[
                            { title: 'Caribbean Alphabet Posters', type: 'PDF Pack', downloads: 234, age: '3-5' },
                            { title: 'Island Counting Worksheets', type: 'Worksheet Bundle', downloads: 189, age: '4-6' },
                            { title: 'Carnival Coloring Book', type: 'Coloring Pages', downloads: 412, age: '3-8' },
                            { title: 'Caribbean Animals Flashcards', type: 'Flashcard Set', downloads: 156, age: '3-6' },
                            { title: 'Folk Song Lyrics & Activities', type: 'Activity Pack', downloads: 98, age: '5-8' },
                            { title: 'Island Nations Map Activities', type: 'Geography Pack', downloads: 203, age: '6-8' },
                        ].map((resource, idx) => (
                            <div key={idx} className={`glass-card ${styles.resourceCard}`}>
                                <div className={styles.resourceIcon}><FileText size={24} /></div>
                                <h4>{resource.title}</h4>
                                <p className={styles.resourceType}>{resource.type}</p>
                                <div className={styles.resourceMeta}>
                                    <span><Download size={14} /> {resource.downloads}</span>
                                    <span><Clock size={14} /> Ages {resource.age}</span>
                                </div>
                                <button className={styles.downloadBtn}>
                                    <Download size={16} /> Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'curriculum' && (
                <div className={styles.curriculumSection}>
                    <div className={styles.curriculumHeader}>
                        <h3>Caribbean Early Childhood Curriculum</h3>
                        <p>Aligned with regional standards for ages 3-8</p>
                    </div>

                    <div className={styles.ageGroups}>
                        {['3-4 Years', '5-6 Years', '7-8 Years'].map((age) => (
                            <div key={age} className={`glass-card ${styles.ageCard}`}>
                                <h4>{age}</h4>
                                <div className={styles.subjectList}>
                                    {['Literacy', 'Numeracy', 'Science', 'Social Studies', 'Art', 'Music', 'Caribbean Culture'].map((subject) => (
                                        <div key={subject} className={styles.subjectRow}>
                                            <span>{subject}</span>
                                            <div className={styles.progressBar}>
                                                <div className={styles.progressFill} style={{ width: `${Math.random() * 60 + 20}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
