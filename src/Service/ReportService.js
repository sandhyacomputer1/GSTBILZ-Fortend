import axios from "axios";
import { API_BASE_URL } from "./api";

const BASE = API_BASE_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const fetchDailyReport = async (startDate, endDate) =>
    axios.get(`${BASE}/api/reports/daily`, {
        headers: authHeader(),
        params: { startDate, endDate }
    });

export const fetchWeeklyReport = async (startDate, endDate) =>
    axios.get(`${BASE}/api/reports/weekly`, {
        headers: authHeader(),
        params: { startDate, endDate }
    });

export const fetchMonthlyReport = async (startDate, endDate) =>
    axios.get(`${BASE}/api/reports/monthly`, {
        headers: authHeader(),
        params: { startDate, endDate }
    });

export const fetchYearlyReport = async (startDate, endDate) =>
    axios.get(`${BASE}/api/reports/yearly`, {
        headers: authHeader(),
        params: { startDate, endDate }
    });

export const fetchGSTReport = async (startDate, endDate) =>
    axios.get(`${BASE}/api/reports/gst`, {
        headers: authHeader(),
        params: { startDate, endDate }
    });

export const fetchProfitLossReport = async (startDate, endDate) =>
    axios.get(`${BASE}/api/reports/profit-loss`, {
        headers: authHeader(),
        params: { startDate, endDate }
    });

export const fetchBestSellingProducts = async (startDate, endDate, limit = 10) =>
    axios.get(`${BASE}/api/reports/best-selling`, {
        headers: authHeader(),
        params: { startDate, endDate, limit }
    });

export const downloadReportExcel = async (type, startDate, endDate) =>
    axios.get(`${BASE}/api/reports/export/excel`, {
        headers: authHeader(),
        params: { type, startDate, endDate },
        responseType: "blob"
    });

export const downloadReportPdf = async (type, startDate, endDate) =>
    axios.get(`${BASE}/api/reports/export/pdf`, {
        headers: authHeader(),
        params: { type, startDate, endDate },
        responseType: "blob"
    });
