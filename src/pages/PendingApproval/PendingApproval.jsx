import React from 'react';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
    const navigate = useNavigate();
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-5 text-center rounded-4" style={{ maxWidth: '500px', border: 'none' }}>
                <div className="text-warning mb-4">
                    <i className="bi bi-clock-history" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="fw-bold mb-3">Registration Pending</h3>
                <p className="text-muted mb-4 fs-6">
                    Thank you for registering your shop! Your account request is currently under review by our Super Admin. 
                    We will send you an email notification as soon as your account status is updated.
                </p>
                <button className="btn btn-primary px-4 py-2.5 fw-bold" onClick={() => navigate('/login')}>
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default PendingApproval;
