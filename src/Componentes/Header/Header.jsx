import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import './Header.css';

const Header = ({ onToggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData, shopProfile, theme, toggleTheme } = useContext(AppContext);

  const logout = (e) => {
    if (e) e.preventDefault();
    setAuthData(null, null);
    setDropdownOpen(false);
    navigate("/login");
  };

  const handleDropdownClick = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/explore') return 'Explore';
    if (path === '/manage-items') return 'Manage Items';
    if (path === '/manage-categories') return 'Manage Categories';
    if (path === '/import-history') return 'Import History';
    if (path === '/manage-users') return 'Manage Shop Owners';
    if (path === '/manage-employees') return 'Manage Employees';
    if (path === '/manage-orders') return 'Order History';
    if (path === '/settings') return 'Settings';
    return '';
  };

  return (
    <header className="header-container d-flex align-items-center justify-content-between px-4">
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn btn-link text-white p-0 border-0 d-lg-none" 
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
        >
          <i className="bi bi-list fs-3"></i>
        </button>
        <h5 className="mb-0 fw-bold text-white text-gradient-indigo text-uppercase tracking-wider">
          {getPageTitle()}
        </h5>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          className="btn btn-link p-0 border-0 theme-toggle-btn d-flex align-items-center justify-content-center"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{ textDecoration: 'none', background: 'transparent' }}
        >
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-primary'} fs-4`}></i>
        </button>

        <div className="dropdown" ref={dropdownRef}>
        <button 
          className="btn btn-link nav-link dropdown-toggle p-0 border-0" 
          type="button"
          onClick={handleDropdownClick}
          aria-expanded={dropdownOpen}
        >
          <img 
            src={shopProfile?.profilePhotoUrl || assets.profile || 'https://placehold.co/150x150/202c33/ffffff/png?text=User'} 
            alt="Profile" 
            height={32} 
            width={32} 
            className="rounded-circle border border-secondary"
            style={{ objectFit: 'cover' }}
          />
        </button>
        <ul className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? 'show' : ''}`} style={{ display: dropdownOpen ? 'block' : 'none', position: 'absolute', right: 0 }}>
          <li>
            <Link to="/settings" className="dropdown-item" onClick={closeDropdown}>
              Settings
            </Link>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <a href="#" className="dropdown-item text-danger" onClick={logout}>
              Logout
            </a>
          </li>
        </ul>
      </div>
      </div>
    </header>
  );
};

export default Header;
