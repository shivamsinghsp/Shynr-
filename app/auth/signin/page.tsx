"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function SignInPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showSignUp, setShowSignUp] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Sign In State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Sign Up State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Redirect if already signed in
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // Check if user has completed onboarding
            const onboardingCompleted = (session.user as { onboardingCompleted?: boolean }).onboardingCompleted;
            if (onboardingCompleted) {
                router.push("/jobs");
            } else {
                router.push("/onboarding");
            }
        }
    }, [status, session, router]);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        await signIn("google", { callbackUrl: "/onboarding" });
    };

    const handleLinkedInSignIn = async () => {
        setLoading(true);
        await signIn("linkedin", { callbackUrl: "/onboarding" });
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
            // Check onboarding status and redirect
            router.push("/onboarding");
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
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
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create account");
            }

            // Auto sign in after registration
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/onboarding");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking auth
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 bg-white">
                <div className="max-w-md w-full mx-auto">
                    {/* Logo */}
                    <Link href="/" className="inline-block mb-8">
                        <Image src="/3.png" alt="SHYNR" width={150} height={50} className="object-contain" />
                    </Link>

                    {showSignUp ? (
                        /* Sign Up Form */
                        <div>
                            <button
                                onClick={() => setShowSignUp(false)}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                            >
                                <ArrowLeft size={18} /> Back to Sign In
                            </button>

                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                            <p className="text-gray-600 mb-8">Join SHYNR to find your dream job</p>

                            <form onSubmit={handleSignUp} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
                                    <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-[#05033e] text-white rounded-xl font-semibold hover:bg-[#020120] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Sign In Form */
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                            <p className="text-gray-600 mb-8">Sign in to access job opportunities</p>

                            {/* OAuth Buttons */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="font-medium text-gray-700">Continue with Google</span>
                                </button>

                                <button
                                    onClick={handleLinkedInSignIn}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0A66C2] text-white rounded-xl hover:bg-[#004182] transition-all disabled:opacity-50"
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
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-[#05033e] text-white rounded-xl font-semibold hover:bg-[#020120] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
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
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    <Mail size={20} className="text-gray-500" />
                                    <span className="font-medium text-gray-700">Continue with Email</span>
                                </button>
                            )}

                            {/* Sign Up Link */}
                            <p className="text-center mt-8 text-gray-600">
                                Don&apos;t have an account?{" "}
                                <button
                                    onClick={() => setShowSignUp(true)}
                                    className="text-[#05033e] font-semibold hover:underline"
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#05033e] to-[#1a1a6e] relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 text-white">
                    <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                        Find Your<br />Dream Job
                    </h2>
                    <p className="text-lg text-white/80 mb-8 max-w-md">
                        Explore thousands of job opportunities with all the information you need. It&apos;s your future. Come find it.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <p className="text-3xl font-bold">1000+</p>
                            <p className="text-white/70 text-sm">Active Jobs</p>
                        </div>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <p className="text-3xl font-bold">500+</p>
                            <p className="text-white/70 text-sm">Companies</p>
                        </div>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <p className="text-3xl font-bold">10k+</p>
                            <p className="text-white/70 text-sm">Job Seekers</p>
                        </div>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <p className="text-3xl font-bold">95%</p>
                            <p className="text-white/70 text-sm">Success Rate</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
