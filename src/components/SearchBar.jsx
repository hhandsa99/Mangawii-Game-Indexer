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
        <div className="flex items-center gap-2 rounded-md border-none bg-[#1E1F22] px-3 py-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#5865F2]">
          <Search className="h-5 w-5 text-[#949BA4]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="ابحث باسم اللعبة..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-[#949BA4] text-right font-['gg_sans']"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => inputRef.current && inputRef.current.focus()}
            className="text-sm px-3 py-1.5 rounded-sm bg-[#5865F2] text-white hover:bg-[#4752C4] font-medium transition-colors"
          >
            بحث
          </button>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="ml-1 p-1 rounded-full bg-[#2B2D31] hover:bg-[#35373C] transition-colors"
              aria-label="مسح البحث"
            >
              <X className="h-4 w-4 text-gray-400" />
            </motion.button>
          )}
        </div>
      </div>

      {searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-[#949BA4] text-center"
        >
          عرض {searchQuery ? 'النتائج المفلترة' : 'جميع الألعاب'}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchBar;
