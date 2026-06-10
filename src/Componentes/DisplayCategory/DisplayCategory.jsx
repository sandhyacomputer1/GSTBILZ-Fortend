import React from 'react';
import './DisplayCategory.css';
import Category from '../Category/Category';
import { assets } from '../../assets/assets';

const DisplayCategory = ({ selectedCategory, setSelectedCategory, categories }) => {
  return (
    <div className='category-grid-container'>

      {/* ALL ITEMS CARD */}
      <Category
        categoryName="All Items"
        imgUrl={null}
        numberOfItems={categories.reduce((acc, cat) => acc + (cat.items || 0), 0)}
        bgColor="#6757dd"
        isSelected={selectedCategory === ""}
        onClick={() => setSelectedCategory("")}
      />

      {/* CATEGORY LIST */}
      {categories.map(cat => (
        <Category
          key={cat.categoryId}
          categoryName={cat.name}
          imgUrl={cat.imgUrl}
          numberOfItems={cat.items}
          bgColor={cat.bgColor}
          isSelected={selectedCategory === cat.categoryId}
          onClick={() => setSelectedCategory(cat.categoryId)}
        />
      ))}

    </div>
  );
};

export default DisplayCategory;