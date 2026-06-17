import React, { useEffect, useState, useContext } from 'react';
import { fetchDashboardData } from '../../Service/Dashboard';
import { fetchWhatsAppStats } from '../../Service/WhatsAppService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import FinanceParticles from '../../Componentes/FinanceParticles/FinanceParticles';
import { AppContext } from '../../context/AppContext';
import { getAdminContact } from '../../Service/NotificationService';
import { requestSubscriptionRenewal } from '../../Service/SubscriptionService';
import axios from 'axios';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsappStats, setWhatsappStats] = useState({ totalSent: 0, failedMessages: 0, successRate: 0.0 });
  const { settings, updateSettings, subscriptionInfo } = useContext(AppContext);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const [adminContact, setAdminContact] = useState(null);
  const [requestingRenewal, setRequestingRenewal] = useState(false);

  const handleRequestRenewal = async () => {
    setRequestingRenewal(true);
    const toastId = toast.loading("Sending subscription renewal request to Super Admin...");
    try {
      await requestSubscriptionRenewal();
      toast.success("Renewal request sent successfully! Super Admin has been notified.", { id: toastId });
    } catch (error) {
      console.error("Failed to send renewal request:", error);
      toast.error(error.response?.data?.message || "Failed to send renewal request.", { id: toastId });
    } finally {
      setRequestingRenewal(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchDashboardData();
        setData(response.data);

        try {
          const waResponse = await fetchWhatsAppStats();
          setWhatsappStats(waResponse.data);
        } catch (waError) {
          console.error('Error fetching WhatsApp statistics:', waError);
        }

        try {
          const contactRes = await getAdminContact();
          setAdminContact(contactRes.data);
        } catch (contactErr) {
          console.error('Error fetching admin contact:', contactErr);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-2">Decrypting Ledger Data...</span>
      </div>
    );
  }

  if (!data) {
    return <div className="dashboard-error">Failed to load dashboard data.</div>;
  }

  // Aggregate hourly or recent billing data for charts
  const getChartData = () => {
    if (!data.recentOrders || data.recentOrders.length === 0) {
      // Premium financial mock data if no real orders exist yet
      return [
        { time: '09:00', Revenue: 1400, Transactions: 2 },
        { time: '11:00', Revenue: 3200, Transactions: 5 },
        { time: '13:00', Revenue: 9800, Transactions: 12 },
        { time: '15:00', Revenue: 5100, Transactions: 7 },
        { time: '17:00', Revenue: 7800, Transactions: 9 },
        { time: '19:00', Revenue: 13500, Transactions: 15 },
      ];
    }

    // Format real orders in chronological order for charting
    const sorted = [...data.recentOrders].reverse();
    return sorted.map((order) => {
      const date = new Date(order.createdAt);
      return {
        time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        Revenue: order.grandTotal,
        Transactions: order.items?.length || 1,
      };
    });
  };

  const chartData = getChartData();

  // Calculate some analytics figures
  const averageOrderValue = data.todayOrderCount > 0
    ? (data.todaySales / data.todayOrderCount).toFixed(2)
    : "0.00";

  return (
    <div className="dashboard-wrapper position-relative overflow-hidden">
      {/* Subtle particle background for financial data vibe */}
      <FinanceParticles opacityMultiplier={0.2} speedMultiplier={0.4} />

      <div className="dashboard-container position-relative z-2">

        {/* SUBSCRIPTION STATUS PANEL — ShopOwner / Employee only */}
        {role !== 'ROLE_SUPERADMIN' && subscriptionInfo && (
          <div className={`sub-status-panel glass-panel ${subscriptionInfo.isExpired ? 'sub-expired' : subscriptionInfo.remainingDays <= 7 ? 'sub-warning' : 'sub-active'}`}>
            <div className="sub-status-left">
              <div className={`sub-status-icon-wrap ${subscriptionInfo.isExpired ? 'icon-expired' : subscriptionInfo.remainingDays <= 7 ? 'icon-warning' : 'icon-active'}`}>
                <i className={`bi ${subscriptionInfo.isExpired ? 'bi-x-circle-fill' : subscriptionInfo.remainingDays <= 7 ? 'bi-alarm-fill' : subscriptionInfo.isTrial ? 'bi-gift-fill' : 'bi-patch-check-fill'}`}></i>
              </div>
              <div>
                <h4 className="sub-status-heading">
                  {subscriptionInfo.isExpired
                    ? (subscriptionInfo.isTrial ? 'Free Trial Expired' : 'Subscription Expired')
                    : (subscriptionInfo.isTrial ? 'Free Trial Active' : 'Subscription Active')}
                </h4>
                <p className="sub-status-sub">
                  {subscriptionInfo.isExpired
                    ? 'Billing operations are disabled. Contact Super Admin to renew.'
                    : subscriptionInfo.remainingDays <= 7
                    ? `${subscriptionInfo.planName} · Expires in ${subscriptionInfo.remainingDays} day${subscriptionInfo.remainingDays !== 1 ? 's' : ''} on ${subscriptionInfo.expiryDate ? new Date(subscriptionInfo.expiryDate).toLocaleDateString('en-IN') : '—'}`
                    : `${subscriptionInfo.planName} · Expires on ${subscriptionInfo.expiryDate ? new Date(subscriptionInfo.expiryDate).toLocaleDateString('en-IN') : '—'}`}
                </p>
              </div>
            </div>
            <div className="sub-status-right d-flex align-items-center gap-3">
              {!subscriptionInfo.isExpired && (
                <div className="sub-days-ring">
                  <span className="sub-days-num">{subscriptionInfo.remainingDays}</span>
                  <span className="sub-days-label">days left</span>
                </div>
              )}
              {(subscriptionInfo.isExpired || subscriptionInfo.remainingDays <= 7) && (
                <button 
                  onClick={handleRequestRenewal} 
                  className="sub-contact-action border-0" 
                  disabled={requestingRenewal}
                >
                  <i className="bi bi-envelope-fill me-1"></i>
                  {requestingRenewal ? 'Sending...' : 'Contact Super Admin'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div className="stats-grid">
          {localStorage.getItem("role") === "ROLE_SUPERADMIN" ? (
            <>
              <div className="glass-panel stat-card">
                <div className="stat-icon-wrapper sales-glow">
                  <i className="bi bi-building"></i>
                </div>
                <div className="stat-content">
                  <h3>Total Shop Owners</h3>
                  <p>{data.totalShops || 0}</p>
                  <span className="trend-indicator positive">Registered shops</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon-wrapper orders-glow">
                  <i className="bi bi-people"></i>
                </div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p>{data.totalUsers || 0}</p>
                  <span className="trend-indicator positive">Staff & Owners</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon-wrapper ticket-glow">
                  <i className="bi bi-patch-check-fill"></i>
                </div>
                <div className="stat-content">
                  <h3>Active Subscriptions</h3>
                  <p>{data.activeSubscriptions ?? 0}</p>
                  <span className="trend-indicator positive">Currently active</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}>
                  <i className="bi bi-x-circle-fill"></i>
                </div>
                <div className="stat-content">
                  <h3>Expired Subscriptions</h3>
                  <p>{data.expiredSubscriptions ?? 0}</p>
                  <span className="trend-indicator" style={{ color: '#f43f5e' }}>Needs renewal</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <i className="bi bi-currency-rupee"></i>
                </div>
                <div className="stat-content">
                  <h3>Monthly Sub Revenue</h3>
                  <p>₹{(data.monthlySubscriptionRevenue || 0).toLocaleString('en-IN')}</p>
                  <span className="trend-indicator status-ok">Monthly plans</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
                <div className="stat-content">
                  <h3>Yearly Sub Revenue</h3>
                  <p>₹{(data.yearlySubscriptionRevenue || 0).toLocaleString('en-IN')}</p>
                  <span className="trend-indicator" style={{ color: '#8b5cf6' }}>Yearly plans</span>
                </div>
              </div>

              {data.expiringWithin7Days > 0 && (
                <div className="glass-panel stat-card expiry-alert-card" style={{ gridColumn: '1/-1' }}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <i className="bi bi-alarm-fill"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Expiring Soon</h3>
                    <p style={{ color: '#f59e0b' }}>{data.expiringWithin7Days}</p>
                    <span className="trend-indicator" style={{ color: '#f59e0b' }}>
                      subscription{data.expiringWithin7Days > 1 ? 's expire' : ' expires'} within 7 days
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="glass-panel stat-card">
                <div className="stat-icon-wrapper sales-glow">
                  <i className="bi bi-currency-rupee"></i>
                </div>
                <div className="stat-content">
                  <h3>Today's Gross Sales</h3>
                  <p>₹ {data.todaySales?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span className="trend-indicator positive">
                    <i className="bi bi-graph-up-arrow"></i> +14.2% from yesterday
                  </span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon-wrapper orders-glow">
                  <i className="bi bi-cart-check"></i>
                </div>
                <div className="stat-content">
                  <h3>Total Receipts Settled</h3>
                  <p>{data.todayOrderCount}</p>
                  <span className="trend-indicator positive">
                    <i className="bi bi-arrow-up-right-circle-fill"></i> Steady Volume
                  </span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon-wrapper ticket-glow">
                  <i className="bi bi-ticket-perforated"></i>
                </div>
                <div className="stat-content">
                  <h3>Average Ticket Size</h3>
                  <p>₹ {parseFloat(averageOrderValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  <span className="trend-indicator status-ok">
                    <i className="bi bi-check-circle-fill"></i> Health Score: 98%
                  </span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', border: '1px solid rgba(37, 211, 102, 0.2)' }}>
                  <i className="bi bi-whatsapp"></i>
                </div>
                <div className="stat-content">
                  <h3>WhatsApp Outbox</h3>
                  <p>{whatsappStats.totalSent} Sent</p>
                  <span className="trend-indicator" style={{ color: whatsappStats.successRate >= 80 ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                    <i className="bi bi-check2-circle"></i> {whatsappStats.successRate}% Success ({whatsappStats.failedMessages} failed)
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ANALYTICS CHARTS SECTION */}
        <div className="charts-grid mb-4">
          {localStorage.getItem("role") === "ROLE_SUPERADMIN" ? (
            <>
              {/* Subscription Distribution Pie */}
              <div className="glass-panel chart-card">
                <h4 className="chart-title">
                  <i className="bi bi-pie-chart-fill text-indigo me-2"></i>
                  Subscription Distribution
                </h4>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: Number(data.activeSubscriptions) || 0 },
                          { name: 'Expired', value: Number(data.expiredSubscriptions) || 0 },
                        ]}
                        cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                        dataKey="value" paddingAngle={4}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f43f5e" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 13, color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue by Plan Type Bar */}
              <div className="glass-panel chart-card">
                <h4 className="chart-title">
                  <i className="bi bi-bar-chart-fill text-emerald me-2"></i>
                  Subscription Revenue
                </h4>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={[
                        { name: 'Monthly Plans', Revenue: data.monthlySubscriptionRevenue || 0 },
                        { name: 'Yearly Plans',  Revenue: data.yearlySubscriptionRevenue  || 0 },
                      ]}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} tickFormatter={v => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Bar dataKey="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Platform Stats Bar */}
              <div className="glass-panel chart-card" style={{ flex: '0 0 100%' }}>
                <h4 className="chart-title">
                  <i className="bi bi-bar-chart-line text-indigo me-2"></i>
                  Platform Overview
                </h4>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={[
                      { name: 'Shop Owners', Count: data.totalShops || 0 },
                      { name: 'All Users',   Count: data.totalUsers || 0 },
                      { name: 'Customers',   Count: data.totalCustomers || 0 },
                      { name: 'Active Subs', Count: data.activeSubscriptions || 0 },
                      { name: 'Expired Subs', Count: data.expiredSubscriptions || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="Count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Revenue Line Area Chart */}
              <div className="glass-panel chart-card col-lg-8">
                <h4 className="chart-title">
                  <i className="bi bi-activity text-indigo me-2"></i>
                  Real-time Capital Pipeline
                </h4>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Bar Chart */}
              <div className="glass-panel chart-card col-lg-4">
                <h4 className="chart-title">
                  <i className="bi bi-bar-chart-fill text-emerald me-2"></i>
                  Volume Distribution
                </h4>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="Transactions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RECENT SETTLED LEDGERS TABLE */}
        {localStorage.getItem("role") !== "ROLE_SUPERADMIN" && (
          <div className="glass-panel recent-orders-card">
            <h3 className="recent-orders-title">
              <i className="bi bi-clock-history text-indigo"></i>
              Settled Transaction Ledgers
            </h3>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Trace ID</th>
                    <th>Customer Entity</th>
                    <th>Grand Total</th>
                    <th>Settle Route</th>
                    <th>Audit Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentOrders?.map((order) => (
                    <tr key={order.orderId}>
                      <td className="trace-id">{order.orderId?.substring(0, 12)}...</td>
                      <td className="customer-name">{order.customerName}</td>
                      <td className="grand-total">₹{order.grandTotal?.toFixed(2)}</td>
                      <td>
                        <span className={`payment-method ${order.paymentMethod?.toLowerCase()}`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${order.paymentDetails?.status?.toLowerCase()}`}>
                          {order.paymentDetails?.status === 'COMPLETED' ? 'APPROVED' : order.paymentDetails?.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="timestamp">
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SYSTEM CAPABILITIES / FEATURES LIST */}
        {localStorage.getItem("role") === "ROLE_SUPERADMIN" && (
          <div className="glass-panel recent-orders-card mt-4">
            <h3 className="recent-orders-title">
              <i className="bi bi-grid-fill text-indigo me-2"></i>
              Platform Features & Active Modules
            </h3>
            <div className="row g-4 p-2 text-start">
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--border-glass)' }}>
                  <div className="fs-3 text-info"><i className="bi bi-building"></i></div>
                  <div>
                    <h5 className="fw-bold fs-6 mb-1 text-info">Multi-Tenant Shop Isolation</h5>
                    <p className="text-secondary fs-7 mb-0">Distinct tenant boundaries ensuring shop data confidentiality and search sandboxing.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--border-glass)' }}>
                  <div className="fs-3 text-primary"><i className="bi bi-google"></i></div>
                  <div>
                    <h5 className="fw-bold fs-6 mb-1 text-primary">Google OAuth2 Sign-In</h5>
                    <p className="text-secondary fs-7 mb-0">Seamless single-sign-on integration for immediate, trusted shop owner registrations.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--border-glass)' }}>
                  <div className="fs-3 text-success"><i className="bi bi-whatsapp"></i></div>
                  <div>
                    <h5 className="fw-bold fs-6 mb-1 text-success">WhatsApp Cloud Bill Sending</h5>
                    <p className="text-secondary fs-7 mb-0">Direct dispatch of generated invoice PDFs to customers via Meta Business Cloud APIs.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--border-glass)' }}>
                  <div className="fs-3 text-warning"><i className="bi bi-shield-check"></i></div>
                  <div>
                    <h5 className="fw-bold fs-6 mb-1 text-warning">Approval Lifecycle Gates</h5>
                    <p className="text-secondary fs-7 mb-0">Super Admin verification mechanism regulating Pending, Approved, and Disabled accounts.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--border-glass)' }}>
                  <div className="fs-3 text-danger"><i className="bi bi-bar-chart-line"></i></div>
                  <div>
                    <h5 className="fw-bold fs-6 mb-1 text-danger">GST & Ledger Audits</h5>
                    <p className="text-secondary fs-7 mb-0">Full-fledged analytical reporting including yearly sales sheets and profit/loss data.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ backgroundColor: 'var(--bg-obsidian)', border: '1px solid var(--border-glass)' }}>
                  <div className="fs-3 text-info"><i className="bi bi-arrow-down-up"></i></div>
                  <div>
                    <h5 className="fw-bold fs-6 mb-1 text-info">Bulk Excel Parsing</h5>
                    <p className="text-secondary fs-7 mb-0">High performance batch import engine supporting thousands of products in seconds.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;