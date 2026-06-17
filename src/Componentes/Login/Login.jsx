import React, { useState } from 'react';
import './Login.css';

import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { login, loginGoogle } from '../../Service/AuthService';
import AuthBackground from '../AuthBackground/AuthBackground';
import { assets } from '../../assets/assets';

const BillingIllustration = () => (
    <svg viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-illustration">
        <defs>
            <filter id="billShadow" x="-15%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(37,99,235,0.12)" />
            </filter>
        </defs>
        <circle cx="252" cy="40" r="50" fill="#dbeafe" opacity="0.6" />
        <circle cx="48" cy="198" r="32" fill="#dbeafe" opacity="0.5" />
        <rect x="60" y="28" width="180" height="172" rx="12" fill="white" filter="url(#billShadow)" />
        <rect x="60" y="28" width="180" height="44" rx="12" fill="#2563eb" />
        <rect x="60" y="55" width="180" height="17" fill="#2563eb" />
        <rect x="80" y="42" width="60" height="7" rx="3.5" fill="rgba(255,255,255,0.55)" />
        <rect x="80" y="58" width="40" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" />
        <rect x="80" y="90" width="90" height="6" rx="3" fill="#e2e8f0" />
        <rect x="80" y="104" width="66" height="6" rx="3" fill="#e2e8f0" />
        <rect x="80" y="118" width="76" height="6" rx="3" fill="#e2e8f0" />
        <rect x="190" y="90" width="28" height="6" rx="3" fill="#bfdbfe" />
        <rect x="194" y="104" width="24" height="6" rx="3" fill="#bfdbfe" />
        <rect x="192" y="118" width="26" height="6" rx="3" fill="#bfdbfe" />
        <line x1="80" y1="132" x2="220" y2="132" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="84" y="160" width="18" height="32" rx="3" fill="#bfdbfe" />
        <rect x="108" y="148" width="18" height="44" rx="3" fill="#3b82f6" />
        <rect x="132" y="154" width="18" height="38" rx="3" fill="#bfdbfe" />
        <rect x="156" y="142" width="18" height="50" rx="3" fill="#2563eb" />
        <rect x="180" y="150" width="18" height="42" rx="3" fill="#93c5fd" />
        <circle cx="218" cy="55" r="20" fill="#10b981" />
        <path d="M210 55 L216 61 L227 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="72" cy="184" r="15" fill="#fef9c3" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="72" y="189" textAnchor="middle" fontSize="12" fill="#d97706" fontWeight="bold">₹</text>
        <text x="244" y="150" fontSize="22" fill="#2563eb" opacity="0.35" fontWeight="bold">+</text>
        <text x="38" y="82" fontSize="17" fill="#2563eb" opacity="0.3" fontWeight="bold">+</text>
    </svg>
);

const Login = () => {
    const { setAuthData, headerName } = React.useContext(AppContext);
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [data, setData] = useState({ email: '', password: '' });

    React.useEffect(() => {
        const id = 'google-gsi-client';
        if (!document.getElementById(id)) {
            const script = document.createElement('script');
            script.id = id;
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => initializeGoogleSignIn();
            document.body.appendChild(script);
        } else if (window.google) {
            initializeGoogleSignIn();
        }
    }, []);

    const initializeGoogleSignIn = () => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1020739958744-example.apps.googleusercontent.com',
                callback: handleGoogleLoginSuccess
            });
            window.google.accounts.id.renderButton(
                document.getElementById('googleSignInBtn'),
                { theme: 'outline', size: 'large', width: 340 }
            );
        }
    };

    const handleGoogleLoginSuccess = async (response) => {
        setLoading(true);
        try {
            const result = await loginGoogle(response.credential);
            if (result.status === 200) {
                toast.success('Login successful');
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('role', result.data.role);
                setAuthData(result.data.token, result.data.role);
                navigate('/dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || '';
            if (msg.toLowerCase().includes('pending approval')) navigate('/pending-approval');
            else if (msg.toLowerCase().includes('rejected')) navigate('/account-rejected');
            else if (msg.toLowerCase().includes('disabled')) navigate('/account-disabled');
            else toast.error(msg || 'Google Sign-In failed');
        } finally {
            setLoading(false);
        }
    };

    const onChangeHandler = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login(data);
            if (response.status === 200) {
                toast.success('Login successful');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
                setAuthData(response.data.token, response.data.role);
                navigate('/dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || '';
            if (msg.toLowerCase().includes('pending approval')) navigate('/pending-approval');
            else if (msg.toLowerCase().includes('rejected')) navigate('/account-rejected');
            else if (msg.toLowerCase().includes('disabled')) navigate('/account-disabled');
            else toast.error(msg || 'Email or password is incorrect');
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
                        <h2 className="auth-title">Login</h2>

                        <form onSubmit={onSubmitHandler}>
                            <div className="auth-field">
                                <label className="auth-label">Username or email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="auth-input"
                                    placeholder="Enter your email address"
                                    onChange={onChangeHandler}
                                    value={data.email}
                                    required
                                />
                            </div>

                            <div className="auth-field">
                                <div className="auth-label-row">
                                    <label className="auth-label" style={{ margin: 0 }}>Password</label>
                                    <button type="button" className="auth-forgot-link" onClick={() => navigate('/forgot-password')}>
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="auth-input-wrap">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="auth-input"
                                        placeholder="Enter your password"
                                        onChange={onChangeHandler}
                                        value={data.password}
                                        required
                                    />
                                    <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(p => !p)}>
                                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                    </button>
                                </div>
                            </div>

                            <label className="auth-remember">
                                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                                Remember me
                            </label>

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading
                                    ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    : 'Login'
                                }
                            </button>
                        </form>

                        <div className="auth-divider"><span>or</span></div>

                        <div id="googleSignInBtn"></div>

                        <p className="auth-bottom-text">
                            Don't have an account?{' '}
                            <span className="auth-link" onClick={() => navigate('/register-shop')}>Sign up</span>
                        </p>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="auth-right">
                    <BillingIllustration />
                    <h3 className="auth-right-title">Check Your Business Progress</h3>
                    <p className="auth-right-text">
                        Secure, reliable and scalable platform for GST invoicing, real-time sales reporting, stock inventory, and ledger audits.
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

export default Login;
