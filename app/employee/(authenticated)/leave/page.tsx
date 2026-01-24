'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';

interface LeaveRequest {
    _id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    totalDays: number;
    reviewNote?: string;
    createdAt: string;
}

interface Summary {
    pending: number;
    approved: number;
    rejected: number;
    totalApprovedDays: number;
}

export default function EmployeeLeavePage() {
    const { data: session } = useSession();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [summary, setSummary] = useState<Summary>({ pending: 0, approved: 0, rejected: 0, totalApprovedDays: 0 });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const fetchLeaves = useCallback(async () => {
        try {
            const statusParam = filter !== 'all' ? `&status=${filter}` : '';
            const res = await fetch(`/api/employee/leave?limit=50${statusParam}`);
            if (res.ok) {
                const data = await res.json();
                setLeaves(data.leaves || []);
                setSummary(data.summary || { pending: 0, approved: 0, rejected: 0, totalApprovedDays: 0 });
            }
        } catch (err) {
            console.error('Error fetching leaves:', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/employee/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to submit leave request');
                setSubmitting(false);
                return;
            }

            setSuccess('Leave request submitted successfully!');
            setShowForm(false);
            setFormData({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
            fetchLeaves();
        } catch (err) {
            setError('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return '#22c55e';
            case 'rejected': return '#ef4444';
            case 'pending': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getLeaveTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            annual: 'Annual Leave',
            sick: 'Sick Leave',
            personal: 'Personal Leave',
            unpaid: 'Unpaid Leave',
            other: 'Other',
        };
        return labels[type] || type;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="leave-page">
            <style jsx>{`
                .leave-page {
                    padding: 24px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                
                .page-title {
                    color: white;
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                
                .page-subtitle {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 14px;
                }
                
                .new-request-btn {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }
                
                .new-request-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .stat-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                }
                
                .stat-value {
                    color: white;
                    font-size: 28px;
                    font-weight: 700;
                }
                
                .stat-label {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    margin-top: 4px;
                }
                
                .filter-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }
                
                .filter-tab {
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .filter-tab:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
                
                .filter-tab.active {
                    background: rgba(6, 182, 212, 0.2);
                    border-color: rgba(6, 182, 212, 0.3);
                    color: #06b6d4;
                }
                
                .card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    overflow: hidden;
                }
                
                .leave-list {
                    display: flex;
                    flex-direction: column;
                }
                
                .leave-item {
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 16px;
                    align-items: start;
                    transition: background 0.2s ease;
                }
                
                .leave-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                
                .leave-item:last-child {
                    border-bottom: none;
                }
                
                .leave-main {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .leave-type {
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                }
                
                .leave-dates {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .leave-days {
                    background: rgba(6, 182, 212, 0.15);
                    color: #06b6d4;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                }
                
                .leave-reason {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 13px;
                    line-height: 1.4;
                }
                
                .leave-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                }
                
                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: capitalize;
                }
                
                .leave-date-applied {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 11px;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 48px;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                /* Form Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 200;
                    padding: 20px;
                }
                
                .modal {
                    background: #0d2847;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                }
                
                .close-btn {
                    width: 32px;
                    height: 32px;
                    background: rgba(255, 255, 255, 0.08);
                    border: none;
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-body {
                    padding: 24px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-label {
                    display: block;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 8px;
                }
                
                .form-input,
                .form-select,
                .form-textarea {
                    width: 100%;
                    padding: 12px 14px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s ease;
                }
                
                .form-input:focus,
                .form-select:focus,
                .form-textarea:focus {
                    border-color: #06b6d4;
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .form-select option {
                    background: #0d2847;
                }
                
                .form-textarea {
                    min-height: 100px;
                    resize: vertical;
                }
                
                .date-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .alert {
                    padding: 12px 16px;
                    border-radius: 10px;
                    margin-bottom: 16px;
                    font-size: 14px;
                }
                
                .alert.error {
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #fca5a5;
                }
                
                .alert.success {
                    background: rgba(34, 197, 94, 0.15);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #86efac;
                }
                
                .submit-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);
                }
                
                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                @media (max-width: 768px) {
                    .leave-page {
                        padding: 16px;
                    }
                    
                    .page-header {
                        flex-direction: column;
                    }
                    
                    .page-title {
                        font-size: 22px;
                    }
                    
                    .leave-item {
                        grid-template-columns: 1fr;
                    }
                    
                    .leave-meta {
                        flex-direction: row;
                        align-items: center;
                    }
                    
                    .date-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Leave Requests</h1>
                    <p className="page-subtitle">Request and track your leaves</p>
                </div>
                <button className="new-request-btn" onClick={() => setShowForm(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Request
                </button>
            </div>

            {success && <div className="alert success">{success}</div>}

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <p className="stat-value">{summary.pending}</p>
                    <p className="stat-label">Pending</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{summary.approved}</p>
                    <p className="stat-label">Approved</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{summary.rejected}</p>
                    <p className="stat-label">Rejected</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{summary.totalApprovedDays}</p>
                    <p className="stat-label">Days Taken</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {['all', 'pending', 'approved', 'rejected'].map((f) => (
                    <button
                        key={f}
                        className={`filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Leave List */}
            <div className="card">
                {loading ? (
                    <div className="empty-state">Loading...</div>
                ) : leaves.length ? (
                    <div className="leave-list">
                        {leaves.map((leave) => (
                            <div key={leave._id} className="leave-item">
                                <div className="leave-main">
                                    <p className="leave-type">{getLeaveTypeLabel(leave.leaveType)}</p>
                                    <div className="leave-dates">
                                        <span>{formatDate(leave.startDate)} — {formatDate(leave.endDate)}</span>
                                        <span className="leave-days">{leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}</span>
                                    </div>
                                    <p className="leave-reason">{leave.reason}</p>
                                    {leave.reviewNote && (
                                        <p className="leave-reason" style={{ fontStyle: 'italic', marginTop: 4 }}>
                                            Admin note: {leave.reviewNote}
                                        </p>
                                    )}
                                </div>
                                <div className="leave-meta">
                                    <span
                                        className="status-badge"
                                        style={{
                                            background: `${getStatusColor(leave.status)}20`,
                                            color: getStatusColor(leave.status)
                                        }}
                                    >
                                        {leave.status}
                                    </span>
                                    <span className="leave-date-applied">
                                        Applied {formatDate(leave.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No leave requests found</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">New Leave Request</h2>
                            <button className="close-btn" onClick={() => setShowForm(false)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert error">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Leave Type</label>
                                    <select
                                        className="form-select"
                                        value={formData.leaveType}
                                        onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                    >
                                        <option value="annual">Annual Leave</option>
                                        <option value="sick">Sick Leave</option>
                                        <option value="personal">Personal Leave</option>
                                        <option value="unpaid">Unpaid Leave</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="date-row">
                                    <div className="form-group">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Reason</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Briefly explain the reason for leave..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        required
                                    />
                                </div>

                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
