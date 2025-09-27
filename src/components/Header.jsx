import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Gamepad2, LayoutGrid, List } from 'lucide-react';

const Header = ({ isDarkMode, onToggleDarkMode, totalGames, showSidebarHint = false, gridDensity = 'cozy', onChangeDensity, layoutMode = 'grid', onChangeLayout, onDismissHint, onRegisterHintAnchor }) => {
  const hintBtnRef = React.useRef(null);
  React.useEffect(() => {
    if (typeof onRegisterHintAnchor === 'function') onRegisterHintAnchor(hintBtnRef.current);
  }, [onRegisterHintAnchor]);
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 glass-effect border-b border-gray-200 dark:border-gray-700"
    >
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 xl:space-x-10 space-x-reverse">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6 lg:space-x-10 xl:space-x-12 2xl:space-x-16 space-x-reverse">
              <img 
                src={`${import.meta.env.BASE_URL}images/Site-logo.svg`} 
                alt="شعار الموقع" 
                className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 lg:ml-2 xl:ml-3 2xl:ml-4"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold leading-tight">
                  <span className="block sm:inline text-gradient">Technical Store</span>
                  <span className="mx-2 text-gray-400 dark:text-gray-500 hidden sm:inline">|</span>
                  <span className="block sm:inline text-gray-900 dark:text-gray-100">قسم الألعاب</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1 space-x-reverse">
                  <Gamepad2 className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{totalGames} لعبة متاحة</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
      {/* Dark mode toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleDarkMode}
        className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-300 dark:border-gray-600"
        aria-label="تبديل الوضع"
      >
        <motion.div
          animate={{ rotate: isDarkMode ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDarkMode ? (
            <Moon className="h-5 w-5 text-yellow-500" />
          ) : (
            <Sun className="h-5 w-5 text-orange-500" />
          )}
        </motion.div>
      </motion.button>
      {/* Grid/List toggle button (anchor for overlay hint) */}
      <div className="relative inline-block z-[50]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChangeLayout && onChangeLayout(layoutMode === 'grid' ? 'list' : 'grid')}
          ref={hintBtnRef}
          className={"relative p-3 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"}
          aria-label={layoutMode === 'grid' ? 'تبديل إلى القائمة الكلاسيكية' : 'تبديل إلى القائمة بالصور'}
          title={layoutMode === 'grid' ? 'القائمة الكلاسيكية' : 'القائمة بالصور'}
        >
          {layoutMode === 'grid' ? (
            <List className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          ) : (
            <LayoutGrid className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          )}
        </motion.button>
      </div>
    </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
