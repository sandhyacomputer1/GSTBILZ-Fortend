import axios from "axios";




export const fetchDashboardData = async () => {
    return await axios.get(`http://localhost:8080/dashboard`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}
