import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../Service/AuthService';
import FinanceParticles from '../../Componentes/FinanceParticles/FinanceParticles';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            toast.success("OTP sent successfully to your email.");
            setStep(2);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to send OTP. Email may not exist.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (otp.length !== 6 || !otp.match(/^\d+$/)) {
            toast.error("OTP must be exactly 6 digits.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, otp, newPassword);
            toast.success("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-split-wrapper d-flex flex-column flex-md-row min-vh-100">
            <div className="login-left-pane col-12 col-md-6 d-flex flex-column justify-content-between p-4 p-lg-5">
                <div className="top-brand d-flex align-items-center mb-4">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '28px', marginRight: '8px' }}>
                        <path d="M38 4L14 36H28L20 60L50 24H34L38 4Z" fill="url(#orangeGrad)" />
                        <defs>
                            <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ff6c00" />
                                <stop offset="100%" stopColor="#ff3d00" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="brand-text-block">
                        <h6 className="brand-title mb-0">Sandhya Soft Technologies</h6>
                        <span className="brand-subtitle text-uppercase">GST BILLING SOLUTIONS</span>
                    </div>
                </div>

                <div className="my-auto d-flex justify-content-center w-100 py-4">
                    <div className="login-card-clean shadow-lg rounded-4 p-4 p-sm-5 w-100" style={{ maxWidth: '440px', background: 'rgba(255, 255, 255, 0.95)' }}>
                        <h3 className="fw-bold mb-4 text-dark text-center">Reset Password</h3>

                        {step === 1 ? (
                            <form onSubmit={handleSendOtp}>
                                <p className="text-muted text-center fs-7 mb-4">
                                    Enter your registered email address and we'll send you a 6-digit OTP to reset your password.
                                </p>
                                <div className="mb-4">
                                    <label className="form-label text-dark fw-semibold fs-7 mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        placeholder="Enter your email address" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary py-2.5 fw-bold" disabled={loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm"></span> : "Send OTP"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <p className="text-muted text-center fs-7 mb-4">
                                    We have sent a verification code to <strong>{email}</strong>. Enter the OTP and your new password.
                                </p>
                                <div className="mb-3">
                                    <label className="form-label text-dark fw-semibold fs-7 mb-2">6-Digit OTP</label>
                                    <input 
                                        type="text" 
                                        className="form-control text-center fw-bold fs-5" 
                                        placeholder="000000"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-dark fw-semibold fs-7 mb-2">New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="Min 6 characters" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary py-2.5 fw-bold" disabled={loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm"></span> : "Reset Password"}
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary py-2 fw-semibold" onClick={() => setStep(1)}>
                                        Back
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="mt-4 text-center">
                            <span className="text-primary fw-bold fs-7" onClick={() => navigate('/login')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                Back to Sign In
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-dark fs-7 text-center text-md-start mt-4">
                    &copy; {new Date().getFullYear()} Sandhya Soft Technologies.
                </div>
            </div>

            <div className="login-right-pane col-12 col-md-6 d-flex flex-column justify-content-between align-items-center p-4 p-lg-5 text-white position-relative text-center">
                <FinanceParticles opacityMultiplier={0.6} speedMultiplier={0.7} />
                <div className="w-100 my-auto d-flex flex-column align-items-center position-relative z-3">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '80px', height: '80px' }}>
                        <path d="M38 4L14 36H28L20 60L50 24H34L38 4Z" fill="currentColor" />
                    </svg>
                    <h3 className="fw-bold mb-1 text-info">Sandhya Soft Technologies</h3>
                    <h2 className="fw-bold mb-3 mt-4 text-info">Recover Your Account</h2>
                    <p className="landing-sub-text mx-auto" style={{ maxWidth: '480px' }}>
                        Verify your identity with one-time codes and securely restore your billing platform access.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
