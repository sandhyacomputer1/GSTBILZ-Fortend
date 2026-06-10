import React, { useEffect, useState } from 'react'
import EmployeeForm from '../../Componentes/EmployeeForm/EmployeeForm'
import User_List from '../../Componentes/UserList/User_List'
import { fetchUsers } from '../../Service/UserService';
import toast from 'react-hot-toast';

/**
 * Manage Employees dashboard page for Shop Owners.
 * - Left column: simplified form to add employees.
 * - Right column: list of all existing employees with options to delete.
 */
const ManageEmployees = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetchUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Unable to fetch employees. Please try again later.');
      }
    }
    loadUsers();
  }, []);

  return (
    <div className='users-container text-light'>
      <div className='left-column'>
        <EmployeeForm setUsers={setUsers} />
      </div>
      <div className='right-column'>
        {/* We reuse the User_List component because it just takes a list of users */}
        <User_List users={users} setUsers={setUsers} />
      </div>
    </div>
  )
}

export default ManageEmployees;
