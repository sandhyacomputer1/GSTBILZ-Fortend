import React, { useState, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import {
  previewImport,
  confirmImport,
  downloadImportTemplate,
  fetchItems,
} from "../../Service/ItemService";
import { fetchCategories } from "../../Service/CategoryService";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import "./ImportModal.css";

/**
 * Four-step product import modal:
 *  Step 1 — Upload (drag-and-drop, format indicators)
 *  Step 2 — Preview (table of parsed products, stats, duplicate count)
 *  Step 3 — Duplicate Strategy (SKIP / UPDATE / CREATE)
 *  Step 4 — Summary (import result: success / fail / time)
 */
const STEPS = ["Upload", "Preview", "Strategy", "Summary"];

const ImportModal = ({ onClose }) => {
  const { setItemData, setCategories } = useContext(AppContext);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Phase 1 preview data
  const [preview, setPreview] = useState(null); // ImportSummaryResponse

  // Phase 2 settings
  const [duplicateMode, setDuplicateMode] = useState("SKIP");

  // Phase 3 final summary
  const [summary, setSummary] = useState(null); // ImportSummaryResponse after confirm

  const fileInputRef = useRef(null);

  // ─── File Handling ──────────────────────────────────────────────────────────

  const ALLOWED_EXTS = ["xlsx", "xls", "csv", "pdf", "docx"];

  const validateAndSetFile = (selected) => {
    const ext = selected.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      toast.error(`Unsupported format: .${ext}. Use: ${ALLOWED_EXTS.join(", ")}`);
      return;
    }
    if (selected.size > 50 * 1024 * 1024) {
      toast.error("File too large. Max 50 MB allowed.");
      return;
    }
    setFile(selected);
    setPreview(null);
    setSummary(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setSummary(null);
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Step 1 → 2: Upload & Preview ──────────────────────────────────────────

  const handlePreview = async () => {
    if (!file) { toast.error("Please select a file"); return; }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setUploadProgress(10);

    try {
      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 15 : p));
      }, 300);

      const res = await previewImport(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.data.totalRecords === 0) {
        toast.error("No valid data rows found in the file.");
        setLoading(false);
        setUploadProgress(0);
        return;
      }

      setPreview(res.data);
      setTimeout(() => {
        setStep(2);
        setLoading(false);
        setUploadProgress(0);
        toast.success(`Parsed ${res.data.totalRecords} records successfully`);
      }, 400);
    } catch (err) {
      setUploadProgress(0);
      setLoading(false);
      toast.error(`Preview failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // ─── Step 3 → 4: Confirm Import ────────────────────────────────────────────

  const handleConfirm = async () => {
    if (!preview?.previewItems?.length) return;

    setLoading(true);
    try {
      const res = await confirmImport({
        products: preview.previewItems,
        duplicateMode,
      });

      setSummary(res.data);
      setStep(4);
      toast.success(`Import complete! ${res.data.successCount} products saved.`);

      // Refresh context
      const [updatedItems, updatedCats] = await Promise.all([fetchItems(), fetchCategories()]);
      setItemData(updatedItems.data);
      setCategories(updatedCats.data);
    } catch (err) {
      toast.error(`Import failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ─── Template download ──────────────────────────────────────────────────────

  const handleTemplateDownload = async () => {
    try {
      const res = await downloadImportTemplate();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "product_import_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded!");
    } catch {
      toast.error("Template download failed");
    }
  };

  // ─── Error report download ──────────────────────────────────────────────────

  const downloadErrorReport = () => {
    if (!summary?.importedItems) return;
    const failed = summary.importedItems.filter((r) => r.status === "FAILED");
    if (!failed.length) { toast("No errors to download"); return; }

    const csv =
      "Row,Name,SKU,Error\n" +
      failed.map((r) => `${r.rowNumber},"${r.name || ""}","${r.sku || ""}","${r.errorMessage || ""}"`).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "import_errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── File Icon ───────────────────────────────────────────────────────────────

  const getFileIcon = (filename) => {
    const ext = (filename || "").split(".").pop().toLowerCase();
    const map = { xlsx: "bi-file-excel text-emerald", xls: "bi-file-excel text-emerald",
                  csv: "bi-filetype-csv text-cyan", pdf: "bi-file-pdf text-rose",
                  docx: "bi-file-word text-indigo" };
    return map[ext] || "bi-file-earmark text-secondary";
  };

  // ─── Stat helper ────────────────────────────────────────────────────────────

  const rowBadge = (status) => {
    const map = {
      VALID: "badge-valid",
      DUPLICATE_SKU: "badge-dup",
      DUPLICATE_BARCODE: "badge-dup",
      INVALID: "badge-invalid",
    };
    return map[status] || "badge-valid";
  };

  const rowLabel = (status) => {
    const map = {
      VALID: "Valid",
      DUPLICATE_SKU: "Dup SKU",
      DUPLICATE_BARCODE: "Dup BC",
      INVALID: "Invalid",
    };
    return map[status] || status;
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return createPortal(
    <div className="im-overlay">
      <div className="im-container glass-panel">

        {/* ── Header ── */}
        <div className="im-header">
          <div className="im-header-left">
            <i className="bi bi-box-arrow-in-down text-indigo im-title-icon" />
            <h4 className="im-title">Import Product Catalog</h4>
          </div>
          <button className="btn-close-custom" onClick={onClose} disabled={loading}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* ── Step Indicator ── */}
        <div className="im-steps">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const isActive = n === step;
            const isDone = n < step;
            return (
              <div key={label} className={`im-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                <div className="im-step-circle">
                  {isDone ? <i className="bi bi-check-lg" /> : n}
                </div>
                <span className="im-step-label">{label}</span>
                {i < STEPS.length - 1 && <div className={`im-step-line ${isDone ? "done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div className="im-body">

          {/* ══ STEP 1: UPLOAD ══ */}
          {step === 1 && (
            <div className="im-step-content">

              {/* Dropzone */}
              <div
                className={`im-dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
                  accept=".xlsx,.xls,.csv,.pdf,.docx"
                  style={{ display: "none" }}
                />

                {file ? (
                  <div className="im-file-selected">
                    <i className={`bi ${getFileIcon(file.name)} im-file-icon`} />
                    <p className="im-file-name">{file.name}</p>
                    <p className="im-file-size">{(file.size / 1024).toFixed(1)} KB</p>
                    <button className="btn-change-file" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                      <i className="bi bi-arrow-clockwise" /> Change File
                    </button>
                  </div>
                ) : (
                  <div className="im-dropzone-placeholder">
                    <div className="im-upload-anim">
                      <i className="bi bi-cloud-arrow-up" />
                    </div>
                    <h5>Drag &amp; drop your product file here</h5>
                    <p>or click to browse</p>
                    <div className="im-format-badges">
                      {ALLOWED_EXTS.map((ext) => <span key={ext}>.{ext}</span>)}
                    </div>
                    <p className="im-size-hint">Max 50 MB</p>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {loading && (
                <div className="im-progress-wrap">
                  <div className="im-progress-bar" style={{ width: `${uploadProgress}%` }} />
                  <span className="im-progress-label">Parsing... {uploadProgress}%</span>
                </div>
              )}

              {/* Instructions */}
              <div className="im-instructions">
                <div className="im-instr-header">
                  <i className="bi bi-info-circle" /> Format Guide
                </div>
                <ul>
                  <li><strong>Excel/CSV headers:</strong> Product Name, SKU, Barcode, Category, Brand, Purchase Price, Selling Price, Stock Qty, GST%, Unit, Description</li>
                  <li><strong>PDF/DOCX:</strong> One product per line, fields separated by comma/tab</li>
                  <li>Missing categories are auto-created</li>
                </ul>
                <button className="btn-template" onClick={handleTemplateDownload}>
                  <i className="bi bi-download" /> Download Template
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2: PREVIEW ══ */}
          {step === 2 && preview && (
            <div className="im-step-content">

              {/* Stats bar */}
              <div className="im-stats-bar">
                <div className="im-stat-pill total">
                  <span className="im-stat-num">{preview.totalRecords}</span>
                  <span className="im-stat-lbl">Total</span>
                </div>
                <div className="im-stat-pill success">
                  <span className="im-stat-num">{preview.successCount}</span>
                  <span className="im-stat-lbl">Valid</span>
                </div>
                <div className="im-stat-pill dup">
                  <span className="im-stat-num">{preview.duplicatesFound}</span>
                  <span className="im-stat-lbl">Duplicates</span>
                </div>
                <div className="im-stat-pill fail">
                  <span className="im-stat-num">{preview.failedCount}</span>
                  <span className="im-stat-lbl">Invalid</span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="im-table-wrap">
                <table className="im-preview-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Selling Price</th>
                      <th>Stock</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.previewItems.map((item, idx) => (
                      <tr key={idx} className={`im-tr-${(item.rowStatus || "VALID").toLowerCase().replace("_", "-")}`}>
                        <td className="im-td-row">{item.rowNumber}</td>
                        <td className="im-td-name">{item.productName || "—"}</td>
                        <td className="im-td-mono">{item.sku || "—"}</td>
                        <td className="im-td-price">
                          {item.sellingPrice ? `₹${item.sellingPrice}` : "—"}
                        </td>
                        <td>{item.stockQuantity ?? "—"}</td>
                        <td>{item.category || "—"}</td>
                        <td>
                          <span className={`im-row-badge ${rowBadge(item.rowStatus)}`}>
                            {rowLabel(item.rowStatus)}
                          </span>
                          {item.validationError && (
                            <div className="im-val-error">{item.validationError}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ STEP 3: DUPLICATE STRATEGY ══ */}
          {step === 3 && preview && (
            <div className="im-step-content">
              <div className="im-strategy-header">
                <i className="bi bi-copy text-indigo" />
                <span>
                  Found <strong className="text-indigo">{preview.duplicatesFound}</strong> duplicate
                  {preview.duplicatesFound !== 1 ? "s" : ""}. Choose how to handle them:
                </span>
              </div>

              <div className="im-strategy-cards">
                {[
                  {
                    mode: "SKIP",
                    icon: "bi-skip-forward",
                    title: "Skip Duplicates",
                    desc: "Leave existing products unchanged. Duplicate rows will not be imported.",
                    color: "indigo",
                  },
                  {
                    mode: "UPDATE",
                    icon: "bi-pencil-square",
                    title: "Update Existing",
                    desc: "Overwrite existing product fields with new file data.",
                    color: "emerald",
                  },
                  {
                    mode: "CREATE",
                    icon: "bi-plus-circle",
                    title: "Create New Entry",
                    desc: "Import as new products regardless of duplicates (new UUID assigned).",
                    color: "cyan",
                  },
                ].map(({ mode, icon, title, desc, color }) => (
                  <div
                    key={mode}
                    className={`im-strategy-card ${color} ${duplicateMode === mode ? "selected" : ""}`}
                    onClick={() => setDuplicateMode(mode)}
                  >
                    <div className="im-strategy-radio">
                      {duplicateMode === mode && <div className="im-strategy-dot" />}
                    </div>
                    <div className="im-strategy-body">
                      <i className={`bi ${icon} im-strategy-icon`} />
                      <div>
                        <h6>{title}</h6>
                        <p>{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Import summary before confirming */}
              <div className="im-confirm-summary">
                <span><i className="bi bi-check-circle text-emerald" /> {preview.successCount} valid products will be imported</span>
                <span><i className="bi bi-copy text-indigo" /> {preview.duplicatesFound} duplicates → <strong>{duplicateMode}</strong></span>
                {preview.failedCount > 0 && (
                  <span><i className="bi bi-x-circle text-rose" /> {preview.failedCount} invalid rows will be skipped</span>
                )}
              </div>
            </div>
          )}

          {/* ══ STEP 4: SUMMARY ══ */}
          {step === 4 && summary && (
            <div className="im-step-content">
              <div className="im-summary-header">
                <div className="im-summary-checkmark">
                  <i className="bi bi-check-lg" />
                </div>
                <h5>Import Complete!</h5>
                <p className="im-summary-time">
                  Processed in {summary.processingTimeMs}ms
                </p>
              </div>

              {/* Result metrics */}
              <div className="im-result-metrics">
                <div className="im-metric info">
                  <div className="im-metric-num text-gradient-indigo">{summary.totalRecords}</div>
                  <div className="im-metric-lbl">Total</div>
                </div>
                <div className="im-metric success">
                  <div className="im-metric-num text-gradient-emerald">{summary.successCount}</div>
                  <div className="im-metric-lbl">Saved</div>
                </div>
                <div className="im-metric dup">
                  <div className="im-metric-num" style={{ color: "var(--neon-blue)" }}>{summary.duplicatesFound}</div>
                  <div className="im-metric-lbl">Duplicates</div>
                </div>
                <div className="im-metric fail">
                  <div className="im-metric-num text-rose">{summary.failedCount}</div>
                  <div className="im-metric-lbl">Failed</div>
                </div>
              </div>

              {/* Run log */}
              {summary.importedItems && summary.importedItems.length > 0 && (
                <div className="im-run-log">
                  <div className="im-run-log-title">
                    Import Run Log
                    {summary.failedCount > 0 && (
                      <button className="btn-dl-errors" onClick={downloadErrorReport}>
                        <i className="bi bi-download" /> Download Error Report
                      </button>
                    )}
                  </div>
                  <div className="im-log-scroll">
                    {summary.importedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`im-log-row ${item.status?.toLowerCase()}`}
                      >
                        <span className={`im-log-badge ${item.status?.toLowerCase()}`}>
                          {item.status}
                        </span>
                        <div className="im-log-info">
                          <span className="im-log-name">{item.name}</span>
                          <span className="im-log-meta">
                            Row {item.rowNumber}
                            {item.sku && ` · SKU: ${item.sku}`}
                            {item.duplicateAction && ` · ${item.duplicateAction}`}
                          </span>
                          {item.errorMessage && (
                            <span className="im-log-error">{item.errorMessage}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="im-footer">
          {step === 1 && (
            <>
              <button className="im-btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                className="im-btn-primary"
                onClick={handlePreview}
                disabled={loading || !file}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Parsing...</>
                ) : (
                  <><i className="bi bi-eye me-2" />Preview File</>
                )}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button className="im-btn-secondary" onClick={() => setStep(1)}>
                <i className="bi bi-arrow-left me-1" /> Back
              </button>
              <button className="im-btn-primary" onClick={() => setStep(3)}>
                Continue <i className="bi bi-arrow-right ms-1" />
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button className="im-btn-secondary" onClick={() => setStep(2)} disabled={loading}>
                <i className="bi bi-arrow-left me-1" /> Back
              </button>
              <button
                className="im-btn-primary im-btn-confirm"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Importing...</>
                ) : (
                  <><i className="bi bi-cloud-arrow-up me-2" />Confirm Import</>
                )}
              </button>
            </>
          )}

          {step === 4 && (
            <button className="im-btn-primary" onClick={onClose}>
              <i className="bi bi-check-lg me-1" /> Done
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ImportModal;
