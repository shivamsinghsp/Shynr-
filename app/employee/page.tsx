'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, Mail, Lock } from 'lucide-react';

export default function EmployeeLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setLoading(false);
                return;
            }

            // Fetch user session to check role
            const response = await fetch('/api/auth/session');
            const session = await response.json();

            if (!session?.user?.role || session.user.role === 'user') {
                // Sign out and show error
                await signIn('credentials', { redirect: false });
                setError('Access denied. Only employees can access this portal.');
                setLoading(false);
                return;
            }

            router.push('/employee/dashboard');
            router.refresh();
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-50" />

            {/* Decorative Elements */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 w-full max-w-md">
                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#05033e] to-[#1a1a6e] px-8 py-10 text-center">
                        <h1 className="text-4xl font-bold text-white tracking-wider">SHYNR</h1>
                        <span className="inline-block mt-3 px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold text-white/90 tracking-wide">
                            EMPLOYEE PORTAL
                        </span>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome Back</h2>
                        <p className="text-gray-500 text-center text-sm mb-8">Sign in to access your employee dashboard</p>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail size={18} />
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e] transition-all"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                                        Password
                                    </label>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm text-[#05033e] hover:text-[#1a1a6e] font-medium hover:underline transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e] transition-all"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-[#05033e] to-[#1a1a6e] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        {/* Back Link */}
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 mt-6 text-gray-500 hover:text-[#05033e] text-sm font-medium transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Footer Text */}
                <p className="text-center text-gray-400 text-xs mt-6">
                    © {new Date().getFullYear()} Shynr. All rights reserved.
                </p>
            </div>
        </div>
    );
}
