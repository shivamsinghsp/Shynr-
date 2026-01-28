'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EmployeeLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        <div className="employee-login-container">
            <style jsx>{`
                .employee-login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f1f5f9;
                    background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
                    background-size: 32px 32px;
                    padding: 20px;
                    position: relative;
                    overflow: hidden;
                }
                
                .login-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    padding: 48px;
                    width: 100%;
                    max-width: 440px;
                    position: relative;
                    z-index: 1;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                }
                
                .logo-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 32px;
                }
                
                .portal-badge {
                    background: #e0f2fe;
                    color: #0284c7;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    margin-top: 12px;
                    display: inline-block;
                }
                
                .login-title {
                    color: #0f172a;
                    font-size: 28px;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 8px;
                }
                
                .login-subtitle {
                    color: #64748b;
                    font-size: 14px;
                    text-align: center;
                    margin-bottom: 32px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-label {
                    display: block;
                    color: #475569;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 8px;
                }
                
                .form-input {
                    width: 100%;
                    padding: 14px 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    color: #0f172a;
                    font-size: 15px;
                    transition: all 0.3s ease;
                    outline: none;
                }
                
                .form-input:focus {
                    border-color: #0ea5e9;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
                }
                
                .form-input::placeholder {
                    color: #94a3b8;
                }
                
                .error-message {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #ef4444;
                    padding: 12px 16px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .submit-button {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #05033e 0%, #1a1a6e 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .submit-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(5, 3, 62, 0.25);
                }
                
                .submit-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .back-link {
                    display: block;
                    text-align: center;
                    margin-top: 24px;
                    color: #64748b;
                    font-size: 14px;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                
                .back-link:hover {
                    color: #05033e;
                }
                
                .loading-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-right: 8px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                @media (max-width: 480px) {
                    .login-card {
                        padding: 32px 24px;
                    }
                    
                    .login-title {
                        font-size: 24px;
                    }
                }
            `}</style>

            <div className="login-card">
                <div className="logo-container">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: 36,
                            fontWeight: 800,
                            color: '#05033e',
                            letterSpacing: 2,
                        }}>SHYNR</div>
                        <div className="portal-badge">Employee Portal</div>
                    </div>
                </div>

                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Sign in to access your employee dashboard</p>

                {error && (
                    <div className="error-message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <Link href="/" className="back-link">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
