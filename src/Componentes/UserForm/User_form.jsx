import React, { useState, useEffect } from 'react';
import { addUser, updateUser } from '../../Service/UserService';
import toast from "react-hot-toast";

const User_form = ({ setUsers, editingUser, setEditingUser }) => {

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(false);
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        role: "ROLE_USER",
        shopName: '',
        shopAddress: '',
        shopWebsite: '',
        shopMobile: '',
        shopEmail: '',
        gstNumber: ''
    });

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    }

    useEffect(() => {
        if (editingUser) {
            setData({
                name: editingUser.name || '',
                email: editingUser.email || '',
                password: '',
                role: editingUser.role || 'ROLE_USER',
                shopName: editingUser.shopName || '',
                shopAddress: editingUser.shopAddress || '',
                shopWebsite: editingUser.shopWebsite || '',
                shopMobile: editingUser.shopMobile || '',
                shopEmail: editingUser.shopEmail || '',
                gstNumber: editingUser.gstNumber || ''
            });
        } else {
            setData({
                name: '',
                email: '',
                password: '',
                role: 'ROLE_USER',
                shopName: '',
                shopAddress: '',
                shopWebsite: '',
                shopMobile: '',
                shopEmail: '',
                gstNumber: ''
            });
        }
        setImage(false);
        setProfilePhoto(false);
    }, [editingUser]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("user", JSON.stringify(data));
        if (image) {
            formData.append("file", image);
        }
        if (profilePhoto) {
            formData.append("profilePhoto", profilePhoto);
        }

        try {
            if (editingUser) {
                const response = await updateUser(editingUser.userId, formData);
                setUsers((prevUsers) => prevUsers.map(user => user.userId === editingUser.userId ? response.data : user));
                toast.success('User and Shop updated successfully!');
                setEditingUser(null);
            } else {
                const response = await addUser(formData);
                setUsers((prevUsers) => [...prevUsers, response.data]);
                toast.success('User and Shop added successfully!');
            }
            setData({
                name: "",
                email: "",
                password: "",
                role: "ROLE_USER",
                shopName: '',
                shopAddress: '',
                shopWebsite: '',
                shopMobile: '',
                shopEmail: '',
                gstNumber: ''
            });
            setImage(false);
            setProfilePhoto(false);
        } catch (e) {
            console.error('Error saving user:', e);
            toast.error(editingUser ? 'Unable to update user. Please try again later.' : 'Unable to add user. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='user-form-container d-flex flex-column h-100' style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)', paddingRight: '6px' }}>
            <form onSubmit={onSubmitHandler}>

                <div className='d-flex justify-content-between align-items-center mb-3'>
                    <h6 className="text-warning mb-0">{editingUser ? 'Edit Shop Owner' : 'User Details'}</h6>
                    {editingUser && (
                        <button type="button" className='btn btn-sm btn-outline-secondary' onClick={() => setEditingUser(null)}>
                            Cancel Edit
                        </button>
                    )}
                </div>

                {/* Side-by-side Uploader Row */}
                <div className="row g-3 mb-4">
                    {/* Profile Photo Upload */}
                    <div className="col-6 text-center">
                        <label htmlFor="profilePhotoFile" className="form-label cursor-pointer p-3 rounded d-inline-block border border-dashed border-secondary w-100 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: 'rgba(255,255,255,0.02)', minHeight: '140px' }}>
                            <div className="profile-photo-preview-box mx-auto mb-2" style={{ width: '56px', height: '56px' }}>
                                <img
                                    src={profilePhoto ? URL.createObjectURL(profilePhoto) : (editingUser?.profilePhotoUrl ? editingUser.profilePhotoUrl : "https://placehold.co/100x100/202c33/ffffff/png?text=Profile")}
                                    alt="Profile Preview"
                                    className="profile-photo-preview-img"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            </div>
                            <div className="fs-8  text-lignt">{editingUser && !profilePhoto ? 'Change Avatar' : 'Upload profile '}</div>
                        </label>
                        <input
                            type="file"
                            name="profilePhotoFile"
                            id="profilePhotoFile"
                            accept="image/*"
                            className="d-none"
                            onChange={(e) => setProfilePhoto(e.target.files[0])}
                        />
                    </div>

                    {/* Shop Logo Upload */}
                    <div className="col-6 text-center">
                        <label htmlFor="shopImage" className="form-label cursor-pointer p-3 rounded d-inline-block border border-dashed border-secondary w-100 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: 'rgba(255,255,255,0.02)', minHeight: '140px' }}>
                            <div className="mx-auto mb-2" style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden' }}>
                                <img
                                    src={image ? URL.createObjectURL(image) : (editingUser?.shopLogoUrl ? editingUser.shopLogoUrl : "https://placehold.co/100x100/202c33/ffffff/png?text=Logo")}
                                    alt="Shop Logo"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div className="fs-8 text-white">{editingUser && !image ? 'Change Logo' : 'Shop Logo'}</div>
                        </label>
                        <input
                            type="file"
                            name="shopImage"
                            id="shopImage"
                            accept="image/*"
                            className="d-none"
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </div>
                </div>

                <div className='mb-3'>
                    <label htmlFor='name' className='form-label fs-8 text-muted'>Name</label>
                    <input type="text" name='name' id='name' className='form-control finance-input' placeholder='First Name, Last Name'
                        onChange={onChangeHandler}
                        value={data.name} required />
                </div>
                <div className='mb-3'>
                    <label htmlFor='email' className='form-label fs-8 text-muted'>Login Email</label>
                    <input type="email" name='email' id='email' className='form-control finance-input' placeholder='yourname@gmail.com'
                        onChange={onChangeHandler}
                        value={data.email} required />
                </div>
                <div className='mb-4'>
                    <label htmlFor='password' className='form-label fs-8 text-muted'>Password {editingUser && '(Leave blank to keep unchanged)'}</label>
                    <input type="password" name='password' id='password' className='form-control finance-input' placeholder={editingUser ? 'Enter new password' : 'Enter your password'}
                        onChange={onChangeHandler}
                        value={data.password} required={!editingUser} />
                </div>

                <h6 className="text-warning mb-3 border-top pt-3 border-secondary">Shop Details (Optional)</h6>

                <div className='mb-3'>
                    <label className='form-label fs-8 text-muted'>Shop Name</label>
                    <input type="text" name='shopName' className='form-control finance-input' placeholder='E.g. Supermarket Billing'
                        onChange={onChangeHandler} value={data.shopName} />
                </div>
                <div className='mb-3'>
                    <label className='form-label fs-8 text-muted'>Shop Address</label>
                    <input type="text" name='shopAddress' className='form-control finance-input' placeholder='123 Market Street, City'
                        onChange={onChangeHandler} value={data.shopAddress} />
                </div>
                <div className='row mb-3'>
                    <div className='col-6'>
                        <label className='form-label fs-8 text-muted'>Shop Mobile</label>
                        <input type="text" name='shopMobile' className='form-control finance-input' placeholder='+91 9876543210'
                            onChange={onChangeHandler} value={data.shopMobile} />
                    </div>
                    <div className='col-6'>
                        <label className='form-label fs-8 text-muted'>Shop Email</label>
                        <input type="email" name='shopEmail' className='form-control finance-input' placeholder='shop@email.com'
                            onChange={onChangeHandler} value={data.shopEmail} />
                    </div>
                </div>
                <div className='row mb-4'>
                    <div className='col-6'>
                        <label className='form-label fs-8 text-muted'>Website</label>
                        <input type="text" name='shopWebsite' className='form-control finance-input' placeholder='www.myshop.com'
                            onChange={onChangeHandler} value={data.shopWebsite} />
                    </div>
                    <div className='col-6'>
                        <label className='form-label fs-8 text-muted'>GST Number</label>
                        <input type="text" name='gstNumber' className='form-control finance-input' placeholder='E.g. 22AAAAA1111A1Z1'
                            onChange={onChangeHandler} value={data.gstNumber} />
                    </div>
                </div>

                <button type='submit' className='btn btn-warning w-100 py-2.5 fw-bold' disabled={loading}>
                    {loading ? 'Saving...' : (editingUser ? 'Update User & Shop Profile' : 'Create User & Shop Profile')}
                </button>
            </form>
        </div>
    )
}

export default User_form;