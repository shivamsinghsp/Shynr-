'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        name: 'Dashboard',
        href: '/employee/dashboard',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        name: 'Attendance',
        href: '/employee/attendance',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    {
        name: 'Leave Requests',
        href: '/employee/leave',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    {
        name: 'Announcements',
        href: '/employee/announcements',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        ),
    },
    {
        name: 'My Profile',
        href: '/employee/profile',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/employee');
        } else if (status === 'authenticated') {
            const role = (session?.user as any)?.role;
            if (role !== 'employee' && role !== 'admin') {
                router.push('/employee');
            }
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0d2847 100%)'
            }}>
                <div style={{
                    width: 50,
                    height: 50,
                    border: '3px solid rgba(6, 182, 212, 0.2)',
                    borderTopColor: '#06b6d4',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/employee' });
    };

    const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Employee';
    const userRole = (session?.user as any)?.role || 'employee';

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#0d1b2a' }}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        zIndex: 95
                    }}
                />
            )}

            {/* Mobile Header */}
            <div style={{
                display: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 64,
                background: '#0d1b2a',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                zIndex: 90,
                padding: '0 16px',
                alignItems: 'center',
                justifyContent: 'space-between'
            }} className="mobile-header">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                    width: 40,
                    height: 40,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>SHYNR</span>
                <div style={{ width: 40 }} />
            </div>

            {/* Sidebar */}
            <aside style={{
                width: 260,
                background: '#0d1b2a',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100,
                transform: sidebarOpen ? 'translateX(0)' : undefined,
                transition: 'transform 0.3s ease'
            }} className="sidebar">
                {/* Sidebar Header */}
                <div style={{
                    padding: 24,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                            color: 'white',
                            fontSize: 22,
                            fontWeight: 800,
                            letterSpacing: 1
                        }}>SHYNR</span>
                        <span style={{
                            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: 0.5,
                            textTransform: 'uppercase'
                        }}>Employee</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 16px',
                                    color: isActive ? '#06b6d4' : 'rgba(255, 255, 255, 0.7)',
                                    textDecoration: 'none',
                                    borderRadius: 10,
                                    marginBottom: 4,
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 500,
                                    background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                                    border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                <div style={{
                    padding: 20,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 16
                    }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: 16
                        }}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{
                                color: 'white',
                                fontSize: 14,
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>{userName}</div>
                            <div style={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: 12,
                                textTransform: 'capitalize'
                            }}>{userRole}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={{
                        width: '100%',
                        padding: 10,
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 8,
                        color: '#fca5a5',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, marginLeft: 260, minHeight: '100vh' }} className="main-content">
                {children}
            </main>

            {/* Responsive Styles */}
            <style jsx global>{`
                @media (max-width: 768px) {
                    .mobile-header { display: flex !important; }
                    .sidebar { transform: translateX(-100%); }
                    .main-content { margin-left: 0 !important; padding-top: 64px; }
                }
            `}</style>
        </div>
    );
}
