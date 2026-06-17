import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { addCategory, updateCategory } from '../../Service/CategoryService';

const Category_Form = ({ onClose }) => {

    const { categories, setCategories, editingCategory, setEditingCategory } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(false);

    const [data, setData] = useState({
        name: '',
        description: '',
        bgColor: '#2c2c2c'
    });

    useEffect(() => {
        if (editingCategory) {
            setData({
                name: editingCategory.name || '',
                description: editingCategory.description || '',
                bgColor: editingCategory.bgColor || '#2c2c2c'
            });
        } else {
            setData({
                name: '',
                description: '',
                bgColor: '#2c2c2c'
            });
        }
        setImage(false);
    }, [editingCategory]);

    const onChangeHandler = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        setData({ ...data, [name]: value });
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!editingCategory && !image) {
            toast.error('Please select an image');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('category', JSON.stringify(data));
        if (image) {
            formData.append('file', image);
        }

        try {
            let response;
            if (editingCategory) {
                response = await updateCategory(editingCategory.categoryId, formData);
                if (response.status === 200 || response.status === 204) {
                    setCategories(categories.map(cat => cat.categoryId === editingCategory.categoryId ? response.data : cat));
                    toast.success('Category updated successfully');
                    setEditingCategory(null);
                    onClose?.();
                }
            } else {
                response = await addCategory(formData);
                if (response.status === 201) {
                    setCategories([...categories, response.data]);
                    toast.success('Category added successfully');
                    onClose?.();
                }
            }

            if (!editingCategory) {
                setData({
                    name: '',
                    description: '',
                    bgColor: '#2c2c2c'
                });
                setImage(false);
            }
        } catch (err) {
            console.log(err);
            toast.error(editingCategory ? 'Error updating category' : 'Error adding category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='category-form-container'>
            <div className='mx-1'>
                <form onSubmit={onSubmitHandler}>

                    <div className='mb-3 text-center'>
                        <label htmlFor='image' className='form-label cursor-pointer p-3 rounded d-inline-block border border-dashed border-secondary' style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <img
                                src={image ? URL.createObjectURL(image) : (editingCategory?.imgUrl ? editingCategory.imgUrl : assets.upload)}
                                alt=""
                                width={48}
                                style={editingCategory?.imgUrl && !image ? { borderRadius: '8px', objectFit: 'cover', width: '48px', height: '48px' } : {}}
                            />
                            <div className="fs-8 text-white mt-2">{editingCategory && !image ? 'Change Image' : 'Upload Image'}</div>
                        </label>

                        <input
                            type='file'
                            name='image'
                            id='image'
                            className='form-control'
                            hidden
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </div>

                    <div className='mb-3'>
                        <label htmlFor='name' className='form-label text-muted fs-8 fw-semibold text-uppercase'>Name</label>
                        <input
                            type="text"
                            name='name'
                            id='name'
                            className='form-control finance-input'
                            placeholder='Category Name'
                            onChange={onChangeHandler}
                            value={data.name}
                            required
                        />
                    </div>

                    <div className='mb-3'>
                        <label htmlFor='description' className='form-label text-muted fs-8 fw-semibold text-uppercase'>Description</label>
                        <textarea
                            rows="3"
                            name='description'
                            id='description'
                            className='form-control finance-input'
                            placeholder='Write description here...'
                            onChange={onChangeHandler}
                            value={data.description}
                        />
                    </div>

                    <div className='mb-3'>
                        <label htmlFor='bgColor' className='form-label text-muted fs-8 fw-semibold text-uppercase'>Background Color</label>
                        <div className='d-flex align-items-center gap-2'>
                            <input
                                type="color"
                                name='bgColor'
                                id='bgColor'
                                className='form-control-color finance-input p-1'
                                style={{ width: '48px', height: '38px', cursor: 'pointer' }}
                                onChange={onChangeHandler}
                                value={data.bgColor}
                            />
                            <span className='text-muted fs-7'>{data.bgColor}</span>
                        </div>
                    </div>

                    <div className='d-flex gap-2 mt-4'>
                        <button
                            type='button'
                            className='btn item-form-cancel-btn flex-grow-1 fw-semibold py-2'
                            onClick={() => {
                                setEditingCategory(null);
                                onClose?.();
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='btn settings-save-btn flex-grow-1 fw-bold py-2'
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Save Category')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Category_Form;