import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
} from '../../Service/NotificationService';
import './NotificationBell.css';

const typeIcon = (type) => {
    if (!type) return 'bi-bell';
    if (type.includes('EXPIRED'))  return 'bi-x-circle-fill';
    if (type.includes('EXPIRING')) return 'bi-alarm-fill';
    return 'bi-bell-fill';
};

const typeColor = (type) => {
    if (!type) return '#6366f1';
    if (type.includes('EXPIRED'))  return '#f43f5e';
    if (type.includes('EXPIRING')) return '#f59e0b';
    return '#6366f1';
};

const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)   return 'just now';
    if (m < 60)  return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const NotificationBell = () => {
    const { unreadNotifCount, setUnreadNotifCount, refreshUnreadCount } = useContext(AppContext);
    const [open, setOpen]   = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await getMyNotifications();
            setNotifications(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const handleOpen = () => {
        if (!open) loadNotifications();
        setOpen(o => !o);
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            refreshUnreadCount();
        } catch { /* silent */ }
    };

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadNotifCount(0);
        } catch { /* silent */ }
    };

    // Close panel when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="notif-bell-wrapper" ref={panelRef}>
            <button className="notif-bell-btn" onClick={handleOpen} title="Notifications">
                <i className="bi bi-bell-fill"></i>
                {unreadNotifCount > 0 && (
                    <span className="notif-badge">{unreadNotifCount > 99 ? '99+' : unreadNotifCount}</span>
                )}
            </button>

            {open && (
                <div className="notif-panel glass-panel">
                    <div className="notif-panel-header">
                        <span className="notif-panel-title">Notifications</span>
                        {unreadNotifCount > 0 && (
                            <button className="notif-mark-all" onClick={handleMarkAll}>Mark all read</button>
                        )}
                    </div>

                    <div className="notif-list">
                        {loading && (
                            <div className="notif-empty">
                                <div className="spinner-border spinner-border-sm text-primary"></div>
                            </div>
                        )}
                        {!loading && notifications.length === 0 && (
                            <div className="notif-empty">
                                <i className="bi bi-bell-slash fs-2 text-secondary"></i>
                                <p>No notifications yet</p>
                            </div>
                        )}
                        {!loading && notifications.map(n => (
                            <div
                                key={n.id}
                                className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                                onClick={() => !n.isRead && handleMarkRead(n.id)}
                            >
                                <div className="notif-item-icon" style={{ color: typeColor(n.notificationType) }}>
                                    <i className={`bi ${typeIcon(n.notificationType)}`}></i>
                                </div>
                                <div className="notif-item-body">
                                    <p className="notif-item-title">{n.title}</p>
                                    <p className="notif-item-msg">{n.message}</p>
                                    <span className="notif-item-time">{timeAgo(n.createdAt)}</span>
                                </div>
                                {!n.isRead && <span className="notif-unread-dot"></span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
