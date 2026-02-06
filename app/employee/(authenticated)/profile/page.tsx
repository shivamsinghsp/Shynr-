'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface ProfileData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    profileImage?: string;
    role?: string;
}

interface CropState {
    scale: number;
    x: number;
    y: number;
}

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [activeTab, setActiveTab] = useState('info');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image cropper state
    const [showCropper, setShowCropper] = useState(false);
    const [cropImage, setCropImage] = useState<string>('');
    const [cropState, setCropState] = useState<CropState>({ scale: 1, x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const cropperRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const [profileData, setProfileData] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        profileImage: '',
        role: 'employee',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Fetch profile data on load
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                const data = await res.json();
                if (data.success && data.user) {
                    setProfileData({
                        firstName: data.user.firstName || '',
                        lastName: data.user.lastName || '',
                        phone: data.user.phone || '',
                        email: data.user.email || '',
                        profileImage: data.user.profileImage || '',
                        role: data.user.role || 'employee',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Handle file selection - open cropper instead of direct upload
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select an image file' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be less than 5MB' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setCropImage(event.target?.result as string);
            setCropState({ scale: 1, x: 0, y: 0 });
            setShowCropper(true);
        };
        reader.readAsDataURL(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Cropper mouse handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - cropState.x, y: e.clientY - cropState.y });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        setCropState(prev => ({
            ...prev,
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        }));
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - cropState.x,
                y: e.touches[0].clientY - cropState.y
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        setCropState(prev => ({
            ...prev,
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y,
        }));
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Zoom handlers
    const handleZoom = (delta: number) => {
        setCropState(prev => ({
            ...prev,
            scale: Math.max(0.5, Math.min(3, prev.scale + delta)),
        }));
    };

    // Generate cropped image
    const generateCroppedImage = (): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = imageRef.current;

            if (!ctx || !img) {
                resolve(cropImage);
                return;
            }

            // Output size (square crop)
            const outputSize = 300;
            canvas.width = outputSize;
            canvas.height = outputSize;

            // Calculate crop area based on the visible portion
            const containerSize = 240; // Size of the crop circle container
            const scale = cropState.scale;

            // Calculate the center offset
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            // The displayed image size
            const displayedWidth = containerSize * scale;
            const displayedHeight = (imgHeight / imgWidth) * containerSize * scale;

            // Calculate what portion of the image is visible in the circle
            const cropX = (containerSize / 2 - cropState.x) / scale;
            const cropY = (containerSize / 2 - cropState.y) / scale;

            // Source coordinates on the original image
            const srcX = (cropX / containerSize) * imgWidth - (imgWidth * (containerSize / displayedWidth)) / 2;
            const srcY = (cropY / containerSize) * imgHeight - (imgHeight * (containerSize / displayedHeight)) / 2;
            const srcSize = imgWidth / scale;

            ctx.drawImage(
                img,
                Math.max(0, srcX),
                Math.max(0, srcY),
                srcSize,
                srcSize,
                0,
                0,
                outputSize,
                outputSize
            );

            resolve(canvas.toDataURL('image/jpeg', 0.9));
        });
    };

    // Save cropped image
    const handleSaveCrop = async () => {
        setUploadingImage(true);
        setMessage({ type: '', text: '' });

        try {
            const croppedImage = await generateCroppedImage();

            const res = await fetch('/api/user/profile/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: croppedImage }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setProfileData(prev => ({ ...prev, profileImage: data.profileImage }));
                setMessage({ type: 'success', text: 'Profile image updated!' });
                setShowCropper(false);
                update();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to upload image' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCancelCrop = () => {
        setShowCropper(false);
        setCropImage('');
        setCropState({ scale: 1, x: 0, y: 0 });
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    phone: profileData.phone,
                }),
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

    if (loading) {
        return (
            <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid #e2e8f0',
                    borderTopColor: '#05033e',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); }}
            `}</style>

            {/* Image Cropper Modal */}
            {showCropper && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: 20
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: 24,
                        maxWidth: 400,
                        width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <h3 style={{
                            color: '#05033e',
                            fontSize: 18,
                            fontWeight: 600,
                            marginBottom: 8,
                            textAlign: 'center'
                        }}>
                            Adjust Your Photo
                        </h3>
                        <p style={{
                            color: '#64748b',
                            fontSize: 13,
                            textAlign: 'center',
                            marginBottom: 20
                        }}>
                            Drag to reposition • Use slider to zoom
                        </p>

                        {/* Crop Area */}
                        <div
                            ref={cropperRef}
                            style={{
                                width: 240,
                                height: 240,
                                margin: '0 auto 20px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '3px solid #05033e',
                                background: '#f1f5f9',
                                cursor: isDragging ? 'grabbing' : 'grab',
                                position: 'relative',
                                touchAction: 'none'
                            }}
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <img
                                ref={imageRef}
                                src={cropImage}
                                alt="Crop preview"
                                draggable={false}
                                style={{
                                    position: 'absolute',
                                    width: `${100 * cropState.scale}%`,
                                    height: 'auto',
                                    left: cropState.x,
                                    top: cropState.y,
                                    transformOrigin: 'center center',
                                    pointerEvents: 'none',
                                    userSelect: 'none'
                                }}
                            />
                        </div>

                        {/* Zoom Controls */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 24,
                            padding: '0 10px'
                        }}>
                            <button
                                onClick={() => handleZoom(-0.1)}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18,
                                    color: '#475569'
                                }}
                            >
                                −
                            </button>
                            <input
                                type="range"
                                min="0.5"
                                max="3"
                                step="0.1"
                                value={cropState.scale}
                                onChange={(e) => setCropState(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                                style={{
                                    flex: 1,
                                    height: 6,
                                    borderRadius: 3,
                                    background: '#e2e8f0',
                                    cursor: 'pointer',
                                    accentColor: '#05033e'
                                }}
                            />
                            <button
                                onClick={() => handleZoom(0.1)}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 18,
                                    color: '#475569'
                                }}
                            >
                                +
                            </button>
                        </div>

                        {/* Reset Position Button */}
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <button
                                onClick={() => setCropState({ scale: 1, x: 0, y: 0 })}
                                style={{
                                    padding: '8px 16px',
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: 8,
                                    color: '#475569',
                                    fontSize: 13,
                                    cursor: 'pointer'
                                }}
                            >
                                Reset Position
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={handleCancelCrop}
                                disabled={uploadingImage}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: 10,
                                    color: '#475569',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCrop}
                                disabled={uploadingImage}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    background: 'linear-gradient(135deg, #05033e, #1a1a6e)',
                                    border: 'none',
                                    borderRadius: 10,
                                    color: 'white',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8
                                }}
                            >
                                {uploadingImage ? (
                                    <>
                                        <div style={{
                                            width: 16,
                                            height: 16,
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: 'white',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                        Saving...
                                    </>
                                ) : 'Save Photo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 style={{ color: '#05033e', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>My Profile</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>Manage your account settings</p>

            {/* Profile Card with Image Upload */}
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
                {/* Profile Image with Upload */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: 16,
                        background: profileData.profileImage ? 'transparent' : 'linear-gradient(135deg, #05033e, #1a1a6e)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 32, fontWeight: 700,
                        overflow: 'hidden',
                        border: profileData.profileImage ? '2px solid #e2e8f0' : 'none'
                    }}>
                        {profileData.profileImage ? (
                            <img
                                src={profileData.profileImage}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            profileData.firstName?.charAt(0) || profileData.email?.charAt(0)?.toUpperCase() || 'E'
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        style={{
                            position: 'absolute',
                            bottom: -4,
                            right: -4,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#05033e',
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        {uploadingImage ? (
                            <div style={{
                                width: 12, height: 12,
                                border: '2px solid #ffffff40',
                                borderTopColor: 'white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>
                <div>
                    <h2 style={{ color: '#0f172a', fontSize: 20, fontWeight: 600 }}>
                        {profileData.firstName && profileData.lastName
                            ? `${profileData.firstName} ${profileData.lastName}`
                            : profileData.firstName || 'Employee'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: 14 }}>{profileData.email}</p>
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
                    }}>{profileData.role || 'Employee'}</span>
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
                                    placeholder="Enter your first name"
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
                                    placeholder="Enter your last name"
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 10, color: '#0f172a', fontSize: 14
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Phone Number</label>
                            <input
                                type="tel"
                                value={profileData.phone}
                                onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                placeholder="Enter your phone number"
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 10, color: '#0f172a', fontSize: 14
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', color: '#475569', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Email (cannot be changed)</label>
                            <input
                                type="email"
                                value={profileData.email}
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
                            {/* Password Requirements List */}
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
