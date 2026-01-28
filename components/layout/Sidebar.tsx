"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Home,
    Briefcase,
    Building2,
    Users,
    Newspaper,
    Phone,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    LayoutDashboard,
    FileText,
    Settings,
    Menu,
    X,
} from "lucide-react";

interface SidebarProps {
    onOpenSignIn?: () => void;
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    isProtectedRoute?: boolean;
}

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
    { label: "Home", href: "/", icon: <Home size={20} /> },
    {
        label: "About Us",
        icon: <Building2 size={20} />,
        children: [
            { label: "Company Profile", href: "/about/company" },
            { label: "Leadership Team", href: "/about/leadership" },
            { label: "CSR", href: "/about/csr" },
        ],
    },
    {
        label: "Services",
        icon: <Users size={20} />,
        children: [
            { label: "General Staffing", href: "/services/general_staffing" },
            { label: "Professional Staffing", href: "/services/professional_staffing" },
            { label: "Digital Platform", href: "/services/digital_platform" },
        ],
    },
    { label: "Careers", href: "/careers", icon: <Briefcase size={20} /> },
    { label: "Media", href: "/media", icon: <Newspaper size={20} /> },
    { label: "Contact Us", href: "/contactUs", icon: <Phone size={20} /> },
];

const userNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "My Profile", href: "/profile", icon: <User size={20} /> },
    { label: "My Applications", href: "/applications", icon: <FileText size={20} /> },
];

// Navigation items to show in protected routes (user-specific)
const protectedNavItems: NavItem[] = [
    { label: "Jobs", href: "/jobs", icon: <Briefcase size={20} /> },
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "My Profile", href: "/profile", icon: <User size={20} /> },
    { label: "My Applications", href: "/applications", icon: <FileText size={20} /> },
];

export default function Sidebar({ onOpenSignIn, collapsed: controlledCollapsed, onCollapsedChange, isProtectedRoute = false }: SidebarProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Use controlled state if provided, otherwise use internal state
    const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
    const setCollapsed = (value: boolean) => {
        if (onCollapsedChange) {
            onCollapsedChange(value);
        } else {
            setInternalCollapsed(value);
        }
    };

    const toggleSubmenu = (label: string) => {
        setOpenSubmenu(openSubmenu === label ? null : label);
    };

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = item.href === pathname;
        const hasChildren = item.children && item.children.length > 0;
        const isSubmenuOpen = openSubmenu === item.label;

        // Clone icon with larger size when collapsed
        const iconSize = collapsed ? 24 : 20;
        const iconElement = item.icon && React.isValidElement(item.icon)
            ? React.cloneElement(item.icon as React.ReactElement<{ size: number }>, { size: iconSize })
            : item.icon;

        if (hasChildren) {
            return (
                <div>
                    <button
                        onClick={() => toggleSubmenu(item.label)}
                        title={collapsed ? item.label : undefined}
                        className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-xl transition-all ${isSubmenuOpen
                            ? "bg-[#05033e]/10 text-[#05033e]"
                            : "hover:bg-gray-100 text-gray-700"
                            }`}
                    >
                        {iconElement}
                        {!collapsed && (
                            <>
                                <span className="flex-1 text-left font-medium">{item.label}</span>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${isSubmenuOpen ? "rotate-180" : ""}`}
                                />
                            </>
                        )}
                    </button>
                    {!collapsed && isSubmenuOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                            {item.children!.map((child) => (
                                <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`block px-4 py-2 rounded-lg text-sm transition-colors ${pathname === child.href
                                        ? "bg-[#05033e] text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                href={item.href!}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? "bg-[#05033e] text-white shadow-lg shadow-[#05033e]/30"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
            >
                {iconElement}
                {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
        );
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-gray-100">
                <Link href="/" className="flex items-center justify-center">
                    {collapsed ? (
                        <Image
                            src="/home/sidebar_collapse.png"
                            alt="SHYNR"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    ) : (
                        <Image
                            src="/3.png"
                            alt="SHYNR"
                            width={140}
                            height={40}
                            className="object-contain"
                        />
                    )}
                </Link>
            </div>

            {/* Jobs Button - only show in public sidebar */}
            {!isProtectedRoute && (
                <div className="p-4">
                    <Link
                        href="/jobs"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all bg-[#05033e] text-white hover:bg-[#020120] shadow-lg shadow-[#05033e]/30 ${pathname === "/jobs" ? "ring-2 ring-offset-2 ring-[#05033e]" : ""
                            }`}
                    >
                        <Briefcase size={20} />
                        {!collapsed && "Browse Jobs"}
                    </Link>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {(isProtectedRoute ? protectedNavItems : navItems).map((item) => (
                    <NavLink key={item.label} item={item} />
                ))}
            </nav>

            {/* User Section */}
            <div className="border-t border-gray-100 p-4">
                {status === "loading" ? (
                    <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ) : session?.user ? (
                    <div className="space-y-2">
                        {/* User Info */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            {session.user.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#05033e] flex items-center justify-center text-white font-medium">
                                    {session.user.name?.[0] || session.user.email?.[0] || "U"}
                                </div>
                            )}
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                        {session.user.name || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {session.user.email}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* User Nav Items - only show in public sidebar since protected routes show them in main nav */}
                        {!collapsed && !isProtectedRoute && (
                            <div className="space-y-1">
                                {userNavItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href!}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === item.href
                                            ? "bg-[#05033e]/10 text-[#05033e]"
                                            : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Logout */}
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} />
                            {!collapsed && "Sign Out"}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onOpenSignIn}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium border-2 border-[#05033e] text-[#05033e] hover:bg-[#05033e] hover:text-white transition-all"
                    >
                        <User size={20} />
                        {!collapsed && "Sign In"}
                    </button>
                )}
            </div>

            {/* Collapse Toggle (Desktop) */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-[110] md:hidden p-2 bg-white rounded-lg shadow-lg"
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[90] md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-[100] transition-all duration-300 ${collapsed ? "w-20" : "w-72"
                    } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <SidebarContent />
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <LogOut className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Sign Out</h3>
                                <p className="text-sm text-gray-500">Are you sure you want to sign out?</p>
                            </div>
                        </div>

                        {/* User Info */}
                        {session?.user && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    {session.user.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[#05033e] flex items-center justify-center text-white font-medium">
                                            {session.user.name?.[0] || session.user.email?.[0] || "U"}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {session.user.name || "User"}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {session.user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-3 rounded-xl font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="flex-1 px-4 py-3 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
