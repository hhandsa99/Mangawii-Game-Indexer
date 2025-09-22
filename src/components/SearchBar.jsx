import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, searchQuery }) => {
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
      className="w-full max-w-2xl mx-auto px-2 sm:px-0 sticky top-20 sm:top-24 z-40"
    >
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="ابحث عن لعبة..."
          className="w-full pr-10 pl-4 text-right rounded-full border border-gray-300 dark:border-neutral-700 bg-gray-100 text-gray-900 dark:bg-[#3A3A3A] dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent py-3"
          autoComplete="off"
        />
        
        {searchQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={clearSearch}
            className="absolute inset-y-0 left-0 pl-3 flex items-center"
          >
            <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
              <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>
          </motion.button>
        )}
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
