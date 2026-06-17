import React, { useState } from 'react';

const SearchBox = ({ onSearch }) => {

    const [searchText, setSearchText] = useState("");

    const handleInputChange = (e) => {
        const text = e.target.value;
        setSearchText(text);
        onSearch(text);
    };

    return (
        <div className='position-relative w-100 mb-3'>
            <input
                type="text"
                className='form-control finance-input w-100'
                style={{ paddingRight: '40px' }}
                placeholder='Search items...'
                value={searchText}
                onChange={handleInputChange}
            />
            <i 
                className="bi bi-search position-absolute end-0 top-50 translate-middle-y me-3 text-secondary"
                style={{ pointerEvents: 'none' }}
            ></i>
        </div>
    );
};

export default SearchBox;