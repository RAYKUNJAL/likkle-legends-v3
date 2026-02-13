import { supabase } from '@/lib/supabase';
import { Mail, MessageSquare, Send, Inbox, Archive, Filter } from 'lucide-react';
import styles from './Messaging.module.css';

async function getMessages() {
    const { data } = await supabase
        .from('messages')
        .select('*, user:users(first_name, email)')
        .order('created_at', { ascending: false })
        .limit(20);
    return data || [];
}

export default async function MessagingHub() {
    const messages = await getMessages();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="animate-fade-in">Messaging Hub</h1>
                    <p className={styles.subtitle}>Unified communication across Email, WhatsApp, and Messenger</p>
                </div>
                <div className={styles.actions}>
                    <button className={styles.secondaryBtn}><Filter size={18} /> Filter</button>
                    <button className={styles.primaryBtn}><Send size={18} /> New Campaign</button>
                </div>
            </header>

            <div className={styles.statsRow}>
                <div className="glass-card">
                    <p>Delivered (24h)</p>
                    <h3>0</h3>
                </div>
                <div className="glass-card">
                    <p>Open Rate</p>
                    <h3>0%</h3>
                </div>
                <div className="glass-card">
                    <p>Cost (Est.)</p>
                    <h3>$0.00</h3>
                </div>
            </div>

            <div className={styles.mainGrid}>
                <aside className={`${styles.inboxSidebar} glass-card`}>
                    <div className={styles.sidebarSection}>
                        <h4>Channels</h4>
                        <div className={styles.sidebarItem} data-active="true">
                            <Inbox size={18} /> <span>All Messages</span>
                        </div>
                        <div className={styles.sidebarItem}>
                            <Mail size={18} /> <span>Email</span>
                        </div>
                        <div className={styles.sidebarItem}>
                            <MessageSquare size={18} /> <span>WhatsApp</span>
                        </div>
                    </div>
                    <div className={styles.sidebarSection}>
                        <h4>Status</h4>
                        <div className={styles.sidebarItem}>
                            <div className={styles.dotQueued}></div> <span>Queued</span>
                        </div>
                        <div className={styles.sidebarItem}>
                            <div className={styles.dotSent}></div> <span>Sent</span>
                        </div>
                        <div className={styles.sidebarItem}>
                            <Archive size={18} /> <span>Archived</span>
                        </div>
                    </div>
                </aside>

                <section className={`${styles.messageList} glass-card`}>
                    <div className={styles.listHeader}>
                        <h3>Live Feed</h3>
                    </div>
                    <div className={styles.feed}>
                        {messages.length > 0 ? messages.map((msg: any) => (
                            <div key={msg.id} className={styles.feedItem}>
                                <div className={styles.msgIcon}>
                                    {msg.channel === 'email' ? <Mail size={16} /> : <MessageSquare size={16} />}
                                </div>
                                <div className={styles.msgContent}>
                                    <div className={styles.msgMeta}>
                                        <span className={styles.msgUser}>{msg.user?.first_name || 'System'}</span>
                                        <span className={styles.msgTime}>{new Date(msg.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <p className={styles.msgBody}>{msg.subject || msg.body}</p>
                                </div>
                                <div className={styles.msgStatus} data-status={msg.status}>
                                    {msg.status}
                                </div>
                            </div>
                        )) : (
                            <div className={styles.emptyFeed}>
                                <p>No messages in the current queue.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
