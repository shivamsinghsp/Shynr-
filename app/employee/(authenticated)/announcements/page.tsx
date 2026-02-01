'use client';

import { useEffect, useState } from 'react';

interface Announcement {
    _id: string;
    title: string;
    content: string;
    priority: string;
    category: string;
    createdAt: string;
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Announcement | null>(null);

    useEffect(() => {
        fetch('/api/employee/announcements?limit=50')
            .then(res => res.json())
            .then(data => setAnnouncements(data.announcements || []))
            .finally(() => setLoading(false));
    }, []);

    const getColor = (p: string) => {
        if (p === 'urgent') return '#dc2626';
        if (p === 'high') return '#d97706';
        return '#0891b2';
    };

    const getBgColor = (p: string) => {
        if (p === 'urgent') return '#fef2f2';
        if (p === 'high') return '#fffbeb';
        return '#ecfeff';
    };

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            <h1 style={{ color: '#1e293b', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Announcements</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Stay updated with company announcements</p>

            {loading ? <p style={{ color: '#64748b' }}>Loading...</p> : !announcements.length ? (
                <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: 48,
                    textAlign: 'center'
                }}>
                    <svg style={{ margin: '0 auto 16px', color: '#94a3b8' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <p style={{ color: '#64748b', fontSize: 16 }}>No announcements yet</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {announcements.map(a => (
                        <div key={a._id} onClick={() => setSelected(a)} style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: 12,
                            padding: 20,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ color: '#1e293b', fontWeight: 600, flex: 1, fontSize: 16 }}>{a.title}</span>
                                {['urgent', 'high'].includes(a.priority) && (
                                    <span style={{
                                        background: getBgColor(a.priority),
                                        color: getColor(a.priority),
                                        padding: '4px 10px',
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        textTransform: 'uppercase'
                                    }}>{a.priority}</span>
                                )}
                            </div>
                            <p style={{
                                color: '#64748b',
                                fontSize: 14,
                                lineHeight: 1.6,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical' as const
                            }}>{a.content}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                                <span style={{
                                    color: '#94a3b8',
                                    fontSize: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span style={{ color: '#e2e8f0' }}>•</span>
                                <span style={{
                                    color: '#94a3b8',
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}>{a.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <div onClick={() => setSelected(null)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: 16,
                        width: '100%',
                        maxWidth: 550,
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            padding: 24,
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                        }}>
                            <div>
                                <h2 style={{ color: '#1e293b', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{selected.title}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ color: '#64748b', fontSize: 13 }}>
                                        {new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span style={{ color: '#e2e8f0' }}>•</span>
                                    <span style={{
                                        color: '#64748b',
                                        fontSize: 13,
                                        textTransform: 'capitalize'
                                    }}>{selected.category}</span>
                                    {['urgent', 'high'].includes(selected.priority) && (
                                        <>
                                            <span style={{ color: '#e2e8f0' }}>•</span>
                                            <span style={{
                                                background: getBgColor(selected.priority),
                                                color: getColor(selected.priority),
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                fontSize: 10,
                                                fontWeight: 600,
                                                textTransform: 'uppercase'
                                            }}>{selected.priority}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} style={{
                                background: '#f1f5f9',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                fontSize: 18,
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>×</button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <p style={{ color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 15 }}>{selected.content}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
