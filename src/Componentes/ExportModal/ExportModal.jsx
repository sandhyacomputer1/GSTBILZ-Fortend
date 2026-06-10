import React, { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { exportProducts } from "../../Service/ItemService";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import "./ExportModal.css";

/**
 * Product Export Modal.
 * Lets admin filter by category, brand, stock availability, and choose export format.
 */
const ExportModal = ({ onClose }) => {
  const { categories } = useContext(AppContext);

  const [format, setFormat] = useState("EXCEL");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const FORMAT_OPTIONS = [
    { value: "EXCEL", label: "Excel (.xlsx)", icon: "bi-file-excel", color: "emerald" },
    { value: "CSV",   label: "CSV (.csv)",    icon: "bi-filetype-csv", color: "cyan" },
    { value: "PDF",   label: "PDF (.pdf)",    icon: "bi-file-pdf", color: "rose" },
  ];

  const handleExport = async () => {
    setLoading(true);
    setProgress(20);

    const interval = setInterval(() => {
      setProgress((p) => (p < 80 ? p + 20 : p));
    }, 300);

    try {
      const res = await exportProducts({ format, category, brand, inStockOnly });
      clearInterval(interval);
      setProgress(100);

      // Trigger browser download
      const extMap = { EXCEL: "xlsx", CSV: "csv", PDF: "pdf" };
      const mimeMap = {
        EXCEL: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        CSV: "text/csv",
        PDF: "application/pdf",
      };
      const blob = new Blob([res.data], { type: mimeMap[format] });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `products_export.${extMap[format]}`;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        toast.success(`Products exported as ${format}!`);
        onClose();
      }, 300);
    } catch (err) {
      clearInterval(interval);
      setProgress(0);
      toast.error(`Export failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="ex-overlay">
      <div className="ex-container glass-panel">

        {/* Header */}
        <div className="ex-header">
          <div className="ex-header-left">
            <i className="bi bi-box-arrow-up text-emerald ex-title-icon" />
            <h4 className="ex-title">Export Products</h4>
          </div>
          <button className="btn-close-custom" onClick={onClose} disabled={loading}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="ex-body">

          {/* Format selector */}
          <div className="ex-section">
            <label className="ex-section-label">Export Format</label>
            <div className="ex-format-cards">
              {FORMAT_OPTIONS.map(({ value, label, icon, color }) => (
                <div
                  key={value}
                  className={`ex-format-card ${color} ${format === value ? "selected" : ""}`}
                  onClick={() => setFormat(value)}
                >
                  <i className={`bi ${icon} ex-fmt-icon`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="ex-section">
            <label className="ex-section-label">Filters <span className="ex-optional">(optional)</span></label>

            <div className="ex-filters">
              {/* Category */}
              <div className="ex-filter-field">
                <label>Category</label>
                <select
                  className="finance-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="ex-filter-field">
                <label>Brand</label>
                <input
                  type="text"
                  className="finance-input"
                  placeholder="e.g. Samsung, Dell..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              {/* Stock only */}
              <div className="ex-filter-toggle">
                <div
                  className={`ex-toggle ${inStockOnly ? "on" : ""}`}
                  onClick={() => setInStockOnly(!inStockOnly)}
                >
                  <div className="ex-toggle-thumb" />
                </div>
                <span>In-stock products only</span>
              </div>
            </div>
          </div>

          {/* Export summary */}
          <div className="ex-preview-summary">
            <i className="bi bi-info-circle text-indigo" />
            <span>
              Exporting <strong>{category || "all categories"}</strong>
              {brand ? `, brand: <strong>${brand}</strong>` : ""}
              {inStockOnly ? " (in-stock only)" : ""}
              {" "}as <strong>{format}</strong>
            </span>
          </div>

          {/* Progress */}
          {loading && (
            <div className="ex-progress-wrap">
              <div className="ex-progress-bar" style={{ width: `${progress}%` }} />
              <span className="ex-progress-label">Generating {format}...</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="ex-footer">
          <button className="im-btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="im-btn-primary" onClick={handleExport} disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" />Exporting...</>
            ) : (
              <><i className="bi bi-download me-2" />Export {format}</>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ExportModal;
