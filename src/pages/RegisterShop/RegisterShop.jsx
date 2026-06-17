import React, { useState } from 'react';
import '../../Componentes/Login/Login.css';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { registerShop } from '../../Service/AuthService';
import AuthBackground from '../../Componentes/AuthBackground/AuthBackground';
import { assets } from '../../assets/assets';

const ShopIllustration = () => (
    <svg viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="auth-illustration">
        <defs>
            <filter id="shopShadow" x="-15%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(37,99,235,0.12)" />
            </filter>
        </defs>
        <circle cx="252" cy="38" r="50" fill="#dbeafe" opacity="0.6" />
        <circle cx="48" cy="198" r="32" fill="#dbeafe" opacity="0.5" />
        {/* Store building */}
        <rect x="68" y="78" width="164" height="122" rx="6" fill="white" filter="url(#shopShadow)" />
        {/* Awning */}
        <rect x="58" y="64" width="184" height="30" rx="6" fill="#2563eb" />
        <rect x="78" y="64" width="8" height="30" fill="#1d4ed8" opacity="0.35" />
        <rect x="106" y="64" width="8" height="30" fill="#1d4ed8" opacity="0.35" />
        <rect x="134" y="64" width="8" height="30" fill="#1d4ed8" opacity="0.35" />
        <rect x="162" y="64" width="8" height="30" fill="#1d4ed8" opacity="0.35" />
        <rect x="190" y="64" width="8" height="30" fill="#1d4ed8" opacity="0.35" />
        {/* Sign */}
        <rect x="90" y="48" width="120" height="22" rx="4" fill="#1e40af" />
        <text x="150" y="63" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold" letterSpacing="1">GSTBLIZ</text>
        {/* Window */}
        <rect x="82" y="92" width="136" height="58" rx="4" fill="#eff6ff" />
        {/* Chart in window */}
        <rect x="96" y="128" width="14" height="20" rx="2" fill="#bfdbfe" />
        <rect x="116" y="116" width="14" height="32" rx="2" fill="#3b82f6" />
        <rect x="136" y="122" width="14" height="26" rx="2" fill="#bfdbfe" />
        <rect x="156" y="110" width="14" height="38" rx="2" fill="#2563eb" />
        <rect x="176" y="118" width="14" height="30" rx="2" fill="#93c5fd" />
        {/* Door */}
        <rect x="128" y="154" width="44" height="46" rx="4" fill="#bfdbfe" />
        <circle cx="165" cy="178" r="3" fill="#2563eb" />
        {/* Ground */}
        <rect x="58" y="200" width="184" height="8" rx="2" fill="#e2e8f0" />
        {/* Check badge */}
        <circle cx="220" cy="82" r="20" fill="#10b981" />
        <path d="M212 82 L218 88 L229 71" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Rupee badge */}
        <circle cx="72" cy="185" r="15" fill="#fef9c3" stroke="#fbbf24" strokeWidth="1.5" />
        <text x="72" y="190" textAnchor="middle" fontSize="12" fill="#d97706" fontWeight="bold">₹</text>
        <text x="244" y="148" fontSize="22" fill="#2563eb" opacity="0.35" fontWeight="bold">+</text>
        <text x="38" y="80" fontSize="17" fill="#2563eb" opacity="0.3" fontWeight="bold">+</text>
    </svg>
);

const RegisterShop = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        shopName: '',
        shopAddress: '',
        shopMobile: '',
        gstNumber: '',
        businessType: ''
    });

    const onChangeHandler = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error('Please enter a valid email address.');
            return;
        }
        if (data.shopMobile.length !== 10 || !data.shopMobile.match(/^\d+$/)) {
            toast.error('Mobile number must be exactly 10 digits.');
            return;
        }
        if (data.password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            const response = await registerShop(data);
            if (response.status === 200 || response.status === 201) {
                toast.success('Registration successful! Under review.');
                navigate('/pending-approval');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Registration failed. Email might already exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <AuthBackground />
            <div className="auth-card" style={{ maxWidth: '960px' }}>

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
                        <h2 className="auth-title">Register New Shop</h2>

                        <form onSubmit={onSubmitHandler}>
                            {/* Row 1 */}
                            <div className="auth-grid-2">
                                <div>
                                    <label className="auth-label">Owner Name *</label>
                                    <input type="text" name="name" className="auth-input" placeholder="Full name" onChange={onChangeHandler} value={data.name} required />
                                </div>
                                <div>
                                    <label className="auth-label">Email Address *</label>
                                    <input type="email" name="email" className="auth-input" placeholder="you@example.com" onChange={onChangeHandler} value={data.email} required />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="auth-grid-2">
                                <div>
                                    <label className="auth-label">Shop Name *</label>
                                    <input type="text" name="shopName" className="auth-input" placeholder="Your shop name" onChange={onChangeHandler} value={data.shopName} required />
                                </div>
                                <div>
                                    <label className="auth-label">Mobile Number *</label>
                                    <input type="text" name="shopMobile" className="auth-input" placeholder="10-digit number" onChange={onChangeHandler} value={data.shopMobile} required />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="auth-grid-2">
                                <div>
                                    <label className="auth-label">Business Type *</label>
                                    <select name="businessType" className="auth-input auth-select" onChange={onChangeHandler} value={data.businessType} required>
                                        <option value="">Select type</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Wholesale">Wholesale</option>
                                        <option value="Supermarket">Supermarket</option>
                                        <option value="Restaurant">Restaurant</option>
                                        <option value="Pharmacy">Pharmacy</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="auth-label">GST Number <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                                    <input type="text" name="gstNumber" className="auth-input" placeholder="GSTIN" onChange={onChangeHandler} value={data.gstNumber} />
                                </div>
                            </div>

                            {/* Shop Address */}
                            <div className="auth-field">
                                <label className="auth-label">Shop Address *</label>
                                <textarea name="shopAddress" className="auth-input" placeholder="Full shop address" rows="2" onChange={onChangeHandler} value={data.shopAddress} required></textarea>
                            </div>

                            {/* Password */}
                            <div className="auth-field">
                                <label className="auth-label">Password *</label>
                                <div className="auth-input-wrap">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="auth-input"
                                        placeholder="Min 6 characters"
                                        onChange={onChangeHandler}
                                        value={data.password}
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
                                    : 'Register Shop'
                                }
                            </button>
                        </form>

                        <p className="auth-bottom-text">
                            Already have an account?{' '}
                            <span className="auth-link" onClick={() => navigate('/login')}>Sign In</span>
                        </p>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="auth-right">
                    <ShopIllustration />
                    <h3 className="auth-right-title">List Your Business Online</h3>
                    <p className="auth-right-text">
                        Register today to experience seamless billing, inventory tracking, GST compliance, and real-time sales reporting for your shop.
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

export default RegisterShop;
