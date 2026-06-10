import React from 'react'
import './Category.css'

const Category = ({ categoryName, imgUrl, numberOfItems, bgColor, isSelected, onClick }) => {
  return (
    <button 
      className={`category-btn ${isSelected ? 'active' : ''}`}
      style={{ '--cat-bg': bgColor || '#475569' }}
      onClick={onClick}
      type="button"
    >
      <div className="category-btn-content">
        {imgUrl ? (
          <img src={imgUrl} alt={categoryName} className='category-btn-icon' />
        ) : (
          <div className='category-btn-icon-fallback'>
            <i className="bi bi-grid-fill"></i>
          </div>
        )}
        <span className='category-btn-name'>{categoryName}</span>
        <span className='category-btn-count'>{numberOfItems || 0}</span>
      </div>
    </button>
  )
}

export default Category