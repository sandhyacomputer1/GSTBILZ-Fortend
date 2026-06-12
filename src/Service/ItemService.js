import axios from "axios";

const BASE = "https://gstblizbackend.up.railway.app";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// ─── CRUD ────────────────────────────────────────────────────────────────────────

export const addItem = async (item) =>
    axios.post(`${BASE}/admin/items`, item, { headers: authHeader() });

export const updateItem = async (itemId, formData) =>
    axios.put(`${BASE}/admin/items/${itemId}`, formData, { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } });

export const deleteItem = async (itemId) =>
    axios.delete(`${BASE}/admin/items/${itemId}`, { headers: authHeader() });

export const fetchItems = async () =>
    axios.get(`${BASE}/items`, { headers: authHeader() });

// ─── IMPORT: PHASE 1 — PREVIEW ────────────────────────────────────────────────────

/**
 * Upload a product file (.xlsx, .xls, .csv, .pdf, .docx) for parse + duplicate detection.
 * Returns an ImportSummaryResponse with previewItems[] — no data saved to DB yet.
 */
export const previewImport = async (formData) =>
    axios.post(`${BASE}/admin/items/import/preview`, formData, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    });

// ─── IMPORT: PHASE 2 — CONFIRM ────────────────────────────────────────────────────

/**
 * Confirm the import with a chosen duplicateMode: "SKIP" | "UPDATE" | "CREATE"
 * @param {Object} payload — { products: [...], duplicateMode: "SKIP" }
 */
export const confirmImport = async (payload) =>
    axios.post(`${BASE}/admin/items/import/confirm`, payload, {
        headers: { ...authHeader(), "Content-Type": "application/json" },
    });

// ─── EXPORT ────────────────────────────────────────────────────────────────────────

/**
 * Export products to a downloadable file.
 * @param {string} format     "EXCEL" | "CSV" | "PDF"
 * @param {string} category   optional filter
 * @param {string} brand      optional filter
 * @param {boolean} inStockOnly
 */
export const exportProducts = async ({ format = "EXCEL", category = "", brand = "", inStockOnly = false }) =>
    axios.get(`${BASE}/admin/items/export`, {
        headers: authHeader(),
        params: { format, category, brand, inStockOnly },
        responseType: "blob",
    });

// ─── TEMPLATE DOWNLOAD ─────────────────────────────────────────────────────────────

export const downloadImportTemplate = async () =>
    axios.get(`${BASE}/admin/items/import/template`, {
        headers: authHeader(),
        responseType: "blob",
    });

// ─── IMPORT HISTORY ────────────────────────────────────────────────────────────────

export const getImportHistory = async () =>
    axios.get(`${BASE}/admin/items/import/history`, { headers: authHeader() });

// ─── ZIP IMAGE IMPORT ──────────────────────────────────────────────────────────────

export const importZipImages = async (formData) =>
    axios.post(`${BASE}/admin/items/import/images`, formData, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    });

// ─── LEGACY (kept for backward-compat) ────────────────────────────────────────────

export const importExcelItems = async (formData) =>
    axios.post(`${BASE}/admin/items/import-excel`, formData, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    });

export const importPdfItems = async (formData) =>
    axios.post(`${BASE}/admin/items/import-pdf`, formData, {
        headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    });