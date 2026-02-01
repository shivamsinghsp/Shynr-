'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('App Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-red-500" size={32} />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>

                <p className="text-gray-600 mb-8">
                    We apologize for the inconvenience. Our team has been notified of this issue.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={reset}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#05033e] text-white rounded-xl font-medium hover:bg-[#020120] transition-colors"
                    >
                        <RefreshCcw size={18} />
                        Try again
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                    >
                        Go back home
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-48 text-xs font-mono text-gray-800">
                        <p className="font-bold mb-1">Error Digest: {error.digest}</p>
                        <p>{error.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
