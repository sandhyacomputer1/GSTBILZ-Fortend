import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const getHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});

export const sendWhatsAppBill = async (orderId) => {
    return await axios.post(`${BASE_URL}/api/invoices/${orderId}/send-whatsapp`, {}, getHeaders());
};

export const sendBulkWhatsAppBills = async (orderIds) => {
    return await axios.post(`${BASE_URL}/api/invoices/send-bulk-whatsapp`, { invoiceNumbers: orderIds }, getHeaders());
};

export const fetchWhatsAppLogs = async () => {
    return await axios.get(`${BASE_URL}/api/whatsapp/logs`, getHeaders());
};

export const fetchWhatsAppStats = async () => {
    return await axios.get(`${BASE_URL}/api/whatsapp/stats`, getHeaders());
};

export const toggleWhatsAppEnabled = async (userId, enabled) => {
    return await axios.put(`${BASE_URL}/admin/user/${userId}/whatsapp?enabled=${enabled}`, {}, getHeaders());
};
