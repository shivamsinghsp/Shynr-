'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [activeTab, setActiveTab] = useState('info');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Failed to update' });
            } else {
                setMessage({ type: 'success', text: 'Profile updated!' });
                update();
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Failed to change password' });
            } else {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const user = session?.user as any;

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ color: '#05033e', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>My Profile</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>Manage your account settings</p>

            {/* Profile Card */}
            <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    width: 80, height: 80, borderRadius: 16,
                    background: 'linear-gradient(135deg, #05033e, #1a1a6e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 32, fontWeight: 700
                }}>
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'E'}
                </div>
                <div>
                    <h2 style={{ color: '#0f172a', fontSize: 20, fontWeight: 600 }}>
                        {user?.name || 'Employee'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: 14 }}>{user?.email}</p>
                    <span style={{
                        background: '#e0f2fe',
                        color: '#0284c7',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        marginTop: 8,
                        display: 'inline-block',
                        textTransform: 'capitalize',
                        fontWeight: 600
                    }}>{user?.role || 'Employee'}</span>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['info', 'security'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '10px 20px',
                        background: activeTab === tab ? '#e0f2fe' : 'white',
                        border: `1px solid ${activeTab === tab ? '#bae6fd' : '#e2e8f0'}`,
                        borderRadius: 8,
                        color: activeTab === tab ? '#0284c7' : '#64748b',
                        cursor: 'pointer',
                        fontSize: 14,
                        textTransform: 'capitalize',
                        fontWeight: activeTab === tab ? 600 : 500
                    }}>{tab === 'info' ? 'Personal Info' : 'Security'}</button>
                ))}
            </div>

            {message.text && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    marginBottom: 16,
                    background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                    color: message.type === 'error' ? '#ef4444' : '#15803d',
                    fontSize: 14
                }}>{message.text}</div>
            )}

            {/* Content */}
            <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                {activeTab === 'info' ? (
                    <form onSubmit={handleProfileUpdate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={{ display: 'block', color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>First Name</label>
                                <input
                                    type="text"
                                    value={profileData.firstName}
                                    onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                                    placeholder={user?.name?.split(' ')[0] || ''}
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 10, color: '#0f172a', fontSize: 14
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Last Name</label>
                                <input
                                    type="text"
                                    value={profileData.lastName}
                                    onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                                    placeholder={user?.name?.split(' ')[1] || ''}
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 10, color: '#0f172a', fontSize: 14
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Email (cannot be changed)</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 10, color: '#64748b', fontSize: 14
                                }}
                            />
                        </div>
                        <button type="submit" disabled={saving} style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #05033e, #1a1a6e)',
                            border: 'none', borderRadius: 10,
                            color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(5, 3, 62, 0.2)'
                        }}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    </form>
                ) : (
                    <form onSubmit={handlePasswordChange}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 10, color: '#0f172a', fontSize: 14
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 10, color: '#0f172a', fontSize: 14
                                }}
                            />
                            {/* Password Requirements List - Sequential highlighting */}
                            {(() => {
                                const criteria = [
                                    { met: passwordData.newPassword.length >= 8, label: 'At least 8 characters' },
                                    { met: /[A-Z]/.test(passwordData.newPassword), label: 'At least one uppercase letter' },
                                    { met: /[0-9]/.test(passwordData.newPassword), label: 'At least one number' },
                                    { met: /[!@#$%^&*]/.test(passwordData.newPassword), label: 'At least one special character' }
                                ];
                                const fulfilledCount = criteria.filter(c => c.met).length;

                                return (
                                    <div className="mt-3 space-y-1">
                                        <p className="text-xs text-gray-500 font-medium mb-1">Password must contain:</p>
                                        <ul className="text-xs space-y-1 text-gray-500 pl-1">
                                            {criteria.map((c, i) => {
                                                const isGreen = i < fulfilledCount;
                                                return (
                                                    <li key={i} className={`flex items-center gap-1.5 ${isGreen ? 'text-green-600' : ''}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${isGreen ? 'bg-green-600' : 'bg-gray-300'}`} />
                                                        {c.label}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                            })()}
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 10, color: '#0f172a', fontSize: 14
                                }}
                            />
                        </div>
                        <button type="submit" disabled={saving} style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #05033e, #1a1a6e)',
                            border: 'none', borderRadius: 10,
                            color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(5, 3, 62, 0.2)'
                        }}>{saving ? 'Changing...' : 'Change Password'}</button>
                    </form>
                )}
            </div>
        </div>
    );
}
