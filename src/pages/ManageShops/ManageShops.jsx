import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchShopOwners, approveShop, rejectShop, toggleDisableShop, toggleWhatsAppCapability } from '../../Service/SuperAdminService';
import { deleteUser, updateUser } from '../../Service/UserService';
import './ManageShops.css';

const ManageShops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');

    const loadShops = async () => {
        setLoading(true);
        try {
            const response = await fetchShopOwners();
            setShops(response.data);
        } catch (error) {
            console.error('Error fetching shops:', error);
            toast.error('Failed to load shop registrations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadShops();
    }, []);

    const handleApprove = async (userId) => {
        try {
            await approveShop(userId);
            toast.success('Shop owner approved successfully.');
            loadShops();
        } catch (error) {
            toast.error('Approval failed.');
        }
    };

    const handleReject = async (userId) => {
        try {
            await rejectShop(userId);
            toast.success('Shop owner registration rejected.');
            loadShops();
        } catch (error) {
            toast.error('Rejection failed.');
        }
    };

    const handleToggleDisable = async (userId) => {
        try {
            await toggleDisableShop(userId);
            toast.success('Shop status updated.');
            loadShops();
        } catch (error) {
            toast.error('Action failed.');
        }
    };

    const handleToggleWhatsApp = async (userId) => {
        try {
            await toggleWhatsAppCapability(userId);
            toast.success('WhatsApp capability updated.');
            loadShops();
        } catch (error) {
            toast.error('Action failed.');
        }
    };

    const handleDelete = async (shop) => {
        const emailConfirm = window.prompt(`To delete the shop "${shop.shopName || 'this shop'}", please enter the owner's email address (${shop.email}) to confirm:`);
        if (emailConfirm === null) return;
        
        if (emailConfirm.trim() === shop.email) {
            try {
                await deleteUser(shop.userId);
                toast.success('Shop owner deleted successfully.');
                loadShops();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete shop owner.');
            }
        } else {
            toast.error('Email verification failed. Deletion aborted.');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'APPROVED': return 'badge bg-success';
            case 'PENDING': return 'badge bg-warning text-dark';
            case 'REJECTED': return 'badge bg-danger';
            case 'DISABLED': return 'badge bg-secondary';
            default: return 'badge bg-info';
        }
    };

    return (
        <div className="manage-shops-container p-4">
            <div className="glass-panel p-4 rounded-4 shadow-lg">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                        <h2 className="fw-bold mb-1 text-info">Shop Owner Registrations</h2>
                        <p className="text-secondary mb-0">Approve, reject, or manage status of shop owners registered on the billing platform.</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="btn-group" role="group" aria-label="View Mode">
                            <button 
                                type="button" 
                                className={`btn btn-sm d-flex align-items-center gap-1 ${viewMode === 'list' ? 'btn-info' : 'btn-outline-info'}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <i className="bi bi-list-ul"></i>
                                <span className="d-none d-sm-inline">List</span>
                            </button>
                            <button 
                                type="button" 
                                className={`btn btn-sm d-flex align-items-center gap-1 ${viewMode === 'grid' ? 'btn-info' : 'btn-outline-info'}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <i className="bi bi-grid-3x3-gap-fill"></i>
                                <span className="d-none d-sm-inline">Grid</span>
                            </button>
                        </div>
                        <button className="btn btn-outline-info btn-sm" onClick={loadShops}>
                            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-info" role="status"></div>
                        <p className="mt-2 text-secondary">Loading registrations...</p>
                    </div>
                ) : shops.length === 0 ? (
                    <div className="text-center py-5 text-secondary">
                        <i className="bi bi-building fs-1 d-block mb-3 text-secondary"></i>
                        No registered shop owners found.
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle custom-table">
                            <thead>
                                <tr>
                                    <th>Shop Name</th>
                                    <th>Owner</th>
                                    <th>Email / Mobile</th>
                                    <th>Business</th>
                                    <th>Address</th>
                                    <th>GST Number</th>
                                    <th>Status</th>
                                    <th>WhatsApp</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shops.map((shop) => {
                                    const status = shop.accountStatus || 'PENDING';
                                    return (
                                        <tr key={shop.userId}>
                                            <td>
                                                <div className="fw-bold text-gradient-indigo">{shop.shopName || 'N/A'}</div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <img 
                                                        src={shop.profilePhotoUrl || 'https://placehold.co/150x150/202c33/ffffff/png?text=' + (shop.name ? encodeURIComponent(shop.name.charAt(0)) : 'U')} 
                                                        alt="Owner" 
                                                        className="rounded-circle"
                                                        style={{ width: '32px', height: '32px', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                                                    />
                                                    <span className="fw-semibold">{shop.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div>{shop.email}</div>
                                                <small className="text-secondary">{shop.shopMobile || 'N/A'}</small>
                                            </td>
                                            <td><span className="badge bg-secondary">{shop.businessType || 'N/A'}</span></td>
                                            <td>
                                                <span style={{ fontSize: '0.9rem' }}>{shop.shopAddress || 'N/A'}</span>
                                            </td>
                                            <td><code>{shop.gstNumber || 'N/A'}</code></td>
                                            <td>
                                                <span className={getStatusBadgeClass(status)}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm fw-semibold d-flex align-items-center gap-1 ${shop.whatsappEnabled ? 'btn-success' : 'btn-outline-secondary'}`}
                                                    onClick={() => handleToggleWhatsApp(shop.userId)}
                                                >
                                                    <i className="bi bi-whatsapp"></i>
                                                    {shop.whatsappEnabled ? 'Enabled' : 'Disabled'}
                                                </button>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    {status === 'PENDING' && (
                                                        <>
                                                            <button className="btn btn-success btn-sm px-3 fw-semibold" onClick={() => handleApprove(shop.userId)}>
                                                                Approve
                                                            </button>
                                                            <button className="btn btn-danger btn-sm px-3 fw-semibold" onClick={() => handleReject(shop.userId)}>
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {(status === 'APPROVED' || status === 'DISABLED') && (
                                                        <button 
                                                            className={`btn btn-sm px-3 fw-semibold ${status === 'DISABLED' ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                                                            onClick={() => handleToggleDisable(shop.userId)}
                                                        >
                                                            {status === 'DISABLED' ? 'Enable' : 'Disable'}
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="btn btn-danger btn-sm px-3 fw-semibold"
                                                        onClick={() => handleDelete(shop)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="shop-grid">
                        {shops.map((shop) => {
                            const status = shop.accountStatus || 'PENDING';
                            return (
                                <div className="shop-card glass-panel" key={shop.userId}>
                                    <div className="shop-card-header">
                                        <div className="d-flex align-items-center gap-3 min-width-0">
                                            <img 
                                                src={shop.profilePhotoUrl || 'https://placehold.co/150x150/202c33/ffffff/png?text=' + (shop.name ? encodeURIComponent(shop.name.charAt(0)) : 'U')} 
                                                alt="Owner" 
                                                className="rounded-circle"
                                                style={{ width: '44px', height: '44px', objectFit: 'cover', border: '2px solid var(--border-glass)', flexShrink: 0 }}
                                            />
                                            <div className="shop-name-wrap">
                                                <h4 className="shop-name-title text-gradient-indigo mb-1">{shop.shopName || 'N/A'}</h4>
                                                <div>
                                                    <span className="badge bg-secondary" style={{ fontSize: '10.5px' }}>{shop.businessType || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`status-badge-grid ${getStatusBadgeClass(status)}`}>
                                            {status}
                                        </span>
                                    </div>
                                    
                                    <div className="shop-card-body">
                                        <div className="info-item">
                                            <i className="bi bi-person info-icon"></i>
                                            <div>
                                                <span className="info-label">Owner</span>
                                                <span className="info-value">{shop.name || 'N/A'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="info-item">
                                            <i className="bi bi-envelope info-icon"></i>
                                            <div>
                                                <span className="info-label">Email</span>
                                                <span className="info-value text-break">{shop.email}</span>
                                            </div>
                                        </div>

                                        <div className="info-item">
                                            <i className="bi bi-phone info-icon"></i>
                                            <div>
                                                <span className="info-label">Mobile</span>
                                                <span className="info-value">{shop.shopMobile || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="info-item">
                                            <i className="bi bi-geo-alt info-icon"></i>
                                            <div>
                                                <span className="info-label">Address</span>
                                                <span className="info-value">{shop.shopAddress || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="info-item">
                                            <i className="bi bi-file-earmark-text info-icon"></i>
                                            <div>
                                                <span className="info-label">GST Number</span>
                                                <span className="info-value"><code>{shop.gstNumber || 'N/A'}</code></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shop-card-footer">
                                        <div className="d-flex flex-column gap-3 w-100">
                                            <button
                                                className={`btn btn-sm fw-semibold d-flex align-items-center justify-content-center gap-1 w-100 ${shop.whatsappEnabled ? 'btn-success' : 'btn-outline-secondary'}`}
                                                onClick={() => handleToggleWhatsApp(shop.userId)}
                                            >
                                                <i className="bi bi-whatsapp"></i>
                                                WhatsApp: {shop.whatsappEnabled ? 'Enabled' : 'Disabled'}
                                            </button>
                                            
                                            <div className="d-flex justify-content-between align-items-center gap-2">
                                                <div className="d-flex gap-2">
                                                    {status === 'PENDING' && (
                                                        <>
                                                            <button className="btn btn-success btn-sm px-3 fw-semibold" onClick={() => handleApprove(shop.userId)}>
                                                                Approve
                                                            </button>
                                                            <button className="btn btn-danger btn-sm px-3 fw-semibold" onClick={() => handleReject(shop.userId)}>
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {(status === 'APPROVED' || status === 'DISABLED') && (
                                                        <button 
                                                            className={`btn btn-sm px-3 fw-semibold ${status === 'DISABLED' ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                                                            onClick={() => handleToggleDisable(shop.userId)}
                                                        >
                                                            {status === 'DISABLED' ? 'Enable' : 'Disable'}
                                                        </button>
                                                    )}
                                                </div>
                                                <button 
                                                    className="btn btn-danger btn-sm px-3 fw-semibold"
                                                    onClick={() => handleDelete(shop)}
                                                    title="Delete Shop Owner"
                                                >
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageShops;
