import axios from "axios";
import { API_BASE_URL } from "./api";

const BASE = `${API_BASE_URL}/admin/subscriptions`;
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Plans
export const getAllPlans = () => axios.get(`${BASE}/plans`, { headers: headers() });
export const createPlan = (data) => axios.post(`${BASE}/plans`, data, { headers: headers() });
export const updatePlan = (id, data) => axios.put(`${BASE}/plans/${id}`, data, { headers: headers() });
export const deletePlan = (id) => axios.delete(`${BASE}/plans/${id}`, { headers: headers() });
export const togglePlanStatus = (id) => axios.put(`${BASE}/plans/${id}/toggle-status`, {}, { headers: headers() });

// Subscriptions
export const getAllSubscriptions = () => axios.get(BASE, { headers: headers() });
export const assignSubscription = (data) => axios.post(BASE, data, { headers: headers() });
export const cancelSubscription = (id) => axios.put(`${BASE}/${id}/cancel`, {}, { headers: headers() });
export const getExpiringSoon = () => axios.get(`${BASE}/expiring-soon`, { headers: headers() });
export const getSubscriptionStats = () => axios.get(`${BASE}/stats`, { headers: headers() });
export const getPendingRenewalRequests = () => axios.get(`${API_BASE_URL}/admin/renewal-requests`, { headers: headers() });
export const requestSubscriptionRenewal = () => axios.post(`${API_BASE_URL}/subscription-renewal-request`, {}, { headers: headers() });

