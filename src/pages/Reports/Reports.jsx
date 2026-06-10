import React, { useState, useEffect } from "react";
import {
  fetchDailyReport,
  fetchWeeklyReport,
  fetchMonthlyReport,
  fetchYearlyReport,
  fetchGSTReport,
  fetchProfitLossReport,
  fetchBestSellingProducts,
  downloadReportExcel,
  downloadReportPdf,
} from "../../Service/ReportService";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import toast from "react-hot-toast";
import FinanceParticles from "../../Componentes/FinanceParticles/FinanceParticles";
import "./Reports.css";

const TABS = [
  { id: "daily", label: "Daily Sales", icon: "bi-calendar-day" },
  { id: "weekly", label: "Weekly Sales", icon: "bi-calendar-week" },
  { id: "monthly", label: "Monthly Sales", icon: "bi-calendar-month" },
  { id: "yearly", label: "Yearly Sales", icon: "bi-calendar-range" },
  { id: "gst", label: "GST Summary", icon: "bi-percent" },
  { id: "profit-loss", label: "Profit & Loss", icon: "bi-bank" },
  { id: "best-selling", label: "Best Sellers", icon: "bi-star-fill" },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState("daily");
  
  // Date range state: default to 30 days ago until today
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [limit, setLimit] = useState(10);
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch report data
  const loadReportData = async () => {
    setLoading(true);
    try {
      let res;
      switch (activeTab) {
        case "daily":
          res = await fetchDailyReport(startDate, endDate);
          break;
        case "weekly":
          res = await fetchWeeklyReport(startDate, endDate);
          break;
        case "monthly":
          res = await fetchMonthlyReport(startDate, endDate);
          break;
        case "yearly":
          res = await fetchYearlyReport(startDate, endDate);
          break;
        case "gst":
          res = await fetchGSTReport(startDate, endDate);
          break;
        case "profit-loss":
          res = await fetchProfitLossReport(startDate, endDate);
          break;
        case "best-selling":
          res = await fetchBestSellingProducts(startDate, endDate, limit);
          break;
        default:
          res = { data: [] };
      }
      setData(res.data || []);
    } catch (err) {
      console.error("Error loading report:", err);
      toast.error(`Failed to load ${activeTab} report data.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [activeTab]);

  const handleApplyFilters = () => {
    loadReportData();
  };

  const handleExport = async (format) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    setExportLoading(true);
    try {
      let res;
      if (format === "EXCEL") {
        res = await downloadReportExcel(activeTab, startDate, endDate);
        const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${activeTab}-report-${startDate}-to-${endDate}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        res = await downloadReportPdf(activeTab, startDate, endDate);
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${activeTab}-report-${startDate}-to-${endDate}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      }
      toast.success(`${format} report exported successfully!`);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export report.");
    } finally {
      setExportLoading(false);
    }
  };

  // Summarize metrics
  const getSummaryMetrics = () => {
    if (!data || data.length === 0) return {};

    switch (activeTab) {
      case "daily":
      case "weekly":
      case "monthly":
      case "yearly": {
        const totalSales = data.reduce((sum, item) => sum + (item.totalSales || 0), 0);
        const totalOrders = data.reduce((sum, item) => sum + (item.totalOrders || 0), 0);
        const totalTax = data.reduce((sum, item) => sum + (item.totalTax || 0), 0);
        const totalDiscount = data.reduce((sum, item) => sum + (item.totalDiscount || 0), 0);
        return { totalSales, totalOrders, totalTax, totalDiscount };
      }
      case "gst": {
        const totalTaxable = data.reduce((sum, item) => sum + (item.taxableAmount || 0), 0);
        const totalCGST = data.reduce((sum, item) => sum + (item.cgstAmount || 0), 0);
        const totalSGST = data.reduce((sum, item) => sum + (item.sgstAmount || 0), 0);
        const totalGst = data.reduce((sum, item) => sum + (item.totalGst || 0), 0);
        const totalSales = data.reduce((sum, item) => sum + (item.totalSales || 0), 0);
        return { totalTaxable, totalCGST, totalSGST, totalGst, totalSales };
      }
      case "profit-loss": {
        const totalRevenue = data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
        const totalCost = data.reduce((sum, item) => sum + (item.totalCost || 0), 0);
        const totalProfit = data.reduce((sum, item) => sum + (item.totalProfit || 0), 0);
        const totalLoss = data.reduce((sum, item) => sum + (item.totalLoss || 0), 0);
        return { totalRevenue, totalCost, totalProfit, totalLoss };
      }
      case "best-selling": {
        const totalQty = data.reduce((sum, item) => sum + (item.quantitySold || 0), 0);
        const totalRevenue = data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
        const topProduct = data[0] ? data[0].productName : "N/A";
        return { totalQty, totalRevenue, topProduct };
      }
      default:
        return {};
    }
  };

  const metrics = getSummaryMetrics();

  // Render relevant chart based on active tab
  const renderChart = () => {
    if (!data || data.length === 0) return null;

    const tooltipStyle = {
      backgroundColor: "#121824",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "8px",
      color: "#f8f9fa",
    };

    switch (activeTab) {
      case "daily":
      case "weekly":
      case "monthly":
      case "yearly": {
        const xDataKey = activeTab === "daily" ? "date" : activeTab === "weekly" ? "weekRange" : activeTab === "monthly" ? "month" : "year";
        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={xDataKey} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="totalSales" name="Total Sales (₹)" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              <Bar dataKey="totalOrders" name="Total Orders" fill="#06b6d4" barSize={20} />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
      case "gst":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="gstRate" tickFormatter={(v) => `${v}%`} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => `₹${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="taxableAmount" name="Taxable Amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalGst" name="Total GST" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "profit-loss":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="reportPeriod" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => `₹${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="totalRevenue" name="Revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalCost" name="Cost of Goods" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalProfit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "best-selling":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart layout="vertical" data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis type="category" dataKey="productName" stroke="#94a3b8" width={120} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="quantitySold" name="Qty Sold" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="reports-wrapper position-relative overflow-hidden">
      <FinanceParticles opacityMultiplier={0.2} speedMultiplier={0.4} />

      <div className="reports-container position-relative z-2">
        
        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="reports-title text-gradient-indigo mb-1">
              <i className="bi bi-bar-chart-line-fill me-2"></i>
              Financial Auditing &amp; Reports
            </h2>
            <p className="reports-subtitle text-secondary">Aggregated statements, tax reports, and performance parameters</p>
          </div>
          
          {/* EXPORTS CARD */}
          <div className="d-flex gap-2">
            <button
              className="btn btn-excel d-flex align-items-center gap-2 fw-semibold"
              onClick={() => handleExport("EXCEL")}
              disabled={loading || exportLoading}
            >
              <i className="bi bi-file-earmark-excel"></i>
              Excel Export
            </button>
            <button
              className="btn btn-pdf d-flex align-items-center gap-2 fw-semibold"
              onClick={() => handleExport("PDF")}
              disabled={loading || exportLoading}
            >
              <i className="bi bi-file-earmark-pdf"></i>
              PDF Export
            </button>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="glass-panel p-2 mb-4">
          <div className="reports-tabs-container d-flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`tab-btn d-flex align-items-center gap-2 ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <i className={`bi ${t.icon}`} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FILTERS BAR CARD */}
        <div className="glass-panel p-3 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-sm-4 col-md-3">
              <label className="form-label text-muted small fw-semibold">START DATE</label>
              <input
                type="date"
                className="form-control finance-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-4 col-md-3">
              <label className="form-label text-muted small fw-semibold">END DATE</label>
              <input
                type="date"
                className="form-control finance-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {activeTab === "best-selling" && (
              <div className="col-12 col-sm-4 col-md-2">
                <label className="form-label text-muted small fw-semibold">LIMIT</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-control finance-input"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
                />
              </div>
            )}

            <div className="col-12 col-sm-4 col-md-2">
              <button
                className="btn settings-save-btn w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                onClick={handleApplyFilters}
                disabled={loading}
              >
                <i className="bi bi-filter" />
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* METRICS PANELS */}
        {data.length > 0 && !loading && (
          <div className="reports-stats-grid mb-4">
            
            {/* Conditional Cards based on active tab */}
            {(activeTab === "daily" || activeTab === "weekly" || activeTab === "monthly" || activeTab === "yearly") && (
              <>
                <div className="glass-panel report-stat-card border-indigo">
                  <span className="stat-label">Gross Revenue</span>
                  <p className="stat-value text-indigo">₹{metrics.totalSales?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-panel report-stat-card border-blue">
                  <span className="stat-label">Total Receipts</span>
                  <p className="stat-value text-blue">{metrics.totalOrders}</p>
                </div>
                <div className="glass-panel report-stat-card border-emerald">
                  <span className="stat-label">Total Tax Collected</span>
                  <p className="stat-value text-emerald">₹{metrics.totalTax?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-panel report-stat-card border-rose">
                  <span className="stat-label">Total Discounts Given</span>
                  <p className="stat-value text-rose">₹{metrics.totalDiscount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
              </>
            )}

            {activeTab === "gst" && (
              <>
                <div className="glass-panel report-stat-card border-indigo">
                  <span className="stat-label">Total Sales (Inc. Tax)</span>
                  <p className="stat-value text-indigo">₹{metrics.totalSales?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-panel report-stat-card border-blue">
                  <span className="stat-label">Total Taxable Amount</span>
                  <p className="stat-value text-blue">₹{metrics.totalTaxable?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-panel report-stat-card border-emerald">
                  <span className="stat-label">Total CGST / SGST</span>
                  <p className="stat-value text-emerald">₹{metrics.totalCGST?.toLocaleString("en-IN", { minimumFractionDigits: 2 })} / ₹{metrics.totalSGST?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-panel report-stat-card border-rose">
                  <span className="stat-label">Total GST Settle</span>
                  <p className="stat-value text-rose">₹{metrics.totalGst?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
              </>
            )}

            {activeTab === "profit-loss" && (
              <>
                <div className="glass-panel report-stat-card border-blue">
                  <span className="stat-label">Total Revenue</span>
                  <p className="stat-value text-blue">₹{metrics.totalRevenue?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-panel report-stat-card border-rose">
                  <span className="stat-label">Cost of Goods Sold (COGS)</span>
                  <p className="stat-value text-rose">₹{metrics.totalCost?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-panel report-stat-card border-emerald">
                  <span className="stat-label">Net Accumulation Profit</span>
                  <p className="stat-value text-emerald">₹{metrics.totalProfit?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="glass-panel report-stat-card border-rose">
                  <span className="stat-label">Net Accumulation Loss</span>
                  <p className="stat-value text-rose">₹{metrics.totalLoss?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
              </>
            )}

            {activeTab === "best-selling" && (
              <>
                <div className="glass-panel report-stat-card border-emerald">
                  <span className="stat-label">Top Selling Product</span>
                  <p className="stat-value text-emerald text-truncate" title={metrics.topProduct}>{metrics.topProduct}</p>
                </div>
                <div className="glass-panel report-stat-card border-blue">
                  <span className="stat-label">Total Units Sold (Top List)</span>
                  <p className="stat-value text-blue">{metrics.totalQty}</p>
                </div>
                <div className="glass-panel report-stat-card border-indigo">
                  <span className="stat-label">Top List Total Revenue</span>
                  <p className="stat-value text-indigo">₹{metrics.totalRevenue?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
              </>
            )}

          </div>
        )}

        {/* CHARTS CONTAINER CARDS */}
        {data.length > 0 && !loading && (
          <div className="glass-panel p-4 mb-4">
            <h4 className="chart-title mb-3">
              <i className="bi bi-activity text-indigo me-2"></i>
              Financial Trend Plot
            </h4>
            {renderChart()}
          </div>
        )}

        {/* DETAILS TABLE CARD */}
        <div className="glass-panel p-4">
          <h4 className="chart-title mb-3">
            <i className="bi bi-file-earmark-text-fill text-indigo me-2"></i>
            Detailed Records
          </h4>

          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <span>Processing Ledger Databank...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-clipboard-x fs-1 d-block mb-3 text-muted"></i>
              <h5>No Records Found</h5>
              <p className="small">Try adjusting your date range or filters for the current query.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table reports-table text-light mb-0">
                <thead>
                  {activeTab === "daily" && (
                    <tr>
                      <th>Date</th>
                      <th className="text-end">Total Sales</th>
                      <th className="text-end">Total Orders</th>
                      <th className="text-end">GST Tax</th>
                      <th className="text-end">Discount</th>
                    </tr>
                  )}
                  {activeTab === "weekly" && (
                    <tr>
                      <th>Week Range</th>
                      <th className="text-end">Total Sales</th>
                      <th className="text-end">Total Orders</th>
                      <th className="text-end">GST Tax</th>
                      <th className="text-end">Discount</th>
                    </tr>
                  )}
                  {activeTab === "monthly" && (
                    <tr>
                      <th>Month</th>
                      <th className="text-end">Total Sales</th>
                      <th className="text-end">Total Orders</th>
                      <th className="text-end">GST Tax</th>
                      <th className="text-end">Discount</th>
                    </tr>
                  )}
                  {activeTab === "yearly" && (
                    <tr>
                      <th>Year</th>
                      <th className="text-end">Total Sales</th>
                      <th className="text-end">Total Orders</th>
                      <th className="text-end">GST Tax</th>
                      <th className="text-end">Discount</th>
                    </tr>
                  )}
                  {activeTab === "gst" && (
                    <tr>
                      <th>GST Rate (%)</th>
                      <th className="text-end">Taxable Amount</th>
                      <th className="text-end">CGST</th>
                      <th className="text-end">SGST</th>
                      <th className="text-end">Total GST</th>
                      <th className="text-end">Total Sales</th>
                    </tr>
                  )}
                  {activeTab === "profit-loss" && (
                    <tr>
                      <th>Period</th>
                      <th className="text-end">Total Revenue</th>
                      <th className="text-end">Cost of Goods (COGS)</th>
                      <th className="text-end">Net Profit</th>
                      <th className="text-end">Net Loss</th>
                    </tr>
                  )}
                  {activeTab === "best-selling" && (
                    <tr>
                      <th>Rank</th>
                      <th>Product ID</th>
                      <th>Product Name</th>
                      <th className="text-end">Quantity Sold</th>
                      <th className="text-end">Total Revenue</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {data.map((row, index) => {
                    if (activeTab === "daily") {
                      return (
                        <tr key={index}>
                          <td>{row.date || "N/A"}</td>
                          <td className="text-end text-indigo fw-semibold">₹{row.totalSales?.toFixed(2)}</td>
                          <td className="text-end text-blue">{row.totalOrders}</td>
                          <td className="text-end text-emerald">₹{row.totalTax?.toFixed(2)}</td>
                          <td className="text-end text-rose">₹{row.totalDiscount?.toFixed(2)}</td>
                        </tr>
                      );
                    }
                    if (activeTab === "weekly") {
                      return (
                        <tr key={index}>
                          <td>{row.weekRange || "N/A"}</td>
                          <td className="text-end text-indigo fw-semibold">₹{row.totalSales?.toFixed(2)}</td>
                          <td className="text-end text-blue">{row.totalOrders}</td>
                          <td className="text-end text-emerald">₹{row.totalTax?.toFixed(2)}</td>
                          <td className="text-end text-rose">₹{row.totalDiscount?.toFixed(2)}</td>
                        </tr>
                      );
                    }
                    if (activeTab === "monthly") {
                      return (
                        <tr key={index}>
                          <td>{row.month || "N/A"}</td>
                          <td className="text-end text-indigo fw-semibold">₹{row.totalSales?.toFixed(2)}</td>
                          <td className="text-end text-blue">{row.totalOrders}</td>
                          <td className="text-end text-emerald">₹{row.totalTax?.toFixed(2)}</td>
                          <td className="text-end text-rose">₹{row.totalDiscount?.toFixed(2)}</td>
                        </tr>
                      );
                    }
                    if (activeTab === "yearly") {
                      return (
                        <tr key={index}>
                          <td>{row.year || "N/A"}</td>
                          <td className="text-end text-indigo fw-semibold">₹{row.totalSales?.toFixed(2)}</td>
                          <td className="text-end text-blue">{row.totalOrders}</td>
                          <td className="text-end text-emerald">₹{row.totalTax?.toFixed(2)}</td>
                          <td className="text-end text-rose">₹{row.totalDiscount?.toFixed(2)}</td>
                        </tr>
                      );
                    }
                    if (activeTab === "gst") {
                      return (
                        <tr key={index}>
                          <td><span className="badge-gst-rate">{row.gstRate}%</span></td>
                          <td className="text-end">₹{row.taxableAmount?.toFixed(2)}</td>
                          <td className="text-end">₹{row.cgstAmount?.toFixed(2)}</td>
                          <td className="text-end">₹{row.sgstAmount?.toFixed(2)}</td>
                          <td className="text-end text-emerald fw-semibold">₹{row.totalGst?.toFixed(2)}</td>
                          <td className="text-end text-indigo fw-semibold">₹{row.totalSales?.toFixed(2)}</td>
                        </tr>
                      );
                    }
                    if (activeTab === "profit-loss") {
                      return (
                        <tr key={index}>
                          <td>{row.reportPeriod || "N/A"}</td>
                          <td className="text-end text-blue">₹{row.totalRevenue?.toFixed(2)}</td>
                          <td className="text-end text-rose">₹{row.totalCost?.toFixed(2)}</td>
                          <td className="text-end text-emerald fw-semibold">₹{row.totalProfit?.toFixed(2)}</td>
                          <td className="text-end text-rose">₹{row.totalLoss?.toFixed(2)}</td>
                        </tr>
                      );
                    }
                    if (activeTab === "best-selling") {
                      return (
                        <tr key={index}>
                          <td><span className="rank-badge">{index + 1}</span></td>
                          <td className="text-secondary small">{row.productId?.substring(0, 10)}...</td>
                          <td className="fw-semibold">{row.productName}</td>
                          <td className="text-end text-blue fw-semibold">{row.quantitySold}</td>
                          <td className="text-end text-indigo fw-semibold">₹{row.totalRevenue?.toFixed(2)}</td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Reports;
