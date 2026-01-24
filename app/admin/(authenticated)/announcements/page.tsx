'use client';

import { useEffect, useState, useCallback } from 'react';

interface Announcement {
    _id: string;
    title: string;
    content: string;
    priority: string;
    category: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', priority: 'normal', category: 'general', targetRoles: ['employee'] });

    const fetchAnnouncements = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/announcements?limit=100');
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data.announcements || []);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editId ? `/api/admin/announcements/${editId}` : '/api/admin/announcements';
            const res = await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                fetchAnnouncements();
                resetForm();
            }
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
            fetchAnnouncements();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (a: Announcement) => {
        setEditId(a._id);
        setForm({ title: a.title, content: a.content, priority: a.priority, category: a.category, targetRoles: ['employee'] });
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditId(null);
        setForm({ title: '', content: '', priority: 'normal', category: 'general', targetRoles: ['employee'] });
    };

    const getPriorityColor = (p: string) => {
        if (p === 'urgent') return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' };
        if (p === 'high') return { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' };
        return { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' };
    };

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ color: '#05033e', fontSize: 24, fontWeight: 700 }}>Announcements</h1>
                <button onClick={() => setShowForm(true)} style={{
                    padding: '12px 24px', background: '#05033e',
                    border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}>+ New</button>
            </div>

            {loading ? <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Loading...</p> : !announcements.length ? (
                <div style={{ background: '#f9fafb', borderRadius: 12, padding: 40, textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <p style={{ color: '#6b7280' }}>No announcements yet. Create your first one!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {announcements.map(a => {
                        const pStyle = getPriorityColor(a.priority);
                        return (
                            <div key={a._id} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <span style={{ color: '#111827', fontWeight: 600, fontSize: 16 }}>{a.title}</span>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                                            background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}`
                                        }}>{a.priority}</span>
                                        {!a.isActive && <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, background: '#f3f4f6', color: '#6b7280' }}>Inactive</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleEdit(a)} style={{ padding: '6px 14px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDelete(a._id)} style={{ padding: '6px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, color: '#dc2626', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Delete</button>
                                    </div>
                                </div>
                                <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.6 }}>{a.content.slice(0, 200)}{a.content.length > 200 ? '...' : ''}</p>
                                <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 12 }}>
                                    <span style={{ textTransform: 'capitalize' }}>{a.category}</span> • {new Date(a.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
                    <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ color: '#111827', fontSize: 18, fontWeight: 600 }}>{editId ? 'Edit' : 'New'} Announcement</h2>
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', fontSize: 24, color: '#6b7280', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', color: '#374151', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Title</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                                    style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', color: '#374151', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Content</label>
                                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required rows={4}
                                    style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, resize: 'vertical', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                <div>
                                    <label style={{ display: 'block', color: '#374151', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Priority</label>
                                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                                        style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none' }}>
                                        <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#374151', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                        style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none' }}>
                                        <option value="general">General</option><option value="hr">HR</option><option value="event">Event</option><option value="policy">Policy</option><option value="achievement">Achievement</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" disabled={saving} style={{ flex: 1, padding: 14, background: '#05033e', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                                <button type="button" onClick={resetForm} style={{ padding: '14px 24px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
