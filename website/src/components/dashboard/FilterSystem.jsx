import React, { useState, useEffect } from 'react';

const FilterSystem = ({ 
  filters = [], 
  onFilterChange, 
  presets = [], 
  showPresets = true,
  showSearch = true
}) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedPresets, setSavedPresets] = useState(presets);
  const [presetName, setPresetName] = useState('');
  
  // Initialize filters with default values
  useEffect(() => {
    const initialFilters = {};
    filters.forEach(filter => {
      initialFilters[filter.id] = filter.defaultValue || (filter.type === 'checkbox' ? [] : '');
    });
    setActiveFilters(initialFilters);
  }, [filters]);
  
  // Notify parent component when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        filters: activeFilters,
        search: searchQuery
      });
    }
  }, [activeFilters, searchQuery, onFilterChange]);
  
  // Handle filter changes
  const handleFilterChange = (filterId, value) => {
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      [filterId]: value
    }));
  };
  
  // Handle checkbox filter changes
  const handleCheckboxChange = (filterId, value, isChecked) => {
    setActiveFilters(prevFilters => {
      const currentValues = prevFilters[filterId] || [];
      
      if (isChecked) {
        return {
          ...prevFilters,
          [filterId]: [...currentValues, value]
        };
      } else {
        return {
          ...prevFilters,
          [filterId]: currentValues.filter(v => v !== value)
        };
      }
    });
  };
  
  // Handle search queries
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {};
    filters.forEach(filter => {
      clearedFilters[filter.id] = filter.type === 'checkbox' ? [] : '';
    });
    setActiveFilters(clearedFilters);
    setSearchQuery('');
  };
  
  // Save current filter set as a preset
  const savePreset = () => {
    if (!presetName.trim()) return;
    
    const newPreset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      filters: { ...activeFilters },
      search: searchQuery
    };
    
    setSavedPresets(prevPresets => [...prevPresets, newPreset]);
    setPresetName('');
  };
  
  // Apply a preset
  const applyPreset = (preset) => {
    setActiveFilters(preset.filters);
    setSearchQuery(preset.search);
  };
  
  // Delete a preset
  const deletePreset = (presetId) => {
    setSavedPresets(prevPresets => prevPresets.filter(preset => preset.id !== presetId));
  };
  
  // Render different filter types
  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            id={filter.id}
            value={activeFilters[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All {filter.label}</option>
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-2">
            {filter.options.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${filter.id}-${option.value}`}
                  checked={(activeFilters[filter.id] || []).includes(option.value)}
                  onChange={(e) => handleCheckboxChange(filter.id, option.value, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor={`${filter.id}-${option.value}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id={`${filter.id}-all`}
                name={filter.id}
                value=""
                checked={activeFilters[filter.id] === ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`${filter.id}-all`} className="ml-2 text-sm text-gray-700">
                All
              </label>
            </div>
            {filter.options.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${filter.id}-${option.value}`}
                  name={filter.id}
                  value={option.value}
                  checked={activeFilters[filter.id] === option.value}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor={`${filter.id}-${option.value}`} className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        
      case 'range':
        return (
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={filter.min}
                max={filter.max}
                value={(activeFilters[filter.id] || [])[0] || filter.min}
                onChange={(e) => {
                  const newRange = [parseInt(e.target.value), (activeFilters[filter.id] || [])[1] || filter.max];
                  handleFilterChange(filter.id, newRange);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <span>to</span>
              <input
                type="number"
                min={filter.min}
                max={filter.max}
                value={(activeFilters[filter.id] || [])[1] || filter.max}
                onChange={(e) => {
                  const newRange = [(activeFilters[filter.id] || [])[0] || filter.min, parseInt(e.target.value)];
                  handleFilterChange(filter.id, newRange);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={(activeFilters[filter.id] || [])[0] || filter.min}
              onChange={(e) => {
                const newRange = [parseInt(e.target.value), (activeFilters[filter.id] || [])[1] || filter.max];
                handleFilterChange(filter.id, newRange);
              }}
              className="w-full mt-2"
            />
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={(activeFilters[filter.id] || [])[1] || filter.max}
              onChange={(e) => {
                const newRange = [(activeFilters[filter.id] || [])[0] || filter.min, parseInt(e.target.value)];
                handleFilterChange(filter.id, newRange);
              }}
              className="w-full"
            />
          </div>
        );
        
      case 'date':
        return (
          <input
            type="date"
            id={filter.id}
            value={activeFilters[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        );
        
      default:
        return (
          <input
            type="text"
            id={filter.id}
            value={activeFilters[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={filter.placeholder || `Filter by ${filter.label}`}
          />
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Advanced Filters</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-500"
        >
          <svg 
            className={`h-5 w-5 transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-6">
          {/* Search bar */}
          {showSearch && (
            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10 sm:text-sm"
                  placeholder="Search"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          
          {/* Filter grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filters.map(filter => (
              <div key={filter.id}>
                <label htmlFor={filter.id} className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
          
          {/* Presets section */}
          {showPresets && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Presets</h3>
              
              {/* Save new preset */}
              <div className="flex mb-4 gap-2">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Preset name"
                  className="block flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  onClick={savePreset}
                  disabled={!presetName.trim()}
                  className={`px-4 py-2 rounded-md text-sm text-white ${
                    presetName.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Save Current Filters
                </button>
              </div>
              
              {/* Preset list */}
              {savedPresets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedPresets.map(preset => (
                    <div
                      key={preset.id}
                      className="border border-gray-200 rounded-md p-3 flex justify-between items-center"
                    >
                      <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => applyPreset(preset)}
                          className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => deletePreset(preset.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No saved presets. Save the current filter configuration to create one.</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Active filters summary (always visible) */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([filterId, value]) => {
            // Skip empty filters
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            
            // Find filter definition
            const filter = filters.find(f => f.id === filterId);
            if (!filter) return null;
            
            // Render active filter badge
            return (
              <div key={filterId} className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                <span>{filter.label}: </span>
                <span className="ml-1 font-semibold">
                  {filter.type === 'select' || filter.type === 'radio' ? (
                    filter.options.find(o => o.value === value)?.label || value
                  ) : filter.type === 'checkbox' ? (
                    value.map(v => filter.options.find(o => o.value === v)?.label || v).join(', ')
                  ) : filter.type === 'range' ? (
                    `${value[0]} - ${value[1]}`
                  ) : (
                    value
                  )}
                </span>
                <button
                  onClick={() => handleFilterChange(filterId, filter.type === 'checkbox' ? [] : '')}
                  className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                >
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </div>
            );
          })}
          
          {searchQuery && (
            <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
              <span>Search: </span>
              <span className="ml-1 font-semibold">{searchQuery}</span>
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
              >
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Show this if no active filters */}
          {Object.values(activeFilters).every(value => !value || (Array.isArray(value) && value.length === 0)) && !searchQuery && (
            <span className="text-sm text-gray-500">No active filters</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSystem;