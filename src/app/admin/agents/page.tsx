'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Send, Zap, Users, TrendingUp, BarChart3, MessageSquare, Lock } from 'lucide-react';

interface Agent {
    id: string;
    name: string;
    role: string;
    emoji: string;
    color: string;
    description: string;
    systemPrompt: string;
    tools: string[];
}

interface Message {
    role: 'user' | 'agent' | 'system';
    content: string;
    agentId?: string;
    timestamp?: number;
}

interface AgentMemory {
    agentId: string;
    context: string;
    lastUpdated: number;
}

const AGENTS: Agent[] = [
    {
        id: 'zara',
        name: 'Zara Sunshine',
        role: 'CEO & Strategy',
        emoji: '☀️',
        color: '#FFD93D',
        description: 'Business strategy, growth planning, financial targets',
        systemPrompt: 'You are Zara Sunshine, CEO of Likkle Legends. You oversee overall business strategy, growth planning, and goal setting. You coordinate all agents toward the $1M revenue goal by end of 2026. Always reference specific metrics and timelines.',
        tools: ['strategic-planning', 'goal-setting', 'team-coordination']
    },
    {
        id: 'reef',
        name: 'Reef Kingsford',
        role: 'Tech & Security',
        emoji: '🏝️',
        color: '#6BCB77',
        description: 'Infrastructure, security, performance optimization',
        systemPrompt: 'You are Reef Kingsford, Head of Technology. You manage infrastructure, security audits, and performance optimization. You know the codebase deeply and identify technical bottlenecks.',
        tools: ['code-audit', 'security-check', 'performance-monitoring']
    },
    {
        id: 'kai',
        name: 'Kai Tradewind',
        role: 'Paid Ads & Growth',
        emoji: '💨',
        color: '#4D96FF',
        description: 'Facebook/Meta ads, budget optimization, CAC targeting',
        systemPrompt: 'You are Kai Tradewind, Growth Marketing Lead. You manage paid advertising campaigns, optimize budgets, and track CAC/LTV metrics. Target: $1M revenue by December 2026.',
        tools: ['ad-strategy', 'budget-optimization', 'audience-targeting']
    },
    {
        id: 'nova',
        name: 'Nova Hibiscus',
        role: 'Content & Creative',
        emoji: '🌺',
        color: '#FF6B9D',
        description: 'Story generation, creative direction, content calendar',
        systemPrompt: 'You are Nova Hibiscus, Creative Director. You generate compelling content, creative assets, and develop the content calendar. You brief other agents on creative needs.',
        tools: ['content-generation', 'creative-briefs', 'story-writing']
    },
    {
        id: 'irie',
        name: 'Irie Goldsworth',
        role: 'Email & Communication',
        emoji: '✉️',
        color: '#FFB347',
        description: 'Email campaigns, user communication, newsletters',
        systemPrompt: 'You are Irie Goldsworth, Communications Director. You craft email campaigns, manage user communications, and coordinate messaging across channels.',
        tools: ['email-campaigns', 'messaging-strategy', 'newsletter-management']
    },
    {
        id: 'bayo',
        name: 'Bayo Wavelength',
        role: 'Customer Success',
        emoji: '🌊',
        color: '#87CEEB',
        description: 'Customer support, onboarding, retention strategies',
        systemPrompt: 'You are Bayo Wavelength, Customer Success Lead. You handle customer support, onboarding, and develop retention strategies. Your goal is to maximize LTV.',
        tools: ['customer-support', 'onboarding', 'retention-strategy']
    },
    {
        id: 'soca',
        name: 'Soca Brightwater',
        role: 'SEO & Organic Growth',
        emoji: '🔍',
        color: '#98FF98',
        description: 'SEO strategy, organic search, content ranking',
        systemPrompt: 'You are Soca Brightwater, SEO & Organic Growth Specialist. You optimize for search, develop SEO strategies, and track organic traffic growth.',
        tools: ['seo-strategy', 'keyword-research', 'organic-growth']
    },
    {
        id: 'nyla',
        name: 'Nyla Reef',
        role: 'COPPA Compliance',
        emoji: '⚖️',
        color: '#E6CCE6',
        description: 'COPPA compliance, data protection, regulatory oversight',
        systemPrompt: 'You are Nyla Reef, Compliance Officer. You ensure COPPA compliance, manage data protection, and oversee regulatory requirements for a children\'s platform.',
        tools: ['compliance-check', 'privacy-audit', 'data-protection']
    },
    {
        id: 'juno',
        name: 'Juno Cays',
        role: 'Analytics & Insights',
        emoji: '📊',
        color: '#FF7675',
        description: 'Data analysis, user metrics, performance reporting',
        systemPrompt: 'You are Juno Cays, Analytics Lead. You analyze user data, track KPIs, and provide insights to drive business decisions.',
        tools: ['data-analysis', 'kpi-tracking', 'report-generation']
    },
    {
        id: 'cayo',
        name: 'Cayo Driftwood',
        role: 'Finance & Operations',
        emoji: '💰',
        color: '#D4A574',
        description: 'Revenue tracking, budget management, financial planning',
        systemPrompt: 'You are Cayo Driftwood, Finance & Operations Lead. You manage revenue, budgets, and financial planning to achieve $1M by end of 2026.',
        tools: ['financial-planning', 'budget-management', 'revenue-tracking']
    }
];

