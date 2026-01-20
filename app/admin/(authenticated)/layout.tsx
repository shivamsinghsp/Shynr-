'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminAuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/admin');
            return;
        }

        // @ts-ignore
        if (session.user?.role !== 'admin') {
            router.push('/');
        }
    }, [session, status, router]);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05033e]"></div>
            </div>
        );
    }

    if (!session || (session.user as any).role !== 'admin') {
        return null;
    }

    const navItems = [
        {
            href: '/admin/dashboard', label: 'Dashboard', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            href: '/admin/jobs', label: 'Jobs', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            href: '/admin/applications', label: 'Applications', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            href: '/admin/users', label: 'Users', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile overlay - GPU accelerated */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                    style={{ transform: 'translateZ(0)' }}
                />
            )}

            {/* Sidebar - Always visible on desktop, optimized with GPU acceleration */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-64 bg-[#05033e] text-white z-50
                    transform transition-transform duration-300 ease-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
                style={{
                    willChange: 'transform',
                    transform: sidebarOpen ? 'translate3d(0, 0, 0)' : undefined,
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {/* Sidebar Header */}
                <div className="sticky top-0 p-6 flex items-center justify-between bg-[#05033e] z-10">
                    <h2 className="text-xl font-bold">Shynr Admin</h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Nav - with custom scrollbar */}
                <nav className="overflow-y-auto h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-white/20">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-6 py-3 transition-colors
                                    ${isActive
                                        ? 'bg-white/10 text-white font-medium border-l-4 border-white'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                                    }
                                `}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout button - fixed at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#05033e]">
                    <button
                        onClick={() => signOut({ callbackUrl: '/admin' })}
                        className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen flex flex-col">
                {/* Sticky Header - for both mobile and desktop */}
                <header className="bg-white shadow-sm sticky top-0 z-30" style={{ transform: 'translateZ(0)' }}>
                    <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Title - centered on mobile, left on desktop */}
                        <h1 className="text-lg font-semibold text-[#05033e] lg:hidden">Shynr Admin</h1>

                        {/* Desktop header content */}
                        <div className="hidden lg:flex items-center gap-4 flex-1">
                            <span className="text-gray-500 text-sm">Welcome back,</span>
                            <span className="font-medium text-gray-900">{session.user?.name || session.user?.email || 'Admin'}</span>
                        </div>

                        {/* User avatar / spacer */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#05033e] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {session.user?.name?.[0] || session.user?.email?.[0]?.toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
