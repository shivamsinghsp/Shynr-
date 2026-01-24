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
                    background: linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0d2847 100%);
                    padding: 20px;
                    position: relative;
                    overflow: hidden;
                }
                
                .employee-login-container::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
                    animation: pulse 8s ease-in-out infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                
                .login-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 48px;
                    width: 100%;
                    max-width: 440px;
                    position: relative;
                    z-index: 1;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                
                .logo-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 32px;
                }
                
                .portal-badge {
                    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
                    color: white;
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
                    color: white;
                    font-size: 28px;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 8px;
                }
                
                .login-subtitle {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 14px;
                    text-align: center;
                    margin-bottom: 32px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-label {
                    display: block;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 8px;
                }
                
                .form-input {
                    width: 100%;
                    padding: 14px 16px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    color: white;
                    font-size: 15px;
                    transition: all 0.3s ease;
                    outline: none;
                }
                
                .form-input:focus {
                    border-color: #06b6d4;
                    background: rgba(255, 255, 255, 0.12);
                    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
                }
                
                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .error-message {
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #fca5a5;
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
                    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
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
                    box-shadow: 0 10px 30px rgba(6, 182, 212, 0.4);
                }
                
                .submit-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .submit-button::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s ease;
                }
                
                .submit-button:hover::after {
                    left: 100%;
                }
                
                .back-link {
                    display: block;
                    text-align: center;
                    margin-top: 24px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 14px;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                
                .back-link:hover {
                    color: #06b6d4;
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
                            color: 'white',
                            letterSpacing: 2,
                            textShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
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
