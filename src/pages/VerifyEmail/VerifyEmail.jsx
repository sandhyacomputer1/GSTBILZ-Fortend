import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../Service/api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('Verifying your email...');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus("Invalid link. No token found.");
            setError(true);
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/verify-email?token=${token}`);
                setStatus(response.data);
                setError(false);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                setStatus(err.response?.data?.message || "Verification failed. The link might be expired or invalid.");
                setError(true);
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-sm p-4 text-center" style={{ maxWidth: '400px' }}>
                {!error ? (
                    <div className="text-success mb-3">
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
                    </div>
                ) : (
                    <div className="text-danger mb-3">
                        <i className="bi bi-x-circle-fill" style={{ fontSize: '3rem' }}></i>
                    </div>
                )}
                <h4>Email Verification</h4>
                <p className={`mt-3 ${error ? 'text-danger' : 'text-success'}`}>{status}</p>
                {!error && <small className="text-muted">Redirecting to login...</small>}
                {error && (
                    <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>
                        Go to Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
