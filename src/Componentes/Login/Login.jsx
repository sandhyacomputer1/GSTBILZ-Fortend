import React, { useState } from 'react'
import './Login.css';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { login, loginGoogle } from '../../Service/AuthService';
import FinanceParticles from '../FinanceParticles/FinanceParticles';


const Login = () => {

    const {setAuthData, headerName} = React.useContext(AppContext);
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [data, setData] = useState({
        email: '',
        password: ''
    });

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
                client_id: '1020739958744-example.apps.googleusercontent.com',
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
                localStorage.setItem("role", result.data.role);
                setAuthData(result.data.token, result.data.role);
                navigate('/dashboard');
            }
        } catch (errr) {
            console.log(errr);
            const msg = errr.response?.data?.message || '';
            if (msg.toLowerCase().includes('pending approval')) {
                navigate('/pending-approval');
            } else if (msg.toLowerCase().includes('rejected')) {
                navigate('/account-rejected');
            } else if (msg.toLowerCase().includes('disabled')) {
                navigate('/account-disabled');
            } else {
                toast.error(msg || 'Google Sign-In failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const onChangeHandler = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        setData({ ...data, [name]: value });
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);


        try{
            const response = await login(data);
            if(response.status === 200){
                toast.success('Login successful');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem("role", response.data.role);
                setAuthData(response.data.token, response.data.role);
                navigate('/dashboard');
            }

        } catch(errr){
            console.log(errr);
            const msg = errr.response?.data?.message || '';
            if (msg.toLowerCase().includes('pending approval')) {
                navigate('/pending-approval');
            } else if (msg.toLowerCase().includes('rejected')) {
                navigate('/account-rejected');
            } else if (msg.toLowerCase().includes('disabled')) {
                navigate('/account-disabled');
            } else {
                toast.error(msg || 'Email or password is incorrect');
            }
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="login-split-wrapper d-flex flex-column flex-md-row min-vh-100">
      
      {/* LEFT COLUMN: Clean Form Area */}
      <div className="login-left-pane col-12 col-md-6 d-flex flex-column justify-content-between p-4 p-lg-5">
        
        {/* Top Company Branding */}
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

        {/* Centered Login Card */}
        <div className="my-auto d-flex justify-content-center w-100">
          <div className="login-card-clean shadow-lg rounded-4 p-4 p-sm-5 w-100" style={{ maxWidth: '440px' }}>
            
            {/* Project / Client Brand Emblem */}
            <div className="d-flex align-items-center mb-4">
              <div className="client-emblem-box d-flex align-items-center justify-content-center me-3 shadow-sm">
                <i className="bi bi-receipt-cutoff text-primary fs-4"></i>
              </div>
              <div className="client-brand-details">
                <h5 className="client-name fw-bold mb-0">{headerName}</h5>
                <span className="client-type text-lite">GST Billing & Inventory System</span>
              </div>
            </div>

            <h3 className="fw-bold mb-4 sign-in-title">Sign in to your account</h3>

            <form onSubmit={onSubmitHandler}>
              {/* Email/Identity Input */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label text-info fw-semibold fs-7 mb-2">Email Address</label>
                <div className="input-with-icon-wrapper">
                  <i className="bi bi-envelope icon-left"></i>
                  <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    className="form-control login-input-clean" 
                    placeholder="Enter your email address"
                    onChange={onChangeHandler} 
                    value={data.email} 
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label htmlFor="password" className="form-label text-info fw-semibold fs-7 mb-0">Password</label>
                </div>
                <div className="input-with-icon-wrapper">
                  <i className="bi bi-lock icon-left"></i>
                  <input 
                    type="password" 
                    name="password" 
                    id="password" 
                    className="form-control login-input-clean" 
                    placeholder="Enter your password"
                    onChange={onChangeHandler} 
                    value={data.password} 
                    required
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-primary login-btn-clean py-2.5 fw-bold" disabled={loading}>
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>

              {/* Google Sign-in & Register Shop Owner */}
              <div className="mt-4 text-center">
                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1" />
                  <span className="mx-2 text-muted fs-7">or</span>
                  <hr className="flex-grow-1" />
                </div>
                
                <div id="googleSignInBtn" className="mb-3 d-flex justify-content-center"></div>

                <div className="mt-3">
                  <span className="text-muted fs-7">Want to list your shop? </span>
                  <span className="text-primary fw-bold fs-7" onClick={() => navigate('/register-shop')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                    Register New Shop
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-primary fw-semibold fs-7" onClick={() => navigate('/forgot-password')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                    Forgot Password?
                  </span>
                </div>
              </div>
            </form>

          </div>
        </div>

        {/* Footer spacing */}
        <div className="text-white fs-7 text-center text-md-start mt-4">
          &copy; {new Date().getFullYear()} Sandhya Soft Technologies. All Rights Reserved.
        </div>

      </div>

      {/* RIGHT COLUMN: Info Area */}
      <div className="login-right-pane col-12 col-md-6 d-flex flex-column justify-content-between align-items-center p-4 p-lg-5 text-white position-relative text-center">
        
        {/* Dynamic canvas backdrop, constrained to this pane */}
        <FinanceParticles opacityMultiplier={0.6} speedMultiplier={0.7} />

        <div className="w-100 my-auto d-flex flex-column align-items-center position-relative z-3">
          
          <span className="text-uppercase tracking-widest text-light-50 fs-8 mb-2">Powered By</span>
          
          {/* Custom White Lightning S-Logo */}
          <div className="mb-4 text-white">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '80px', height: '80px' }}>
              <path d="M38 4L14 36H28L20 60L50 24H34L38 4Z" fill="currentColor" />
            </svg>
          </div>

          <h3 className="fw-bold mb-1 brand-name-white text-info">Sandhya Soft Technologies</h3>
          <span className="brand-subtitle-white text-uppercase tracking-wider text-light-50 fs-7">{headerName}</span>

          <div className="divider-line my-4"></div>

          <h2 className="fw-bold mb-3 landing-main-heading text-info">Built for Every Business.</h2>
          <p className="landing-sub-text mx-auto" style={{ maxWidth: '480px' }}>
            Secure, reliable, and scalable digital platform for GST invoicing, return preparation, real-time sales reporting, stock inventory, and ledger audits.
          </p>

        </div>

        {/* Support & Contact Details */}
        <div className="w-100 position-relative z-3 mt-4">
          <span className="text-uppercase tracking-wider text-light-50 fs-8 d-block mb-3">Support</span>
          <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3">
            <a href="tel:9689974617" className="support-capsule-btn text-decoration-none">
              <i className="bi bi-telephone-fill me-2"></i>
              9689974617
            </a>
            <a href="https://sandhyasofttech.com" target="_blank" rel="noopener noreferrer" className="support-capsule-btn text-decoration-none">
              <i className="bi bi-globe me-2"></i>
              sandhyasofttech.com
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Login