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
        if (p === 'urgent') return '#ef4444';
        if (p === 'high') return '#f59e0b';
        return '#06b6d4';
    };

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Announcements</h1>

            {loading ? <p style={{ color: '#888' }}>Loading...</p> : !announcements.length ? (
                <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>No announcements</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {announcements.map(a => (
                        <div key={a._id} onClick={() => setSelected(a)} style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            padding: 16,
                            cursor: 'pointer'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ color: 'white', fontWeight: 600, flex: 1 }}>{a.title}</span>
                                {['urgent', 'high'].includes(a.priority) && (
                                    <span style={{
                                        background: `${getColor(a.priority)}20`,
                                        color: getColor(a.priority),
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        fontSize: 10,
                                        textTransform: 'uppercase'
                                    }}>{a.priority}</span>
                                )}
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{a.content}</p>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 8 }}>{new Date(a.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <div onClick={() => setSelected(null)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: '#0d2847', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '80vh', overflow: 'auto'
                    }}>
                        <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                            <h2 style={{ color: 'white', fontSize: 18 }}>{selected.title}</h2>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 20 }}>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 16 }}>{new Date(selected.createdAt).toLocaleDateString()} • {selected.category}</p>
                            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{selected.content}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
