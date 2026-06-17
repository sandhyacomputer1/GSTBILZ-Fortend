import React, { useState } from 'react';
import '../../Componentes/Login/Login.css';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../Service/AuthService';
import AuthBackground from '../../Componentes/AuthBackground/AuthBackground';
import { assets } from '../../assets/assets';

const SecurityIllustration = () => (
    <svg viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-illustration">
        <defs>
            <filter id="secShadow" x="-15%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(37,99,235,0.12)" />
            </filter>
            <linearGradient id="shieldFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eff6ff" />
                <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
        </defs>
        <circle cx="252" cy="38" r="50" fill="#dbeafe" opacity="0.6" />
        <circle cx="48" cy="198" r="32" fill="#dbeafe" opacity="0.5" />
        {/* Shield */}
        <path d="M150 30 L206 54 L206 116 Q206 162 150 184 Q94 162 94 116 L94 54 Z" fill="white" filter="url(#secShadow)" />
        <path d="M150 42 L196 63 L196 116 Q196 155 150 172 Q104 155 104 116 L104 63 Z" fill="url(#shieldFill)" />
        {/* Lock body */}
        <rect x="128" y="104" width="44" height="36" rx="7" fill="#2563eb" />
        {/* Lock shackle */}
        <path d="M137 104 L137 94 Q137 82 150 82 Q163 82 163 94 L163 104" stroke="#2563eb" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Keyhole */}
        <circle cx="150" cy="120" r="5.5" fill="white" />
        <rect x="147.5" y="125" width="5" height="8" rx="1.5" fill="white" />
        {/* Email envelope (top-left floating card) */}
        <rect x="44" y="80" width="58" height="44" rx="7" fill="white" stroke="#e2e8f0" strokeWidth="1.5" filter="url(#secShadow)" />
        <path d="M50 86 L73 103 L102 86" stroke="#2563eb" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <line x1="50" y1="116" x2="102" y2="116" stroke="#e2e8f0" strokeWidth="1" />
        {/* OTP boxes (bottom) */}
        <rect x="84" y="190" width="22" height="24" rx="5" fill="white" stroke="#2563eb" strokeWidth="1.5" />
        <rect x="112" y="190" width="22" height="24" rx="5" fill="#2563eb" />
        <rect x="140" y="190" width="22" height="24" rx="5" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
        <rect x="168" y="190" width="22" height="24" rx="5" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
        <text x="95" y="207" textAnchor="middle" fontSize="11" fill="#2563eb" fontWeight="bold">8</text>
        <text x="123" y="207" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">4</text>
        <text x="151" y="207" textAnchor="middle" fontSize="11" fill="#cbd5e1" fontWeight="bold">_</text>
        <text x="179" y="207" textAnchor="middle" fontSize="11" fill="#cbd5e1" fontWeight="bold">_</text>
        {/* Check badge */}
        <circle cx="220" cy="58" r="20" fill="#10b981" />
        <path d="M212 58 L218 64 L229 47" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="244" y="148" fontSize="22" fill="#2563eb" opacity="0.35" fontWeight="bold">+</text>
        <text x="38" y="80" fontSize="17" fill="#2563eb" opacity="0.3" fontWeight="bold">+</text>
    </svg>
);

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            await forgotPassword(email);
            toast.success('OTP sent successfully to your email.');
            setStep(2);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to send OTP. Email may not exist.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (otp.length !== 6 || !otp.match(/^\d+$/)) {
            toast.error('OTP must be exactly 6 digits.');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await resetPassword(email, otp, newPassword);
            toast.success('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <AuthBackground />
            <div className="auth-card">

                {/* LEFT PANEL */}
                <div className="auth-left">
                    <div className="auth-top-brand">
                        <img src={assets.logo} alt="GSTBLIZ Logo" style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }} />
                        <div>
                            <p className="auth-brand-name">Sandhya Soft Technologies</p>
                            <span className="auth-brand-sub">GST Billing Solutions</span>
                        </div>
                    </div>

                    <div className="auth-form-area">
                        <h2 className="auth-title">
                            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                        </h2>

                        {step === 1 ? (
                            <form onSubmit={handleSendOtp}>
                                <p style={{ fontSize: '0.83rem', color: '#718096', textAlign: 'center', marginBottom: '24px', lineHeight: 1.6 }}>
                                    Enter your registered email address and we'll send you a 6-digit OTP to reset your password.
                                </p>
                                <div className="auth-field">
                                    <label className="auth-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="auth-input"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="auth-btn" disabled={loading}>
                                    {loading
                                        ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        : 'Send OTP'
                                    }
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <p style={{ fontSize: '0.83rem', color: '#718096', textAlign: 'center', marginBottom: '24px', lineHeight: 1.6 }}>
                                    We sent a verification code to <strong style={{ color: '#1a202c' }}>{email}</strong>. Enter the OTP and your new password below.
                                </p>
                                <div className="auth-field">
                                    <label className="auth-label">6-Digit OTP</label>
                                    <input
                                        type="text"
                                        className="auth-input auth-otp-input"
                                        placeholder="000000"
                                        maxLength="6"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">New Password</label>
                                    <div className="auth-input-wrap">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="auth-input"
                                            placeholder="Min 6 characters"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(p => !p)}>
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="auth-btn" disabled={loading}>
                                    {loading
                                        ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        : 'Reset Password'
                                    }
                                </button>
                                <button type="button" className="auth-btn-outline" onClick={() => setStep(1)}>
                                    Back
                                </button>
                            </form>
                        )}

                        <p className="auth-bottom-text">
                            Remembered it?{' '}
                            <span className="auth-link" onClick={() => navigate('/login')}>Back to Sign In</span>
                        </p>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="auth-right">
                    <SecurityIllustration />
                    <h3 className="auth-right-title">Secure Account Recovery</h3>
                    <p className="auth-right-text">
                        Verify your identity with a one-time code and securely restore access to your billing platform in seconds.
                    </p>
                    <div className="auth-right-accent"></div>
                </div>
            </div>

            <div className="auth-footer">
                &copy; {new Date().getFullYear()} Sandhya Soft Technologies. All Rights Reserved.
            </div>
        </div>
    );
};

export default ForgotPassword;
