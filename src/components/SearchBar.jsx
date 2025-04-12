// frontend/src/components/SearchBar.jsx
import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState('relevance');
  const [region, setRegion] = useState('');

  // --- Daftar Negara untuk Dropdown ---
  const regionOptions = [
    { value: '', label: 'Worldwide' },
    { value: 'ID', label: 'Indonesia (ID)' },
    { value: 'MY', label: 'Malaysia (MY)' },
    { value: 'SG', label: 'Singapore (SG)' },
    { value: 'US', label: 'United States (US)' },
    { value: 'JP', label: 'Japan (JP)' },
    { value: 'KR', label: 'South Korea (KR)' },
    { value: 'SA', label: 'Saudi Arabia (SA)' },
    { value: 'IN', label: 'India (IN)' },
    { value: 'KH', label: 'Cambodia (KH)' },
    { value: 'TH', label: 'Thailand (TH)' },
    { value: 'IL', label: 'Israel (IL)' },
  ];

  /**
   * Handles triggering the search/filter action.
   */
  const handleSearchTrigger = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      onSearch(trimmedQuery, order, region); // <-- Tambahkan region
    }
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleOrderChange = (event) => {
    setOrder(event.target.value);
  };

  // --- Handler Baru untuk Perubahan Region ---
  const handleRegionChange = (event) => {
    setRegion(event.target.value);
  };

  /**
   * Handles key press events on the query input field.
   */
  const handleKeyPress = (event) => {
    const trimmedQuery = query.trim();
    if (event.key === 'Enter' && trimmedQuery) {
        onSearch(trimmedQuery, order, region);
    }
  };

  const isSearchDisabled = !query.trim();

  return (
    <div className="search-container p-3 mb-3 border rounded" style={{ backgroundColor: 'var(--bg-content)' }}>
      {/* Input group sekarang berisi input, select order, select region, button */}
      <div className="input-group">
        <input
          type="text"
          id="searchInput"
          className="form-control"
          placeholder="Type to Search..."
          value={query}
          onChange={handleQueryChange}
          onKeyPress={handleKeyPress}
          aria-label="Type to Search"
        />
        {/* Select untuk Sort Order */}
        <select
          id="sortOrder"
          className="form-select flex-grow-0" // flex-grow-0 agar tidak terlalu lebar
          style={{ width: 'auto', minWidth: '120px' }} // Atur lebar otomatis atau min-width
          value={order}
          onChange={handleOrderChange}
          aria-label="Sort order for YouTube results"
        >
          <option value="relevance">Relevance</option>
          <option value="date">Date</option>
          <option value="viewCount">View Count</option>
          <option value="rating">Rating</option>
          <option value="title">Title</option>
        </select>

        {/* --- Select BARU untuk Region --- */}
        <select
          id="regionFilter"
          className="form-select flex-grow-0" // flex-grow-0 agar tidak terlalu lebar
          style={{ width: 'auto', minWidth: '160px' }} // Atur lebar otomatis atau min-width
          value={region} // Ikat ke state region
          onChange={handleRegionChange} // Panggil handler saat berubah
          aria-label="Filter YouTube results by region"
        >
          {/* Mapping dari regionOptions untuk membuat <option> */}
          {regionOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* ----------------------------- */}

        {/* Tombol Search */}
        <button
          id="searchButton"
          className="btn btn-primary"
          onClick={handleSearchTrigger}
          type="button"
          disabled={isSearchDisabled}
        >
           <i className="bi bi-search me-1"></i>
           Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;