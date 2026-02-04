'use client';

import { useEffect, useState, useCallback } from 'react';

interface LeaveRequest {
    _id: string;
    employee: { _id: string; firstName: string; lastName: string; email: string };
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    totalDays: number;
    createdAt: string;
}

export default function AdminLeavePage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [reviewNote, setReviewNote] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const fetchLeaves = useCallback(async () => {
        try {
            const statusParam = filter !== 'all' ? `&status=${filter}` : '';
            const res = await fetch(`/api/admin/leave?limit=100${statusParam}`);
            if (res.ok) {
                const data = await res.json();
                setLeaves(data.leaves || []);
                setSummary(data.summary || { pending: 0, approved: 0, rejected: 0 });
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/leave/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, reviewNote }),
            });
            if (res.ok) {
                fetchLeaves();
                setSelectedId(null);
                setReviewNote('');
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const getTypeLabel = (t: string) => ({ annual: 'Annual', sick: 'Sick', personal: 'Personal', unpaid: 'Unpaid', other: 'Other' }[t] || t);
    const getStatusColor = (s: string) => s === 'approved' ? '#16a34a' : s === 'rejected' ? '#dc2626' : '#d97706';
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });

    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ color: '#05033e', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Leave Management</h1>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#fef3c7', borderRadius: 12, padding: 20, border: '1px solid #fcd34d' }}>
                    <p style={{ color: '#d97706', fontSize: 28, fontWeight: 700 }}>{summary.pending}</p>
                    <p style={{ color: '#92400e', fontSize: 13 }}>Pending</p>
                </div>
                <div style={{ background: '#dcfce7', borderRadius: 12, padding: 20, border: '1px solid #86efac' }}>
                    <p style={{ color: '#16a34a', fontSize: 28, fontWeight: 700 }}>{summary.approved}</p>
                    <p style={{ color: '#166534', fontSize: 13 }}>Approved</p>
                </div>
                <div style={{ background: '#fee2e2', borderRadius: 12, padding: 20, border: '1px solid #fca5a5' }}>
                    <p style={{ color: '#dc2626', fontSize: 28, fontWeight: 700 }}>{summary.rejected}</p>
                    <p style={{ color: '#991b1b', fontSize: 13 }}>Rejected</p>
                </div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                        background: filter === f ? '#05033e' : '#f3f4f6',
                        border: filter === f ? 'none' : '1px solid #e5e7eb',
                        color: filter === f ? 'white' : '#374151', fontSize: 14, fontWeight: 500
                    }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                {loading ? <p style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>Loading...</p> : !leaves.length ? (
                    <p style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>No leave requests found</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                {['Employee', 'Type', 'Dates', 'Days', 'Reason', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#374151', fontSize: 13, fontWeight: 600 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map(l => (
                                <tr key={l._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ color: '#111827', fontWeight: 500 }}>{l.employee.firstName} {l.employee.lastName}</div>
                                        <div style={{ color: '#6b7280', fontSize: 12 }}>{l.employee.email}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#374151' }}>{getTypeLabel(l.leaveType)}</td>
                                    <td style={{ padding: '14px 16px', color: '#374151' }}>{formatDate(l.startDate)} - {formatDate(l.endDate)}</td>
                                    <td style={{ padding: '14px 16px', color: '#374151', fontWeight: 600 }}>{l.totalDays}</td>
                                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                                            background: l.status === 'approved' ? '#dcfce7' : l.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                            color: getStatusColor(l.status)
                                        }}>{l.status}</span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        {l.status === 'pending' ? (
                                            selectedId === l._id ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
                                                    <input placeholder="Note (optional)" value={reviewNote} onChange={e => setReviewNote(e.target.value)}
                                                        style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button onClick={() => handleAction(l._id, 'approved')} disabled={!!actionLoading}
                                                            style={{ padding: '6px 12px', background: '#16a34a', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
                                                        <button onClick={() => handleAction(l._id, 'rejected')} disabled={!!actionLoading}
                                                            style={{ padding: '6px 12px', background: '#dc2626', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Reject</button>
                                                        <button onClick={() => { setSelectedId(null); setReviewNote(''); }}
                                                            style={{ padding: '6px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, color: '#374151', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setSelectedId(l._id)}
                                                    style={{ padding: '8px 16px', background: '#05033e', border: 'none', borderRadius: 6, color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Review</button>
                                            )
                                        ) : (
                                            <span style={{ color: '#9ca3af', fontSize: 13 }}>Reviewed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
