"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { X, Mail, Loader2 } from "lucide-react";
import SignUpForm from "./SignUpForm";

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    callbackUrl?: string;
}

export default function SignInModal({ isOpen, onClose, callbackUrl = "/" }: SignInModalProps) {
    const [showSignUp, setShowSignUp] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        setLoading(true);
        await signIn("google", { callbackUrl });
    };

    const handleLinkedInSignIn = async () => {
        setLoading(true);
        await signIn("linkedin", { callbackUrl });
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            window.location.href = callbackUrl;
        }
    };

    const handleSignUpSuccess = () => {
        setShowSignUp(false);
        setShowEmailForm(true);
        setError("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                {/* Content */}
                <div className="p-8">
                    {showSignUp ? (
                        <SignUpForm
                            onBack={() => setShowSignUp(false)}
                            onSuccess={handleSignUpSuccess}
                        />
                    ) : (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Welcome to SHYNR
                                </h2>
                                <p className="text-gray-600">
                                    Sign in to access job opportunities
                                </p>
                            </div>

                            {/* OAuth Buttons */}
                            <div className="space-y-3 mb-6">
                                {/* Google */}
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span className="font-medium text-gray-700">Continue with Google</span>
                                </button>

                                {/* LinkedIn */}
                                <button
                                    onClick={handleLinkedInSignIn}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0A66C2] text-white rounded-xl hover:bg-[#004182] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                                    </svg>
                                    <span className="font-medium">Continue with LinkedIn</span>
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">or</span>
                                </div>
                            </div>

                            {/* Email Form */}
                            {showEmailForm ? (
                                <form onSubmit={handleEmailSignIn} className="space-y-4">
                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-[#05033e] text-white rounded-xl font-medium hover:bg-[#020120] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            "Sign In"
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowEmailForm(false)}
                                        className="w-full text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Back to options
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setShowEmailForm(true)}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <Mail size={20} className="text-gray-500" />
                                    <span className="font-medium text-gray-700">Continue with Email</span>
                                </button>
                            )}

                            {/* Sign Up Link */}
                            <div className="mt-6 text-center">
                                <p className="text-gray-600">
                                    Don&apos;t have an account?{" "}
                                    <button
                                        onClick={() => setShowSignUp(true)}
                                        className="text-[#05033e] font-medium hover:underline"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
