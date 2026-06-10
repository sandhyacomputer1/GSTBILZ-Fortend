import React, { useState } from 'react'
import { deleteUser } from '../../Service/UserService';
import { toggleWhatsAppEnabled } from '../../Service/WhatsAppService';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets';

const User_List = ({ users, setUsers, setEditingUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteByUserId = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    try {
      await deleteUser(id);
      setUsers(prevUsers => prevUsers.filter(user => user.userId !== id));
      toast.success('User deleted successfully');
    } catch (e) {
      console.error('Error deleting user:', e);
      toast.error('Unable to delete user. Please try again later.');
    }
  }

  const handleToggleWhatsApp = async (userId, checked) => {
    try {
      await toggleWhatsAppEnabled(userId, checked);
      setUsers(prevUsers => prevUsers.map(u =>
        u.userId === userId ? { ...u, whatsappEnabled: checked } : u
      ));
      toast.success(`WhatsApp service ${checked ? 'enabled' : 'disabled'} successfully!`);
    } catch (err) {
      console.error('Error toggling WhatsApp service:', err);
      toast.error('Failed to update WhatsApp setting.');
    }
  };
  return (
    <div className='manage-users-list-container d-flex flex-column h-100'>

      <div className='search-container mb-3 pe-2 d-flex gap-2 align-items-center'>
        <div className='position-relative flex-grow-1'>
          <span className='position-absolute top-50 translate-middle-y ps-3 text-muted' style={{ zIndex: 5 }}>
            <i className='bi bi-search'></i>
          </span>
          <input
            type='text'
            name='keyword'
            id='keyword'
            placeholder='Search users...'
            className='form-control finance-input ps-5'
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
      </div>

      <div className='users-scroll-list flex-grow-1 pe-2' style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
        <div className='row g-3'>
          {filteredUsers.map((user, index) => (
            <div key={index} className="col-12">
              <div className="manage-user-row p-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div style={{ marginRight: '15px' }}>
                    <img
                      src={user.profilePhotoUrl || assets.profile || 'https://placehold.co/150x150/202c33/ffffff/png?text=User'}
                      alt={user.name}
                      className="category-image"
                      style={{ borderRadius: '50%', objectFit: 'cover', width: '48px', height: '48px' }}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-1 text-white fw-semibold">{user.name}</h5>
                    <p className='mb-0 fs-7' style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                  </div>
                </div>
                <div className='d-flex align-items-center gap-3'>
                  {user.role === 'ROLE_SHOPOWNER' && (
                    <div className="form-check form-switch mb-0" title="Toggle WhatsApp service capability">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`whatsapp-switch-${user.userId}`}
                        checked={user.whatsappEnabled || false}
                        onChange={(e) => handleToggleWhatsApp(user.userId, e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label text-muted fs-8 ms-1 mb-0" htmlFor={`whatsapp-switch-${user.userId}`} style={{ fontSize: '11px' }}>
                        WhatsApp
                      </label>
                    </div>
                  )}
                  <div className="d-flex gap-2">
                    <button
                      className='btn btn-light btn-sm'
                      onClick={() => setEditingUser(user)}
                      title="Edit User"
                    >
                      <i className='bi bi-pencil'></i>
                    </button>
                    <button
                      className='btn item-delete-btn btn-sm'
                      onClick={() => deleteByUserId(user.userId)}
                      title="Delete User"
                    >
                      <i className='bi bi-trash'></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default User_List