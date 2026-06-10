import React, { useEffect, useState } from 'react'
import './Manage_users.css'
import User_form from '../../Componentes/UserForm/User_form'
import User_List from '../../Componentes/UserList/User_List'
import { fetchUsers } from '../../Service/UserService';
import toast from 'react-hot-toast';

/**
 * Manage Users dashboard page.
 * Loads all system users from the database on mount and displays:
 * - Left column: form to register/create new users.
 * - Right column: list of all existing users with options to delete.
 */
const Manage_Users = () => {
  // Local state to keep track of the registered users list
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() =>{
      async function loadUsers(){
        try{
          const response = await fetchUsers();
          setUsers(response.data);
        }catch(error){  
          console.error('Error fetching users:', error);
          toast.error('Unable to fetch users. Please try again later.');
        }
      }
      loadUsers();
      
  },[]);

  return (
    <div className='users-container text-light'>
      <div className='left-column glass-panel'>
        <User_form setUsers={setUsers} editingUser={editingUser} setEditingUser={setEditingUser} />
      </div>
      <div className='right-column glass-panel'>
        <User_List users={users} setUsers={setUsers} setEditingUser={setEditingUser} />
      </div>
    </div>
  )
}

export default Manage_Users