'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'Configuration':
                return 'There is a problem with the server configuration.';
            case 'AccessDenied':
                return 'Access denied. You do not have permission to sign in.';
            case 'Verification':
                return 'The verification link has expired or has already been used.';
            case 'OAuthSignin':
                return 'Error starting the OAuth sign-in process.';
            case 'OAuthCallback':
                return 'Error during the OAuth callback.';
            case 'OAuthCreateAccount':
                return 'Could not create OAuth account.';
            case 'EmailCreateAccount':
                return 'Could not create email account.';
            case 'Callback':
                return 'Error during authentication callback.';
            case 'OAuthAccountNotLinked':
                return 'This email is already associated with another account.';
            case 'EmailSignin':
                return 'Error sending the verification email.';
            case 'CredentialsSignin':
                return 'Invalid credentials. Please check your email and password.';
            case 'SessionRequired':
                return 'You need to be signed in to access this page.';
            default:
                if (error?.includes('ECONNREFUSED') || error?.includes('mongodb')) {
                    return 'Database connection error. Please try again in a moment.';
                }
                return 'An unexpected error occurred. Please try again.';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <svg
                            className="h-8 w-8 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Authentication Error
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {getErrorMessage(error)}
                    </p>
                    {error && (
                        <p className="text-xs text-gray-400 mb-6 break-all">
                            Error code: {error.substring(0, 100)}
                        </p>
                    )}
                    <div className="space-y-3">
                        <Link
                            href="/auth/signin"
                            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </Link>
                        <Link
                            href="/"
                            className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-gray-600">Loading...</div>
            </div>
        }>
            <ErrorContent />
        </Suspense>
    );
}
