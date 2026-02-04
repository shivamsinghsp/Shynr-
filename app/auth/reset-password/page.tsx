"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, Shield } from "lucide-react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const verified = searchParams.get("verified") === "true";
    const token = searchParams.get("token");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Get email from session storage (set during OTP verification)
    useEffect(() => {
        if (verified) {
            const storedEmail = sessionStorage.getItem('resetPasswordEmail');
            if (storedEmail) {
                setEmail(storedEmail);
            } else {
                // If no email in session, redirect back to forgot password
                router.push('/auth/forgot-password');
            }
        }
    }, [verified, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            // Determine which API to use based on whether we have a token or verified OTP
            const endpoint = token ? "/api/auth/reset-password" : "/api/auth/reset-password";
            const body = token
                ? { token, password }
                : { email, password, otpVerified: true };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            // Clear session storage
            sessionStorage.removeItem('resetPasswordEmail');

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Show invalid state if neither token nor verified OTP
    if (!token && !verified) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-8">
                    Please verify your email first to reset your password.
                </p>
                <Link
                    href="/auth/forgot-password"
                    className="inline-block px-6 py-3 bg-[#05033e] text-white rounded-xl font-semibold hover:bg-[#020120] transition-all"
                >
                    Go to Forgot Password
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset!</h1>
                <p className="text-gray-600 mb-8">
                    Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <Link
                    href="/auth/signin"
                    className="inline-block px-6 py-3 bg-[#05033e] text-white rounded-xl font-semibold hover:bg-[#020120] transition-all"
                >
                    Sign In Now
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Verified Badge */}
            {verified && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-medium">Email verified for: {email}</span>
                </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h1>
            <p className="text-gray-600 mb-8">
                Enter your new password below. Make sure it&apos;s strong and secure.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all pr-12"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Password Requirements List */}
                    <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-500 font-medium mb-1">Password must contain:</p>
                        <ul className="text-xs space-y-1 text-gray-500 pl-1">
                            <li className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-600' : 'bg-gray-300'}`} />
                                At least 8 characters
                            </li>
                            <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                                At least one uppercase letter
                            </li>
                            <li className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                                At least one number
                            </li>
                            <li className={`flex items-center gap-1.5 ${/[!@#$%^&*]/.test(password) ? 'text-green-600' : ''}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*]/.test(password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                                At least one special character
                            </li>
                        </ul>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                {/* Password Strength Indicator */}
                {password && (
                    <div className="space-y-2">
                        <div className="flex gap-1">
                            <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            <div className={`h-1 flex-1 rounded-full ${password.length >= 12 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            <div className={`h-1 flex-1 rounded-full ${/[!@#$%^&*]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        </div>
                        <p className="text-xs text-gray-500">
                            {password.length < 8 ? 'Weak' : password.length < 12 ? 'Good' : 'Strong'} password
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#05033e] text-white rounded-xl font-semibold hover:bg-[#020120] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 bg-white">
                <div className="max-w-md w-full mx-auto">
                    {/* Logo */}
                    <Link href="/" className="inline-block mb-8">
                        <Image src="/3.png" alt="SHYNR" width={150} height={50} className="object-contain" />
                    </Link>

                    <Link
                        href="/auth/signin"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft size={18} /> Back to Sign In
                    </Link>

                    <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#05033e] to-[#1a1a6e] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 text-white">
                    <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                        Create New<br />Password
                    </h2>
                    <p className="text-lg text-white/80 mb-8 max-w-md">
                        Choose a strong password that you haven&apos;t used before. For your security, we recommend using a mix of letters, numbers, and symbols.
                    </p>

                    {/* Password Tips */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Password Tips</h3>
                        <ul className="space-y-2 text-white/80 text-sm">
                            <li className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-400" />
                                Use at least 8 characters
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-400" />
                                Include uppercase and lowercase letters
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-400" />
                                Add numbers and special characters
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-400" />
                                Avoid common words or patterns
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
