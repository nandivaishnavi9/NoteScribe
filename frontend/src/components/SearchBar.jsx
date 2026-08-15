import React, { useState } from 'react';

export default function SearchBar({ onSearch, placeholder }) {
  const [keyword, setKeyword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(keyword.trim());
  }

  function handleChange(e) {
    const value = e.target.value;
    setKeyword(value);
    // Live search as the user types (also triggers on empty to reset list)
    onSearch(value.trim());
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={keyword}
        onChange={handleChange}
        placeholder={placeholder || 'Search your notes by keyword...'}
      />
      <button type="submit" className="btn btn-secondary">Search</button>
    </form>
  );
}
