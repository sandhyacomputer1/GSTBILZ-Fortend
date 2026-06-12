import axios from "axios";




export const fetchDashboardData = async () => {
    return await axios.get(`https://gstblizbackend.up.railway.app/dashboard`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}
