import axios from 'axios';

const getHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});

export const fetchShopOwners = async () => {
    return await axios.get(`https://billingsoftwer.up.railway.app/admin/shop-owners`, getHeaders());
};

export const approveShop = async (userId) => {
    return await axios.put(`https://billingsoftwer.up.railway.app/admin/shop-owners/${userId}/approve`, {}, getHeaders());
};

export const rejectShop = async (userId) => {
    return await axios.put(`https://billingsoftwer.up.railway.app/admin/shop-owners/${userId}/reject`, {}, getHeaders());
};

export const toggleDisableShop = async (userId) => {
    return await axios.put(`https://billingsoftwer.up.railway.app/admin/shop-owners/${userId}/disable`, {}, getHeaders());
};

export const toggleWhatsAppCapability = async (userId) => {
    return await axios.put(`https://billingsoftwer.up.railway.app/admin/shop-owners/${userId}/toggle-whatsapp`, {}, getHeaders());
};
