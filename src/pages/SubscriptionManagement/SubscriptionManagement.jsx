import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  getAllPlans, createPlan, updatePlan, deletePlan, togglePlanStatus,
  getAllSubscriptions, assignSubscription, cancelSubscription,
  getSubscriptionStats, getPendingRenewalRequests
} from '../../Service/SubscriptionService';
import { fetchShopOwners } from '../../Service/SuperAdminService';
import './SubscriptionManagement.css';

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#6366f1'];

const EMPTY_PLAN = { planName: '', planType: 'MONTHLY', price: '', description: '' };
const EMPTY_SUB  = { shopOwnerId: '', planId: '', startDate: '', amountPaid: '', paymentStatus: 'PAID' };

const statusBadge = (status) => {
  const map = { ACTIVE: 'badge-active', EXPIRED: 'badge-expired', PENDING: 'badge-pending', INACTIVE: 'badge-inactive' };
  return <span className={`sub-badge ${map[status] || ''}`}>{status}</span>;
};

const SubscriptionManagement = () => {
  const [tab, setTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [shopOwners, setShopOwners] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState(EMPTY_PLAN);
  const [subForm, setSubForm] = useState(EMPTY_SUB);
  const [saving, setSaving] = useState(false);

  // Filters
  const [subFilter, setSubFilter] = useState('ALL');
  const [planSearch, setPlanSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // Pagination
  const [subPage, setSubPage] = useState(1);
  const PER_PAGE = 10;

  const [renewalRequests, setRenewalRequests] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes, statsRes, ownersRes, renewalRes] = await Promise.all([
        getAllPlans(),
        getAllSubscriptions(),
        getSubscriptionStats(),
        fetchShopOwners(),
        getPendingRenewalRequests()
      ]);
      setPlans(plansRes.data);
      setSubscriptions(subsRes.data);
      setStats(statsRes.data);
      setShopOwners(ownersRes.data.filter(o => o.accountStatus === 'APPROVED'));
      setRenewalRequests(renewalRes.data);
    } catch {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Plan handlers ────────────────────────────────────────────────────────
  const openCreatePlan = () => { setEditingPlan(null); setPlanForm(EMPTY_PLAN); setShowPlanModal(true); };
  const openEditPlan = (p) => { setEditingPlan(p); setPlanForm({ planName: p.planName, planType: p.planType, price: p.price, description: p.description || '' }); setShowPlanModal(true); };

  const savePlan = async (e) => {
    e.preventDefault();
    if (!planForm.planName || !planForm.price) return toast.error('Plan name and price are required');
    setSaving(true);
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, { ...planForm, price: parseFloat(planForm.price) });
        toast.success('Plan updated');
      } else {
        await createPlan({ ...planForm, price: parseFloat(planForm.price) });
        toast.success('Plan created');
      }
      setShowPlanModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await deletePlan(id);
      toast.success('Plan deleted');
      load();
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  const handleTogglePlan = async (id) => {
    try {
      await togglePlanStatus(id);
      toast.success('Plan status toggled');
      load();
    } catch {
      toast.error('Failed to toggle plan status');
    }
  };

  // ─── Subscription handlers ────────────────────────────────────────────────
  const openAssignSub = () => { setSubForm(EMPTY_SUB); setShowSubModal(true); };

  const openAssignSubForRequest = (req) => {
    setSubForm({
      shopOwnerId: req.shopOwnerId,
      planId: '',
      startDate: new Date().toISOString().split('T')[0],
      amountPaid: '',
      paymentStatus: 'PAID'
    });
    setShowSubModal(true);
  };

  const saveSubscription = async (e) => {
    e.preventDefault();
    if (!subForm.shopOwnerId || !subForm.planId) return toast.error('Shop owner and plan are required');
    setSaving(true);
    try {
      await assignSubscription({
        shopOwnerId: subForm.shopOwnerId,
        planId: parseInt(subForm.planId),
        startDate: subForm.startDate || null,
        amountPaid: subForm.amountPaid ? parseFloat(subForm.amountPaid) : null,
        paymentStatus: subForm.paymentStatus
      });
      toast.success('Subscription assigned');
      setShowSubModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSub = async (id) => {
    if (!window.confirm('Cancel this subscription?')) return;
    try {
      await cancelSubscription(id);
      toast.success('Subscription cancelled');
      load();
    } catch {
      toast.error('Failed to cancel subscription');
    }
  };

  // ─── Derived data ─────────────────────────────────────────────────────────
  const filteredPlans = plans.filter(p =>
    p.planName.toLowerCase().includes(planSearch.toLowerCase())
  );

  const filteredSubs = subscriptions.filter(s => {
    const matchStatus = subFilter === 'ALL' || s.subscriptionStatus === subFilter;
    const matchSearch = !subSearch || s.shopName?.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.shopOwnerName?.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.planName?.toLowerCase().includes(subSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const paginatedSubs = filteredSubs.slice((subPage - 1) * PER_PAGE, subPage * PER_PAGE);
  const totalSubPages = Math.ceil(filteredSubs.length / PER_PAGE);

  const pieData = stats ? [
    { name: 'Active', value: Number(stats.activeSubscriptions) || 0 },
    { name: 'Expired', value: Number(stats.expiredSubscriptions) || 0 },
    { name: 'Pending', value: Number(stats.pendingSubscriptions) || 0 },
  ] : [];

  const revenueData = stats ? [
    { name: 'Monthly Plans', Revenue: stats.monthlyRevenue || 0 },
    { name: 'Yearly Plans',  Revenue: stats.yearlyRevenue  || 0 },
  ] : [];

  if (loading) {
    return (
      <div className="sub-loading">
        <div className="spinner-border text-primary"></div>
        <span>Loading Subscription Data...</span>
      </div>
    );
  }

  return (
    <div className="sub-wrapper">
      {/* ── Header ── */}
      <div className="sub-header">
        <div>
          <h2 className="sub-title">Subscription Management</h2>
          <p className="sub-subtitle">Manage plans, assign subscriptions, and track revenue</p>
        </div>
        <div className="sub-header-actions">
          {tab === 'plans' && (
            <button className="sub-btn-primary" onClick={openCreatePlan}>
              <i className="bi bi-plus-lg me-2"></i>Create Plan
            </button>
          )}
          {tab === 'subscriptions' && (
            <button className="sub-btn-primary" onClick={openAssignSub}>
              <i className="bi bi-person-plus me-2"></i>Assign Subscription
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="sub-stats-grid">
          <div className="glass-panel sub-stat-card">
            <div className="sub-stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
              <i className="bi bi-journal-bookmark-fill"></i>
            </div>
            <div>
              <p className="sub-stat-label">Total Plans</p>
              <h3 className="sub-stat-value">{stats.totalPlans}</h3>
            </div>
          </div>
          <div className="glass-panel sub-stat-card">
            <div className="sub-stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              <i className="bi bi-patch-check-fill"></i>
            </div>
            <div>
              <p className="sub-stat-label">Active Subscriptions</p>
              <h3 className="sub-stat-value">{stats.activeSubscriptions}</h3>
            </div>
          </div>
          <div className="glass-panel sub-stat-card">
            <div className="sub-stat-icon" style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e' }}>
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <div>
              <p className="sub-stat-label">Expired Subscriptions</p>
              <h3 className="sub-stat-value">{stats.expiredSubscriptions}</h3>
            </div>
          </div>
          <div className="glass-panel sub-stat-card">
            <div className="sub-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
              <i className="bi bi-alarm-fill"></i>
            </div>
            <div>
              <p className="sub-stat-label">Expiring in 7 Days</p>
              <h3 className="sub-stat-value" style={{ color: stats.expiringWithin7Days > 0 ? '#f59e0b' : 'inherit' }}>
                {stats.expiringWithin7Days}
              </h3>
            </div>
          </div>
          <div className="glass-panel sub-stat-card">
            <div className="sub-stat-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div>
              <p className="sub-stat-label">Monthly Revenue</p>
              <h3 className="sub-stat-value">₹{(stats.monthlyRevenue || 0).toLocaleString('en-IN')}</h3>
            </div>
          </div>
          <div className="glass-panel sub-stat-card">
            <div className="sub-stat-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <div>
              <p className="sub-stat-label">Yearly Revenue</p>
              <h3 className="sub-stat-value">₹{(stats.yearlyRevenue || 0).toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </div>
      )}

      {/* ── Expiry Alert ── */}
      {stats?.expiringWithin7Days > 0 && (
        <div className="sub-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>{stats.expiringWithin7Days}</strong> subscription{stats.expiringWithin7Days > 1 ? 's are' : ' is'} expiring within 7 days.
          <button className="sub-alert-link" onClick={() => setTab('subscriptions')}>View subscriptions →</button>
        </div>
      )}


      {/* ── Tabs ── */}
      <div className="sub-tabs">
        {['plans', 'subscriptions', 'history', 'renewal-requests'].map(t => (
          <button key={t} className={`sub-tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'plans' && <i className="bi bi-journal-bookmark me-2"></i>}
            {t === 'subscriptions' && <i className="bi bi-people me-2"></i>}
            {t === 'history' && <i className="bi bi-clock-history me-2"></i>}
            {t === 'renewal-requests' && <i className="bi bi-bell-fill me-2"></i>}
            {t === 'renewal-requests' ? 'Renewal Requests' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════ PLANS TAB ══════════════════════════════ */}
      {tab === 'plans' && (
        <div className="glass-panel sub-table-card">
          <div className="sub-table-toolbar">
            <input
              className="finance-input sub-search"
              placeholder="Search plans..."
              value={planSearch}
              onChange={e => setPlanSearch(e.target.value)}
            />
          </div>
          <div className="sub-table-wrap">
            <table className="sub-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Plan Name</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.length === 0 ? (
                  <tr><td colSpan={8} className="sub-empty">No plans found. Click "Create Plan" to add one.</td></tr>
                ) : filteredPlans.map((p, i) => (
                  <tr key={p.id}>
                    <td className="sub-id">{i + 1}</td>
                    <td className="sub-name">{p.planName}</td>
                    <td>
                      <span className={`sub-type-badge ${p.planType === 'MONTHLY' ? 'monthly' : 'yearly'}`}>
                        <i className={`bi ${p.planType === 'MONTHLY' ? 'bi-calendar-month' : 'bi-calendar-check'} me-1`}></i>
                        {p.planType}
                      </span>
                    </td>
                    <td className="sub-price">₹{p.price?.toLocaleString('en-IN')}</td>
                    <td>{p.durationDays} days</td>
                    <td>{statusBadge(p.status)}</td>
                    <td className="sub-date">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <div className="sub-actions">
                        <button className="sub-act-btn edit" onClick={() => openEditPlan(p)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="sub-act-btn toggle" onClick={() => handleTogglePlan(p.id)}
                          title={p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                          <i className={`bi ${p.status === 'ACTIVE' ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                        </button>
                        <button className="sub-act-btn delete" onClick={() => handleDeletePlan(p.id)} title="Delete">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════ SUBSCRIPTIONS TAB ══════════════════════════ */}
      {tab === 'subscriptions' && (
        <div className="glass-panel sub-table-card">
          <div className="sub-table-toolbar">
            <input
              className="finance-input sub-search"
              placeholder="Search by shop / owner / plan..."
              value={subSearch}
              onChange={e => { setSubSearch(e.target.value); setSubPage(1); }}
            />
            <div className="sub-filter-btns">
              {['ALL', 'ACTIVE', 'EXPIRED', 'PENDING'].map(f => (
                <button key={f} className={`sub-filter-btn ${subFilter === f ? 'active' : ''}`}
                  onClick={() => { setSubFilter(f); setSubPage(1); }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="sub-table-wrap">
            <table className="sub-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Shop / Owner</th>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                  <th>Remaining</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubs.length === 0 ? (
                  <tr><td colSpan={9} className="sub-empty">No subscriptions found.</td></tr>
                ) : paginatedSubs.map((s, i) => (
                  <tr key={s.id}>
                    <td className="sub-id">{(subPage - 1) * PER_PAGE + i + 1}</td>
                    <td>
                      <div className="sub-shop-cell">
                        <span className="sub-shop-name">{s.shopName || '—'}</span>
                        <span className="sub-shop-email">{s.shopOwnerEmail}</span>
                      </div>
                    </td>
                    <td>
                      <div className="sub-plan-cell">
                        <span className="sub-name">{s.planName}</span>
                        <span className={`sub-type-badge ${s.planType === 'MONTHLY' ? 'monthly' : 'yearly'}`} style={{ fontSize: '0.7rem' }}>{s.planType}</span>
                      </div>
                    </td>
                    <td className="sub-date">{s.startDate ? new Date(s.startDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="sub-date">{s.expiryDate ? new Date(s.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      {s.subscriptionStatus === 'ACTIVE' ? (
                        <span className={`sub-days ${s.remainingDays <= 7 ? 'warning' : ''}`}>
                          {s.remainingDays}d left
                        </span>
                      ) : '—'}
                    </td>
                    <td className="sub-price">₹{s.amountPaid?.toLocaleString('en-IN') || '—'}</td>
                    <td>{statusBadge(s.subscriptionStatus)}</td>
                    <td>
                      {s.subscriptionStatus === 'ACTIVE' && (
                        <button className="sub-act-btn delete" onClick={() => handleCancelSub(s.id)} title="Cancel">
                          <i className="bi bi-x-circle"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalSubPages > 1 && (
            <div className="sub-pagination">
              <button disabled={subPage === 1} onClick={() => setSubPage(p => p - 1)} className="sub-page-btn">
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="sub-page-info">Page {subPage} of {totalSubPages}</span>
              <button disabled={subPage === totalSubPages} onClick={() => setSubPage(p => p + 1)} className="sub-page-btn">
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════ HISTORY TAB ══════════════════════════════ */}
      {tab === 'history' && (
        <div className="glass-panel sub-table-card">
          <div className="sub-table-wrap">
            <table className="sub-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Shop / Owner</th>
                  <th>Plan</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>Expiry Date</th>
                  <th>Amount Paid</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr><td colSpan={9} className="sub-empty">No subscription history.</td></tr>
                ) : subscriptions.map((s, i) => (
                  <tr key={s.id}>
                    <td className="sub-id">{i + 1}</td>
                    <td>
                      <div className="sub-shop-cell">
                        <span className="sub-shop-name">{s.shopName || '—'}</span>
                        <span className="sub-shop-email">{s.shopOwnerEmail}</span>
                      </div>
                    </td>
                    <td className="sub-name">{s.planName}</td>
                    <td>
                      <span className={`sub-type-badge ${s.planType === 'MONTHLY' ? 'monthly' : 'yearly'}`}>{s.planType}</span>
                    </td>
                    <td className="sub-date">{s.startDate ? new Date(s.startDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="sub-date">{s.expiryDate ? new Date(s.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="sub-price">₹{s.amountPaid?.toLocaleString('en-IN') || '—'}</td>
                    <td>{statusBadge(s.paymentStatus)}</td>
                    <td>{statusBadge(s.subscriptionStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════ RENEWAL REQUESTS TAB ══════════════════════════ */}
      {tab === 'renewal-requests' && (
        <div className="glass-panel sub-table-card">
          <div className="sub-table-wrap">
            <table className="sub-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Shop Name</th>
                  <th>Owner Name</th>
                  <th>Email</th>
                  <th>Mobile Number</th>
                  <th>Subscription Status</th>
                  <th>Expiry Date</th>
                  <th>Request Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {renewalRequests.length === 0 ? (
                  <tr><td colSpan={9} className="sub-empty">No pending renewal requests found.</td></tr>
                ) : renewalRequests.map((req, i) => (
                  <tr key={req.id}>
                    <td className="sub-id">{i + 1}</td>
                    <td className="sub-name">{req.shopName}</td>
                    <td className="customer-name">{req.ownerName}</td>
                    <td>{req.email}</td>
                    <td>{req.mobile}</td>
                    <td>{statusBadge(req.subscriptionStatus)}</td>
                    <td className="sub-date">{req.expiryDate ? new Date(req.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="sub-date">{req.requestDate ? new Date(req.requestDate).toLocaleString('en-IN') : '—'}</td>
                    <td>
                      <button 
                        className="btn btn-warning btn-sm fw-semibold" 
                        onClick={() => openAssignSubForRequest(req)}
                        style={{ fontSize: '11.5px', borderRadius: '6px' }}
                      >
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Activate Subscription
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      <div className="sub-charts-row mt-4">
        <div className="glass-panel sub-chart-card">
          <h4 className="sub-chart-title"><i className="bi bi-pie-chart-fill me-2 text-indigo"></i>Subscription Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-panel sub-chart-card">
          <h4 className="sub-chart-title"><i className="bi bi-bar-chart-fill me-2 text-emerald"></i>Revenue by Plan Type</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Bar dataKey="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══════════════════════════ PLAN MODAL ══════════════════════════════ */}
      {showPlanModal && (
        <div className="sub-modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="glass-panel sub-modal" onClick={e => e.stopPropagation()}>
            <div className="sub-modal-header">
              <h4>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h4>
              <button className="sub-modal-close" onClick={() => setShowPlanModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={savePlan} className="sub-modal-body">
              <div className="sub-field">
                <label>Plan Name *</label>
                <input className="finance-input" value={planForm.planName}
                  onChange={e => setPlanForm(f => ({ ...f, planName: e.target.value }))}
                  placeholder="e.g. Basic Monthly" required />
              </div>
              <div className="sub-field-row">
                <div className="sub-field">
                  <label>Plan Type *</label>
                  <select className="finance-input" value={planForm.planType}
                    onChange={e => setPlanForm(f => ({ ...f, planType: e.target.value }))}>
                    <option value="MONTHLY">Monthly (30 days)</option>
                    <option value="YEARLY">Yearly (365 days)</option>
                  </select>
                </div>
                <div className="sub-field">
                  <label>Price (₹) *</label>
                  <input className="finance-input" type="number" min="0" step="0.01"
                    value={planForm.price}
                    onChange={e => setPlanForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="e.g. 999" required />
                </div>
              </div>
              <div className="sub-field">
                <label>Description</label>
                <textarea className="finance-input" rows={3} value={planForm.description}
                  onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description..." />
              </div>
              <div className="sub-modal-footer">
                <button type="button" className="sub-btn-ghost" onClick={() => setShowPlanModal(false)}>Cancel</button>
                <button type="submit" className="sub-btn-primary" disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm"></span> : (editingPlan ? 'Update Plan' : 'Create Plan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════ ASSIGN SUB MODAL ════════════════════════ */}
      {showSubModal && (
        <div className="sub-modal-overlay" onClick={() => setShowSubModal(false)}>
          <div className="glass-panel sub-modal" onClick={e => e.stopPropagation()}>
            <div className="sub-modal-header">
              <h4>Assign Subscription</h4>
              <button className="sub-modal-close" onClick={() => setShowSubModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={saveSubscription} className="sub-modal-body">
              <div className="sub-field">
                <label>Shop Owner *</label>
                <select className="finance-input" value={subForm.shopOwnerId}
                  onChange={e => setSubForm(f => ({ ...f, shopOwnerId: e.target.value }))} required>
                  <option value="">— Select Shop Owner —</option>
                  {shopOwners.map(o => (
                    <option key={o.userId} value={o.userId}>{o.shopName} ({o.email})</option>
                  ))}
                </select>
              </div>
              <div className="sub-field">
                <label>Subscription Plan *</label>
                <select className="finance-input" value={subForm.planId}
                  onChange={e => setSubForm(f => ({ ...f, planId: e.target.value }))} required>
                  <option value="">— Select Plan —</option>
                  {plans.filter(p => p.status === 'ACTIVE').map(p => (
                    <option key={p.id} value={p.id}>{p.planName} — ₹{p.price} / {p.planType}</option>
                  ))}
                </select>
              </div>
              <div className="sub-field-row">
                <div className="sub-field">
                  <label>Start Date</label>
                  <input className="finance-input" type="date" value={subForm.startDate}
                    onChange={e => setSubForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="sub-field">
                  <label>Amount Paid (₹)</label>
                  <input className="finance-input" type="number" min="0" step="0.01"
                    placeholder="Leave blank to use plan price"
                    value={subForm.amountPaid}
                    onChange={e => setSubForm(f => ({ ...f, amountPaid: e.target.value }))} />
                </div>
              </div>
              <div className="sub-field">
                <label>Payment Status</label>
                <select className="finance-input" value={subForm.paymentStatus}
                  onChange={e => setSubForm(f => ({ ...f, paymentStatus: e.target.value }))}>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div className="sub-modal-footer">
                <button type="button" className="sub-btn-ghost" onClick={() => setShowSubModal(false)}>Cancel</button>
                <button type="submit" className="sub-btn-primary" disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm"></span> : 'Assign Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
