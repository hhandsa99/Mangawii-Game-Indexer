import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import StickySubHeader from './StickySubHeader';

export default function DualHeader({
  isDarkMode,
  onToggleDarkMode,
  onSetDarkMode,
  themePreset,
  onSelectTheme,
  totalGames,
  layoutMode,
  onChangeLayout,
  showSidebarHint,
  gridDensity,
  onChangeDensity,
  onDismissHint,
  onRegisterHintAnchor,
  // Subheader props
  section,
  onChangeSection,
  searchValue,
  onSearchChange,
  count,
}) {
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [barHidden, setBarHidden] = React.useState(false);
  const [showSub, setShowSub] = React.useState(true);
  const lastYRef = React.useRef(0);
  const tickingRef = React.useRef(false);
  const [isMobile, setIsMobile] = React.useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : true));

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  React.useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      const currentY = window.scrollY || window.pageYOffset || 0;
      window.requestAnimationFrame(() => {
        const lastY = lastYRef.current;
        const delta = currentY - lastY;
        // Header always visible
        setBarHidden(false);
        // Subheader visibility: show when scrolling up a bit or near the top
        if (delta < -5 || currentY < 100) setShowSub(true);
        if (delta > 8 && currentY > 140) setShowSub(false);
        lastYRef.current = currentY;
        tickingRef.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const placeholder = React.useMemo(() => {
    const n = typeof count === 'number' ? count : totalGames;
    if (section === 'online') return `ابحث في ${n} لعبة اونلاين`;
    if (section === 'offline') return `ابحث في ${n} لعبة اوفلاين`;
    return `ابحث في ${n} لعبة`;
  }, [section, count, totalGames]);

  return (
    <div
      className={`sticky top-0 z-[80] transition-transform duration-200 will-change-transform ${barHidden ? '-translate-y-full' : 'translate-y-0'}`}
      style={{
        backgroundColor: isDarkMode ? 'rgba(30, 33, 40, 0.95)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: isDarkMode ? '0 4px 10px rgba(0,0,0,0.18)' : '0 4px 10px rgba(0,0,0,0.06)'
      }}
    >
      {/* Top: main header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onSetDarkMode={onSetDarkMode}
        themePreset={themePreset}
        onSelectTheme={onSelectTheme}
        totalGames={totalGames}
        collapsed={false}
        hidden={false}
        embedded
        layoutMode={layoutMode}
        onChangeLayout={onChangeLayout}
        showSidebarHint={showSidebarHint}
        gridDensity={gridDensity}
        onChangeDensity={onChangeDensity}
        onRegisterHintAnchor={onRegisterHintAnchor}
      />
      {/* Subheader: search and filter dropdown (shows on scroll-up) - rendered as fixed overlay */}
      <AnimatePresence>
        {showSub && (
          <motion.div
            key="subheader-overlay"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed left-0 right-0 z-[85] flex justify-center pointer-events-auto"
            style={{ top:  (typeof window !== 'undefined' && window.innerWidth < 640) ? 64 : 72 }}
          >
            <div style={{ width: '100%' }}>
              <StickySubHeader
                section={section}
                onChangeSection={onChangeSection}
                count={count}
                isDark={isDarkMode}
                query={searchValue}
                onQuery={onSearchChange}
                headerHidden={!showSub}
                onSearchFocusChange={(v)=>{}}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
