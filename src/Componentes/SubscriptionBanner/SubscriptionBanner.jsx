import React, { useEffect, useState } from 'react';
import { getAdminContact } from '../../Service/NotificationService';
import { requestSubscriptionRenewal } from '../../Service/SubscriptionService';
import toast from 'react-hot-toast';
import './SubscriptionBanner.css';

const SubscriptionBanner = ({ subscriptionInfo }) => {
    const [adminContact, setAdminContact] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        getAdminContact()
            .then(r => setAdminContact(r.data))
            .catch(() => {});
    }, []);

    const handleSendRenewalRequest = async () => {
        setRequesting(true);
        const toastId = toast.loading("Sending subscription renewal request to Super Admin...");
        try {
            await requestSubscriptionRenewal();
            toast.success("Renewal request sent successfully! Super Admin has been notified.", { id: toastId });
        } catch (error) {
            console.error("Failed to send renewal request:", error);
            toast.error(error.response?.data?.message || "Failed to send renewal request.", { id: toastId });
        } finally {
            setRequesting(false);
        }
    };

    if (!subscriptionInfo) return null;

    const isExpired  = subscriptionInfo.isExpired;
    const isTrial    = subscriptionInfo.isTrial;
    const remaining  = subscriptionInfo.remainingDays;
    const expiring   = !isExpired && remaining <= 7;

    // Only show when expired OR expiring within 7 days
    if (!isExpired && !expiring) return null;

    const planLabel = isTrial ? '7-Day Free Trial' : (subscriptionInfo.planName || 'Subscription');

    // ── Expired banner ──────────────────────────────────────────────────────
    if (isExpired) {
        return (
            <div className="sub-banner expired">
                <div className="sub-banner-left">
                    <i className="bi bi-exclamation-triangle-fill sub-banner-icon"></i>
                    <div>
                        <p className="sub-banner-title">
                            {isTrial ? 'Free Trial Expired' : 'Subscription Expired'}
                        </p>
                        <p className="sub-banner-msg">
                            Your {planLabel} has expired. Billing operations are disabled.
                            Please request renewal or contact the Super Admin.
                        </p>
                    </div>
                </div>
                <div className="sub-banner-right d-flex gap-2">
                    <button 
                        className="sub-banner-contact-btn" 
                        onClick={handleSendRenewalRequest}
                        disabled={requesting}
                        style={{ backgroundColor: '#e11d48', color: 'white', borderColor: '#e11d48' }}
                    >
                        <i className="bi bi-envelope-fill me-1"></i>
                        {requesting ? 'Sending...' : 'Request Renewal'}
                    </button>
                    <button className="sub-banner-contact-btn" onClick={() => setExpanded(e => !e)}>
                        <i className="bi bi-person-lines-fill me-1"></i>
                        Contact Info
                        <i className={`bi bi-chevron-${expanded ? 'up' : 'down'} ms-1`}></i>
                    </button>
                </div>

                {expanded && adminContact && (
                    <div className="sub-banner-contact-panel">
                        <p className="sub-banner-contact-label">Get in touch with Super Admin:</p>
                        <div className="sub-banner-contact-actions">
                            {adminContact.email && (
                                <a
                                    href={`mailto:${adminContact.email}?subject=Subscription Renewal Request`}
                                    className="sub-contact-btn email"
                                >
                                    <i className="bi bi-envelope-fill"></i>
                                    Email: {adminContact.email}
                                </a>
                            )}
                            {adminContact.whatsapp && (
                                <a
                                    href={`https://wa.me/${adminContact.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="sub-contact-btn whatsapp"
                                >
                                    <i className="bi bi-whatsapp"></i>
                                    WhatsApp
                                </a>
                            )}
                            {adminContact.phone && (
                                <a href={`tel:${adminContact.phone}`} className="sub-contact-btn phone">
                                    <i className="bi bi-telephone-fill"></i>
                                    {adminContact.phone}
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Expiring-soon warning ────────────────────────────────────────────────
    const dayWord = remaining === 0
        ? 'today'
        : remaining === 1
        ? 'tomorrow'
        : `in ${remaining} days`;

    return (
        <div className="sub-banner warning">
            <i className="bi bi-alarm-fill sub-banner-icon"></i>
            <div>
                <p className="sub-banner-title">
                    {isTrial ? 'Trial Expiring Soon' : 'Subscription Expiring Soon'}
                </p>
                <p className="sub-banner-msg">
                    Your {planLabel} expires <strong>{dayWord}</strong> on{' '}
                    {subscriptionInfo.expiryDate
                        ? new Date(subscriptionInfo.expiryDate).toLocaleDateString('en-IN')
                        : '—'}.
                    Request a renewal before billing features are disabled.
                </p>
            </div>
            <button 
                className="sub-banner-contact-btn ms-auto" 
                onClick={handleSendRenewalRequest}
                disabled={requesting}
                style={{ backgroundColor: '#d97706', color: 'white', borderColor: '#d97706' }}
            >
                <i className="bi bi-envelope-fill me-1"></i>
                {requesting ? 'Sending...' : 'Request Renewal'}
            </button>
        </div>
    );
};

export default SubscriptionBanner;

