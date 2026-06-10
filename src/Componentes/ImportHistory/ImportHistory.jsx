import React, { useEffect, useState } from "react";
import { getImportHistory } from "../../Service/ItemService";
import toast from "react-hot-toast";
import "./ImportHistory.css";

/**
 * Import History page — lists all past import operations.
 * Shows stats per import and allows filtering by status.
 */
const ImportHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getImportHistory();
        setHistory(res.data);
      } catch (err) {
        toast.error("Failed to load import history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = history.filter((h) =>
    (h.fileName || "").toLowerCase().includes(search.toLowerCase()) ||
    (h.fileType || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const successRate = (h) => {
    if (!h.totalRecords) return 0;
    return Math.round((h.successCount / h.totalRecords) * 100);
  };

  const fileTypeIcon = (type) => {
    const map = {
      EXCEL: "bi-file-excel text-emerald",
      CSV:   "bi-filetype-csv text-cyan",
      PDF:   "bi-file-pdf text-rose",
      DOCX:  "bi-file-word text-indigo",
      MULTI: "bi-files text-indigo",
    };
    return map[type] || "bi-file-earmark text-secondary";
  };

  return (
    <div className="ih-container text-light">
      <div className="ih-header">
        <div className="ih-header-left">
          <h4 className="ih-title text-gradient-indigo">
            <i className="bi bi-clock-history me-2" />
            Import History
          </h4>
          <p className="ih-subtitle">Track all past product import operations</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="ih-summary-cards">
        <div className="ih-sum-card glass-panel">
          <div className="ih-sum-num text-gradient-indigo">{history.length}</div>
          <div className="ih-sum-lbl">Total Imports</div>
        </div>
        <div className="ih-sum-card glass-panel">
          <div className="ih-sum-num text-gradient-emerald">
            {history.reduce((a, h) => a + h.successCount, 0).toLocaleString()}
          </div>
          <div className="ih-sum-lbl">Total Products Saved</div>
        </div>
        <div className="ih-sum-card glass-panel">
          <div className="ih-sum-num" style={{ color: "var(--neon-rose)" }}>
            {history.reduce((a, h) => a + h.failedCount, 0).toLocaleString()}
          </div>
          <div className="ih-sum-lbl">Total Failed</div>
        </div>
        <div className="ih-sum-card glass-panel">
          <div className="ih-sum-num" style={{ color: "var(--neon-blue)" }}>
            {history.reduce((a, h) => a + h.duplicatesFound, 0).toLocaleString()}
          </div>
          <div className="ih-sum-lbl">Duplicates Handled</div>
        </div>
      </div>

      {/* Search */}
      <div className="ih-search-bar glass-panel">
        <i className="bi bi-search text-secondary" />
        <input
          type="text"
          placeholder="Search by file name or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ih-search-input"
        />
        {search && (
          <button className="ih-clear-btn" onClick={() => setSearch("")}>
            <i className="bi bi-x-lg" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="ih-table-card glass-panel">
        {loading ? (
          <div className="ih-loading">
            <div className="spinner-border text-indigo" />
            <span>Loading history...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ih-empty">
            <i className="bi bi-inbox fs-1 text-secondary d-block mb-3" />
            <h5>No import records found</h5>
            <p className="text-secondary small">
              {search ? "Try a different search term." : "Import some products to see history here."}
            </p>
          </div>
        ) : (
          <div className="ih-table-wrap">
            <table className="ih-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Saved</th>
                  <th>Failed</th>
                  <th>Dups</th>
                  <th>Time</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h, idx) => {
                  const rate = successRate(h);
                  return (
                    <tr key={h.id || idx}>
                      <td className="ih-td-num">{idx + 1}</td>
                      <td className="ih-td-file">
                        <i className={`bi ${fileTypeIcon(h.fileType)} me-2`} />
                        <span title={h.fileName}>{h.fileName || "batch-import"}</span>
                      </td>
                      <td>
                        <span className={`ih-type-badge ${(h.fileType || "").toLowerCase()}`}>
                          {h.fileType || "—"}
                        </span>
                      </td>
                      <td className="ih-td-date">{formatDate(h.createdAt)}</td>
                      <td className="ih-td-center">{h.totalRecords}</td>
                      <td className="ih-td-center ih-td-success">{h.successCount}</td>
                      <td className="ih-td-center ih-td-fail">{h.failedCount}</td>
                      <td className="ih-td-center ih-td-dup">{h.duplicatesFound}</td>
                      <td className="ih-td-center ih-td-time">
                        {h.processingTimeMs >= 1000
                          ? `${(h.processingTimeMs / 1000).toFixed(1)}s`
                          : `${h.processingTimeMs}ms`}
                      </td>
                      <td>
                        <div className="ih-rate-wrap">
                          <div
                            className={`ih-rate-bar ${rate >= 80 ? "good" : rate >= 50 ? "mid" : "bad"}`}
                            style={{ width: `${rate}%` }}
                          />
                          <span className="ih-rate-label">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportHistory;
