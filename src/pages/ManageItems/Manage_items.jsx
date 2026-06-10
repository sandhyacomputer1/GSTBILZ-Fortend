import React from 'react'
import './Manage_items.css'
import Item_form from '../../Componentes/ItemForm/Item_form'
import Item_List from '../../Componentes/ItemList/Item_List'

const Manage_Items = () => {
  return (
    <div className='items-container text-light'>
      <div className='left-column glass-panel'>
        <Item_form />
      </div>
      <div className='right-column glass-panel'>
        <Item_List />
      </div>
    </div>
  )
}

export default Manage_Items