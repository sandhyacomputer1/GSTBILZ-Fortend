import axios from "axios";
import { API_BASE_URL } from "./api";

const BASE = `${API_BASE_URL}/notifications`;
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const getMyNotifications  = () => axios.get(BASE, { headers: headers() });
export const getUnreadCount      = () => axios.get(`${BASE}/unread-count`, { headers: headers() });
export const markNotificationRead = (id) => axios.put(`${BASE}/${id}/read`, {}, { headers: headers() });
export const markAllNotificationsRead = () => axios.put(`${BASE}/read-all`, {}, { headers: headers() });

export const getMySubscriptionStatus = () =>
    axios.get(`${API_BASE_URL}/subscription-status`, { headers: headers() });

export const getAdminContact = () =>
    axios.get(`${API_BASE_URL}/public/admin-contact`);
