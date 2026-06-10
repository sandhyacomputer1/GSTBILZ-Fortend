import React, { useState } from 'react';
import { addUser } from '../../Service/UserService';
import toast from "react-hot-toast";

const EmployeeForm = ({ setUsers }) => {

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        role: "ROLE_EMPLOYEE" // The backend overrides this anyway, but good for clarity
    });

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("user", JSON.stringify(data));
        // No image needed for an employee, but backend accepts multipart/form-data

        try {
            const response = await addUser(formData);
            setUsers((prevUsers) => [...prevUsers, response.data]);
            toast.success('Employee added successfully!');
            setData({
                name: "",
                email: "",
                password: "",
                role: "ROLE_EMPLOYEE"
            });
        } catch (e) {
            console.error('Error adding employee:', e);
            toast.error('Unable to add employee. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='employee-form-container' style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
            <div className='mx-1'>
                <form onSubmit={onSubmitHandler}>

                    <div className='mb-3'>
                        <h6 className="text-white mb-0">Employee Details</h6>
                    </div>

                    <div className='mb-3'>
                        <label htmlFor='name' className='form-label text-primary fs-8 fw-semibold text-uppercase'>Full Name</label>
                        <input
                            type="text"
                            name='name'
                            id='name'
                            className='form-control finance-input'
                            placeholder='E.g. John Doe'
                            onChange={onChangeHandler}
                            value={data.name}
                            required
                        />
                    </div>

                    <div className='mb-3'>
                        <label htmlFor='email' className='form-label text-primary fs-8 fw-semibold text-uppercase'>Login Email</label>
                        <input
                            type="email"
                            name='email'
                            id='email'
                            className='form-control finance-input'
                            placeholder='employee@gmail.com'
                            onChange={onChangeHandler}
                            value={data.email}
                            required
                        />
                    </div>

                    <div className='mb-4'>
                        <label htmlFor='password' className='form-label text-primary fs-8 fw-semibold text-uppercase'>Password</label>
                        <input
                            type="password"
                            name='password'
                            id='password'
                            className='form-control finance-input'
                            placeholder='Enter password'
                            onChange={onChangeHandler}
                            value={data.password}
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        className='btn settings-save-btn w-100 py-2.5 fw-bold'
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Add Employee'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EmployeeForm;
