'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';


export default function AdminLoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Clear any existing session when loading the login page
    useEffect(() => {
        if (status === 'authenticated' && session) {
            // If already logged in as admin or sub_admin, redirect to dashboard
            const userRole = (session.user as any)?.role;
            if (userRole === 'admin' || userRole === 'sub_admin') {
                router.push('/admin/dashboard');
            } else {
                // If logged in as user, sign out first
                signOut({ redirect: false });
            }
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError('Invalid credentials');
                setIsLoading(false);
            } else {
                // Check if user is actually an admin by fetching session
                try {
                    const sessionRes = await fetch('/api/auth/session');
                    const sessionData = await sessionRes.json();

                    const userRole = sessionData?.user?.role;
                    if (userRole !== 'admin' && userRole !== 'sub_admin') {
                        // Sign out the regular user and show error
                        await signOut({ redirect: false });
                        setError('This portal is for administrators only. Please use the regular sign-in at /auth/signin');
                        setIsLoading(false);
                        return;
                    }
                } catch (err) {
                    // If session check fails, still redirect but admin pages will handle auth
                }

                router.push('/admin/dashboard');
            }
        } catch (error) {
            setError('An error occurred during sign in');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-[#05033e] p-8 text-center text-white">
                    <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
                    <p className="text-blue-200">Restricted Access Only</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-colors"
                                placeholder="admin@shynr.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-colors pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-1">
                                <Link href="/auth/forgot-password" className="text-sm text-[#05033e] hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#05033e] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link href="/" className="text-gray-500 hover:text-[#05033e] text-sm transition-colors">
                            ← Back to Main Site
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
