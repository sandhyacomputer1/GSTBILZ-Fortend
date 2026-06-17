import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { auth, headerName } = useContext(AppContext);

  const isSuperAdmin = auth.role === "ROLE_SUPERADMIN";
  const isShopOwner = auth.role === "ROLE_SHOPOWNER";
  const isEmployee = auth.role === "ROLE_EMPLOYEE";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="position-fixed top-0 start-0 end-0 bottom-0 d-lg-none" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 998 }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar-container ${isOpen ? 'mobile-open' : ''}`}>
        {/* Brand/Header */}
        <div className="sidebar-brand">
          <NavLink className="sidebar-brand-link" to="/dashboard" onClick={onClose}>
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '24px', marginRight: '10px' }}>
              <path d="M38 4L14 36H28L20 60L50 24H34L38 4Z" fill="url(#sidebarOrangeGrad)" />
              <defs>
                <linearGradient id="sidebarOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6c00" />
                  <stop offset="100%" stopColor="#ff3d00" />
                </linearGradient>
              </defs>
            </svg>
            <span className="brand-name">{headerName}</span>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-links">
          {(isSuperAdmin || isShopOwner) && (
            <NavLink 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
              to="/dashboard"
              onClick={onClose}
            >
              <i className="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </NavLink>
          )}

          {(isShopOwner || isEmployee) && (
            <NavLink 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
              to="/explore"
              onClick={onClose}
            >
              <i className="bi bi-compass"></i>
              <span>Explore</span>
            </NavLink>
          )}

          {isShopOwner && (
            <>
              <NavLink 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
                to="/manage-items"
                onClick={onClose}
              >
                <i className="bi bi-box-seam"></i>
                <span>Manage Items</span>
              </NavLink>

              <NavLink 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
                to="/manage-categories"
                onClick={onClose}
              >
                <i className="bi bi-tags"></i>
                <span>Manage Categories</span>
              </NavLink>

              <NavLink 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
                to="/import-history"
                onClick={onClose}
              >
                <i className="bi bi-clock-history"></i>
                <span>Import History</span>
              </NavLink>

              <NavLink 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
                to="/manage-employees"
                onClick={onClose}
              >
                <i className="bi bi-people"></i>
                <span>Manage Employees</span>
              </NavLink>
            </>
          )}

          {isSuperAdmin && (
            <>
              <NavLink
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                to="/manage-shops"
                onClick={onClose}
              >
                <i className="bi bi-building"></i>
                <span>Manage Shops</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                to="/subscription-management"
                onClick={onClose}
              >
                <i className="bi bi-journal-bookmark-fill"></i>
                <span>Subscriptions</span>
              </NavLink>
            </>
          )}

          {(isShopOwner || isEmployee) && (
            <>
              <NavLink 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
                to="/manage-orders"
                onClick={onClose}
              >
                <i className="bi bi-receipt"></i>
                <span>Order History</span>
              </NavLink>

              <NavLink 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
                to="/reports"
                onClick={onClose}
              >
                <i className="bi bi-bar-chart-line"></i>
                <span>Reports</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
