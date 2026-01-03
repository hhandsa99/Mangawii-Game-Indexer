import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Gamepad2, LayoutGrid, List, Palette } from 'lucide-react';

const Header = ({ isDarkMode, onToggleDarkMode, onSetDarkMode, totalGames, collapsed = false, hidden = false, embedded = false, showSidebarHint = false, gridDensity = 'cozy', onChangeDensity, layoutMode = 'grid', onChangeLayout, onDismissHint, onRegisterHintAnchor, section, onChangeSection, searchValue, onSearchChange, count }) => {
  const hintBtnRef = React.useRef(null);
  const themeBtnRef = React.useRef(null);
  const [themeOpen, setThemeOpen] = React.useState(false);
  React.useEffect(() => {
    if (typeof onRegisterHintAnchor === 'function') onRegisterHintAnchor(hintBtnRef.current);
  }, [onRegisterHintAnchor]);
  React.useEffect(() => {
    const onDoc = (e) => {
      if (!themeBtnRef.current) return;
      if (!themeBtnRef.current.contains(e.target)) setThemeOpen(false);
    };
    document.addEventListener('mousedown', onDoc, true);
    return () => document.removeEventListener('mousedown', onDoc, true);
  }, []);
  return (
    <motion.header
      initial={{ opacity: 0, y: embedded ? 0 : -20 }}
      animate={{ opacity: embedded ? 1 : (hidden ? 0 : 1), y: embedded ? 0 : (hidden ? -40 : 0) }}
      transition={{ duration: 0.25 }}
      className={`${embedded ? 'bg-transparent' : 'sticky top-0 z-[60]'} transition-transform duration-200 ${embedded ? '' : (hidden ? '-translate-y-full pointer-events-none' : 'translate-y-0')}`}
    >
      <div className={`mx-auto px-4 sm:px-6 xl:px-8 ${collapsed ? 'py-1.5 sm:py-2' : 'py-2.5 sm:py-3'} max-w-[1423px] transition-all duration-200`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 xl:space-x-10 space-x-reverse">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6 lg:space-x-10 xl:space-x-12 2xl:space-x-16 space-x-reverse">
              <img 
                src={`${import.meta.env.BASE_URL}images/Site-logo.svg`} 
                alt="شعار الموقع" 
                className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 lg:ml-2 xl:ml-3 2xl:ml-4"
              />
              <div className="min-w-0">
                <h1 className={`font-bold leading-tight transition-all duration-200 ${collapsed ? 'text-base sm:text-xl' : 'text-lg sm:text-xl'}`}>
                  <span className="block sm:inline" style={{ color: '#039be4' }}>TECHNICAL STORE</span>
                  <span className="mx-2 text-gray-400 dark:text-gray-500 hidden md:inline">|</span>
                  <span className="hidden md:inline text-gray-900 dark:text-gray-200">قسم الألعاب</span>
                </h1>
              </div>
            </div>
          </div>
          {/* Middle removed: search and filters moved to StickySubHeader */}

          <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Theme toggle direct */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggleDarkMode && onToggleDarkMode()}
        className="p-2.5 sm:p-3 rounded-lg transition-colors duration-200 border"
        style={{ background: isDarkMode ? '#27292F' : '#eef2f7', borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
        aria-label="التبديل بين الوضعين"
        title="التبديل بين الوضعين"
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5" style={{ color: '#FCD34D' }} />
        ) : (
          <Moon className="h-5 w-5" style={{ color: '#039be4' }} />
        )}
      </motion.button>
      {/* Grid/List toggle button (anchor for overlay hint) */}
      <div className="relative inline-block z-[50]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChangeLayout && onChangeLayout(layoutMode === 'grid' ? 'list' : 'grid')}
          ref={hintBtnRef}
          className={"relative p-2.5 sm:p-3 rounded-lg transition-colors border"}
          style={{ background: isDarkMode ? '#27292F' : '#eef2f7', borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
          aria-label={layoutMode === 'grid' ? 'تبديل إلى القائمة الكلاسيكية' : 'تبديل إلى القائمة بالصور'}
          title={layoutMode === 'grid' ? 'القائمة الكلاسيكية' : 'القائمة بالصور'}
        >
          {layoutMode === 'grid' ? (
            <List className="h-5 w-5" style={{ color: isDarkMode ? '#E5E7EB' : '#0f172a' }} />
          ) : (
            <LayoutGrid className="h-5 w-5" style={{ color: isDarkMode ? '#E5E7EB' : '#0f172a' }} />
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
