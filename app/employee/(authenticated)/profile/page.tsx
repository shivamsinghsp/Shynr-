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
            <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>My Profile</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 }}>Manage your account</p>

            {/* Profile Card */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 20
            }}>
                <div style={{
                    width: 80, height: 80, borderRadius: 16,
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 32, fontWeight: 700
                }}>
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'E'}
                </div>
                <div>
                    <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>
                        {user?.name || 'Employee'}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{user?.email}</p>
                    <span style={{
                        background: 'rgba(6,182,212,0.2)',
                        color: '#06b6d4',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        marginTop: 8,
                        display: 'inline-block',
                        textTransform: 'capitalize'
                    }}>{user?.role || 'Employee'}</span>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['info', 'security'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '10px 20px',
                        background: activeTab === tab ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${activeTab === tab ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 8,
                        color: activeTab === tab ? '#06b6d4' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        fontSize: 14,
                        textTransform: 'capitalize'
                    }}>{tab === 'info' ? 'Personal Info' : 'Security'}</button>
                ))}
            </div>

            {message.text && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    marginBottom: 16,
                    background: message.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                    border: `1px solid ${message.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                    color: message.type === 'error' ? '#fca5a5' : '#86efac',
                    fontSize: 14
                }}>{message.text}</div>
            )}

            {/* Content */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: 24
            }}>
                {activeTab === 'info' ? (
                    <form onSubmit={handleProfileUpdate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 }}>First Name</label>
                                <input
                                    type="text"
                                    value={profileData.firstName}
                                    onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                                    placeholder={user?.name?.split(' ')[0] || ''}
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: 10, color: 'white', fontSize: 14
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 }}>Last Name</label>
                                <input
                                    type="text"
                                    value={profileData.lastName}
                                    onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                                    placeholder={user?.name?.split(' ')[1] || ''}
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: 10, color: 'white', fontSize: 14
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 }}>Email (cannot be changed)</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 10, color: 'rgba(255,255,255,0.4)', fontSize: 14
                                }}
                            />
                        </div>
                        <button type="submit" disabled={saving} style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                            border: 'none', borderRadius: 10,
                            color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                        }}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    </form>
                ) : (
                    <form onSubmit={handlePasswordChange}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 }}>Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: 10, color: 'white', fontSize: 14
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 }}>New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: 10, color: 'white', fontSize: 14
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 }}>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: 10, color: 'white', fontSize: 14
                                }}
                            />
                        </div>
                        <button type="submit" disabled={saving} style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                            border: 'none', borderRadius: 10,
                            color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                        }}>{saving ? 'Changing...' : 'Change Password'}</button>
                    </form>
                )}
            </div>
        </div>
    );
}
