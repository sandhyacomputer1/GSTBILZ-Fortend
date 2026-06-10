import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccountRejected = () => {
    const navigate = useNavigate();
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-5 text-center rounded-4" style={{ maxWidth: '500px', border: 'none' }}>
                <div className="text-danger mb-4">
                    <i className="bi bi-x-circle-fill" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="fw-bold mb-3 text-danger">Registration Rejected</h3>
                <p className="text-muted mb-4 fs-6">
                    We regret to inform you that your shop registration request has been rejected by the Super Admin. 
                    If you believe this was a mistake or need further assistance, please contact our support desk.
                </p>
                <button className="btn btn-primary px-4 py-2.5 fw-bold" onClick={() => navigate('/login')}>
                    Return to Login
                </button>
            </div>
        </div>
    );
};

export default AccountRejected;
