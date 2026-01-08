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
      className="sticky top-0 z-[80] transition-transform duration-200 will-change-transform"
      style={{
        // Static Independent Glass: High opacity, constant blur, subtle gold border
        backgroundColor: isDarkMode ? 'rgba(15, 16, 20, 0.85)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isDarkMode ? '1px solid rgba(251, 191, 36, 0.15)' : '1px solid rgba(0,0,0,0.05)',
        boxShadow: isDarkMode ? '0 4px 30px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)'
      }}
    >
      <div className="absolute inset-0 z-[-1] opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
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
            style={{ top: (typeof window !== 'undefined' && window.innerWidth < 640) ? 64 : 72 }}
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
                onSearchFocusChange={(v) => { }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
