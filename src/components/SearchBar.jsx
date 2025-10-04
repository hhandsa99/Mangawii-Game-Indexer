import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, searchQuery }) => {
  const inputRef = React.useRef(null);
  const handleInputChange = (e) => {
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    onSearch('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 shadow-sm">
          <Search className="h-5 w-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="ابحث باسم اللعبة..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 text-right"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => inputRef.current && inputRef.current.focus()}
            className="text-sm px-3 py-1.5 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            بحث
          </button>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="ml-1 p-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="مسح البحث"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </motion.button>
          )}
        </div>
      </div>
      
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center"
        >
          عرض {searchQuery ? 'النتائج المفلترة' : 'جميع الألعاب'}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchBar;
