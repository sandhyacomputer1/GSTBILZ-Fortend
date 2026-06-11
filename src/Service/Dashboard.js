import axios from "axios";




export const fetchDashboardData = async () => {
    return await axios.get(`https://billingsoftwer.up.railway.app/dashboard`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}
