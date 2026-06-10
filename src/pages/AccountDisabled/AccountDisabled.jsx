import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccountDisabled = () => {
    const navigate = useNavigate();
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-5 text-center rounded-4" style={{ maxWidth: '500px', border: 'none' }}>
                <div className="text-danger mb-4">
                    <i className="bi bi-slash-circle" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="fw-bold mb-3 text-danger">Account Disabled</h3>
                <p className="text-muted mb-4 fs-6">
                    Your shop owner account has been disabled. This may be due to policy violations, billing issues, or administrative request. 
                    Please contact our support team to reactivate your account.
                </p>
                <button className="btn btn-primary px-4 py-2.5 fw-bold" onClick={() => navigate('/login')}>
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default AccountDisabled;