export default function AIAgentsAdminPage() {
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(AGENTS[0]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [agentMemory, setAgentMemory] = useState<Map<string, AgentMemory>>(new Map());
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [crewSyncMode, setCrewSyncMode] = useState(false);
    const msgEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const newMemory = new Map<string, AgentMemory>();
        AGENTS.forEach(agent => {
            newMemory.set(agent.id, {
                agentId: agent.id,
                context: `Agent: ${agent.name}\nRole: ${agent.role}\nGoal: Contribute to $1M revenue target by Dec 2026`,
                lastUpdated: Date.now()
            });
        });
        setAgentMemory(newMemory);
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || !selectedAgent) return;

        const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const memory = agentMemory.get(selectedAgent.id) || { agentId: selectedAgent.id, context: '', lastUpdated: Date.now() };

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 500,
                    system: `${selectedAgent.systemPrompt}\n\nCONTEXT & MEMORY:\n${memory.context}\n\nOTHER AGENTS:\n${Array.from(agentMemory.values()).map(m => `- ${m.context}`).join('\n')}\n\nTask: ${input}`,
                    messages: [{ role: 'user', content: input }]
                })
            });

            const data = await response.json();
            const agentResponse = data.content?.[0]?.text || 'No response from agent';

            const updatedMemory = { ...memory, context: `${memory.context}\n\nRecent: ${input} → ${agentResponse}`.slice(-500), lastUpdated: Date.now() };
            setAgentMemory(prev => new Map(prev).set(selectedAgent.id, updatedMemory));

            const agentMsg: Message = { role: 'agent', content: agentResponse, agentId: selectedAgent.id, timestamp: Date.now() };
            setMessages(prev => [...prev, agentMsg]);
        } catch (error) {
            console.error('Error:', error);
            const errorMsg: Message = { role: 'agent', content: 'Error connecting to Claude API. Make sure ANTHROPIC_KEY is set in Vercel.', agentId: selectedAgent.id };
            setMessages(prev => [...prev, errorMsg]);
        }

        setIsLoading(false);
    };

    const runCrewSync = async () => {
        setCrewSyncMode(true);
        const syncMsg: Message = { role: 'system', content: '🔁 Crew Sync Started - All agents coordinating...', timestamp: Date.now() };
        setMessages(prev => [...prev, syncMsg]);

        try {
            const kaiAgent = AGENTS.find(a => a.id === 'kai');
            if (kaiAgent) {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'claude-sonnet-4-20250514',
                        max_tokens: 300,
                        system: `${kaiAgent.systemPrompt}\n\nYou are in a crew meeting. Brief the team on current ad strategy and budget allocation for reaching $1M revenue.`,
                        messages: [{ role: 'user', content: 'What is our current ad strategy?' }]
                    })
                });
                const data = await response.json();
                const reply = data.content?.[0]?.text || '';
                setMessages(prev => [...prev, { role: 'agent', content: `💨 Kai: ${reply}`, agentId: 'kai', timestamp: Date.now() }]);
            }

            const novaAgent = AGENTS.find(a => a.id === 'nova');
            if (novaAgent) {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'claude-sonnet-4-20250514',
                        max_tokens: 300,
                        system: `${novaAgent.systemPrompt}\n\nRespond to Kai's ad strategy. What creative assets and messaging do we need?`,
                        messages: [{ role: 'user', content: 'How should we support the ad strategy with creative?' }]
                    })
                });
                const data = await response.json();
                const reply = data.content?.[0]?.text || '';
                setMessages(prev => [...prev, { role: 'agent', content: `🌺 Nova: ${reply}`, agentId: 'nova', timestamp: Date.now() }]);
            }

            const zaraAgent = AGENTS.find(a => a.id === 'zara');
            if (zaraAgent) {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'claude-sonnet-4-20250514',
                        max_tokens: 300,
                        system: `${zaraAgent.systemPrompt}\n\nSummarize the crew's plan and set next steps toward $1M revenue.`,
                        messages: [{ role: 'user', content: 'Summarize our alignment and set priorities.' }]
                    })
                });
                const data = await response.json();
                const reply = data.content?.[0]?.text || '';
                setMessages(prev => [...prev, { role: 'agent', content: `☀️ Zara: ${reply}`, agentId: 'zara', timestamp: Date.now() }]);
            }

            const completeMsg: Message = { role: 'system', content: '✅ Crew Sync Complete - Agents aligned and ready', timestamp: Date.now() };
            setMessages(prev => [...prev, completeMsg]);
        } catch (error) {
            console.error('Crew sync error:', error);
        }

        setCrewSyncMode(false);
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Brain size={28} />
                    <h1 style={{ fontSize: '24px', fontWeight: 700 }}>AI Agent Command Center</h1>
                </div>
                <p style={{ color: '#999', fontSize: '14px' }}>10-agent team managing growth to $1M revenue</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1px', backgroundColor: 'rgba(255,255,255,0.05)', flex: 1, overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#999', marginBottom: '8px' }}>YOUR TEAM</h3>
                    {AGENTS.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => { setSelectedAgent(agent); setMessages([]); }}
                            style={{
                                padding: '12px',
                                border: 'none',
                                borderRadius: '8px',
                                background: selectedAgent?.id === agent.id ? 'rgba(255,51,102,0.2)' : 'transparent',
                                borderLeft: `3px solid ${selectedAgent?.id === agent.id ? agent.color : 'transparent'}`,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{agent.emoji}</div>
                            <div style={{ fontSize: '12px', fontWeight: 600 }}>{agent.name}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>{agent.role}</div>
                        </button>
                    ))}

                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={runCrewSync}
                            disabled={crewSyncMode}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: crewSyncMode ? '#666' : '#FF3366',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: 600,
                                cursor: crewSyncMode ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Zap size={16} /> Crew Sync
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    {selectedAgent && (
                        <>
                            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                    <div style={{ fontSize: '28px' }}>{selectedAgent.emoji}</div>
                                    <div>
                                        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{selectedAgent.name}</h2>
                                        <p style={{ fontSize: '12px', color: '#999' }}>{selectedAgent.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {messages.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>{selectedAgent.emoji}</div>
                                        <p>Brief {selectedAgent.name} on your task</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                                <div style={{
                                                    maxWidth: '75%',
                                                    padding: '12px 16px',
                                                    borderRadius: '12px',
                                                    background: msg.role === 'user' ? '#FF3366' : msg.role === 'system' ? 'rgba(100,200,255,0.2)' : 'rgba(255,255,255,0.1)',
                                                    fontSize: '14px',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF3366', animation: 'pulse 1.5s infinite' }} />
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF3366', animation: 'pulse 1.5s infinite 0.5s' }} />
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF3366', animation: 'pulse 1.5s infinite 1s' }} />
                                            </div>
                                        )}
                                        <div ref={msgEndRef} />
                                    </>
                                )}
                            </div>

                            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px' }}>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                    placeholder={`Brief ${selectedAgent.name}...`}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                        minHeight: '40px',
                                        resize: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                    rows={1}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading}
                                    style={{
                                        padding: '12px 16px',
                                        background: input.trim() && !isLoading ? '#FF3366' : '#666',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}