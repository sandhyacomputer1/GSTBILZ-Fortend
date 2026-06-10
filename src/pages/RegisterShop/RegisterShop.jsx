import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { registerShop } from '../../Service/AuthService';
import FinanceParticles from '../../Componentes/FinanceParticles/FinanceParticles';

const RegisterShop = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        
        // Validation
        if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (data.shopMobile.length !== 10 || !data.shopMobile.match(/^\d+$/)) {
            toast.error("Mobile number must be exactly 10 digits.");
            return;
        }
        if (data.password.length < 6) {
            toast.error("Password must be at least 6 characters.");
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
        <div className="login-split-wrapper d-flex flex-column flex-md-row min-vh-100" style={{ overflowY: 'auto' }}>
            <div className="login-left-pane col-12 col-md-6 d-flex flex-column justify-content-between p-4 p-lg-5" style={{ minHeight: '100vh', overflowY: 'auto' }}>
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
                    <div className="login-card-clean shadow-lg rounded-4 p-4 p-sm-5 w-100" style={{ maxWidth: '550px', background: 'rgba(255, 255, 255, 0.95)' }}>
                        <h3 className="fw-bold mb-4 text-dark text-center">Register New Shop</h3>
                        <form onSubmit={onSubmitHandler}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-dark fw-semibold fs-7 mb-1">Owner Name *</label>
                                    <input type="text" name="name" className="form-control" placeholder="Owner Name" onChange={onChangeHandler} value={data.name} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-dark fw-semibold fs-7 mb-1">Email Address *</label>
                                    <input type="email" name="email" className="form-control" placeholder="Email" onChange={onChangeHandler} value={data.email} required />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-dark fw-semibold fs-7 mb-1">Shop Name *</label>
                                    <input type="text" name="shopName" className="form-control" placeholder="Shop Name" onChange={onChangeHandler} value={data.shopName} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-dark fw-semibold fs-7 mb-1">Mobile Number *</label>
                                    <input type="text" name="shopMobile" className="form-control" placeholder="10-digit mobile" onChange={onChangeHandler} value={data.shopMobile} required />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-dark fw-semibold fs-7 mb-1">Business Type *</label>
                                    <select name="businessType" className="form-select" onChange={onChangeHandler} value={data.businessType} required>
                                        <option value="">Select Type</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Wholesale">Wholesale</option>
                                        <option value="Supermarket">Supermarket</option>
                                        <option value="Restaurant">Restaurant</option>
                                        <option value="Pharmacy">Pharmacy</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label text-dark fw-semibold fs-7 mb-1">GST Number (Optional)</label>
                                    <input type="text" name="gstNumber" className="form-control" placeholder="GSTIN" onChange={onChangeHandler} value={data.gstNumber} />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-dark fw-semibold fs-7 mb-1">Shop Address *</label>
                                <textarea name="shopAddress" className="form-control" placeholder="Full Address" rows="2" onChange={onChangeHandler} value={data.shopAddress} required></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-dark fw-semibold fs-7 mb-1">Password *</label>
                                <input type="password" name="password" className="form-control" placeholder="Min 6 characters" onChange={onChangeHandler} value={data.password} required />
                            </div>

                            <div className="d-grid mt-4">
                                <button type="submit" className="btn btn-primary py-2.5 fw-bold" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm"></span> : "Register"}
                                </button>
                            </div>

                            <div className="mt-3 text-center">
                                <span className="text-muted fs-7">Already have an account? </span>
                                <span className="text-primary fw-bold fs-7" onClick={() => navigate('/login')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                                    Sign In
                                </span>
                            </div>
                        </form>
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
                    <h2 className="fw-bold mb-3 mt-4 text-info">List Your Business Online</h2>
                    <p className="landing-sub-text mx-auto" style={{ maxWidth: '480px' }}>
                        Register today to experience seamless multi-tenant billing, inventory tracking, GST compliance, and WhatsApp invoice dispatching.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterShop;
