import axios from "axios";
import { API_BASE_URL } from "./api";

export const fetchDashboardData = async () => {
    return await axios.get(`${API_BASE_URL}/dashboard`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}
