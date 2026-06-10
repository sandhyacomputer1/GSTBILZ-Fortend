import React from 'react'
import './Manage_Categories.css'
import Category_Form from '../../Componentes/CategoryForm/Category_Form'
import Category_List from '../../Componentes/CategoryList/Category_List'

const Manage_Categories = () => {
  return (
    <div className='category-container text-light'>
      <div className='left-column glass-panel'>
        <Category_Form />
      </div>
      <div className='right-column glass-panel'>
        <Category_List />
      </div>
    </div>
  )
}

export default Manage_Categories