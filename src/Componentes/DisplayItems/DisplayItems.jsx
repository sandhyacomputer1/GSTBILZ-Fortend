import React, { useContext } from 'react'

import { AppContext } from '../../context/AppContext';
import './DisplayItems.css'
import Item from '../Item/Item';


const DisplayItems = ({ selectedCategory, searchText }) => {
  const { itemData } = useContext(AppContext);

  const filteredItems = itemData
    .filter(item => {
      if (!selectedCategory) return true;
      return item.categoryId === selectedCategory;
    })
    .filter(item =>
      (item.name || "")
        .toLowerCase()
        .includes((searchText || "").toLowerCase())
    );
  return (
    <div className='p-3'>
      <div className='row g-3'>
        {filteredItems.map((item, index) => (
          <div key={index} className='col-xl-4 col-md-6 col-12'>
            <Item
              itemName={item.name}
              itemPrice={item.price}
              itemImage={item.imgUrl}
              itemId={item.itemId}
              gstPercentage={item.gstPercentage}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default DisplayItems