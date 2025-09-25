import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Gamepad2, Menu, X } from 'lucide-react';

const Header = ({ isDarkMode, onToggleDarkMode, totalGames, isSidebarOpen = false, onToggleSidebar, activeSection = 'offline', onChangeSection, showSidebarHint = false, gridDensity = 'cozy', onChangeDensity }) => {
  // Close sidebar with Escape key
  React.useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onToggleSidebar && onToggleSidebar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSidebarOpen, onToggleSidebar]);
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
                src={`${import.meta.env.BASE_URL}images/circular_logo.svg`} 
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
      {/* Sidebar toggle inside header: always on the right */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleSidebar}
        animate={{ x: isSidebarOpen ? -256 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={isSidebarOpen ? 'إغلاق القائمة الجانبية' : 'فتح القائمة الجانبية'}
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        ) : (
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        )}
      </motion.button>
    </div>
        </div>
      </div>

      {/* Sidebar via portal (always-mounted portal, conditional content with AnimatePresence) */}
      {createPortal(
        (
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                {/* Backdrop overlay closes on click */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[900] bg-black/60 backdrop-blur-sm"
                  onClick={onToggleSidebar}
                />
                <motion.aside
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  className="fixed top-[64px] right-0 z-[910] w-64 max-w-[80vw] h-[calc(100vh-64px)] bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 p-4 shadow-xl"
                >
          {/* Close button inside sidebar */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-700 dark:text-gray-200">القائمة</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </motion.button>
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">الأقسام</h3>
            <div className="space-y-2">
              <button
                className={`w-full text-right px-3 py-2 rounded-md border ${activeSection === 'offline' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-neutral-700'}`}
                onClick={() => onChangeSection && onChangeSection('offline')}
              >
                الألعاب أوفلاين
              </button>
              <button
                className={`w-full text-right px-3 py-2 rounded-md border ${activeSection === 'online' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-neutral-700'}`}
                onClick={() => onChangeSection && onChangeSection('online')}
              >
                الألعاب أونلاين
              </button>
              <button
                className={`w-full text-right px-3 py-2 rounded-md border ${activeSection === 'all' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-neutral-700'}`}
                onClick={() => onChangeSection && onChangeSection('all')}
              >
                الكل
              </button>
            </div>
          </div>

              
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        ),
        document.body
      )}
    </motion.header>
  );
};

export default Header;
