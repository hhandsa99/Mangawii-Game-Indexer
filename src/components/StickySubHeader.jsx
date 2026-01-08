import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Wifi, WifiOff, ChevronDown, Search } from 'lucide-react';

export default function StickySubHeader({ section, onChangeSection, count, isDark, query, onQuery, headerHidden, onSearchFocusChange }) {
  const placeholder = React.useMemo(() => {
    if (section === 'online') return `ابحث في ${count} لعبة اونلاين`;
    if (section === 'offline') return `ابحث في ${count} لعبة اوفلاين/كراك`;
    return `ابحث في ${count} لعبة`;
  }, [section, count]);
  const filters = React.useMemo(() => ([
    { id: 'all', label: 'اونلاين/كراك', icon: Home },
    { id: 'online', label: 'اونلاين', icon: Wifi },
    { id: 'offline', label: 'كراك', icon: WifiOff },
  ]), []);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = React.useState(false);
  const activeFilter = filters.find(f => f.id === section) || filters[0];
  const ActiveFilterIcon = activeFilter.icon;
  const inputRef = React.useRef(null);

  // Colors that adapt to theme
  const darkBg = '#050508'; // Midnight Main BG
  const lightBg = '#ffffff';
  const bg = isDark ? darkBg : lightBg;
  const borderColor = isDark ? '#15161A' : 'rgba(15,23,42,0.06)';
  const inputTextClass = isDark ? 'text-gray-200 placeholder:text-gray-400' : 'text-gray-800 placeholder:text-gray-500';
  const iconColor = isDark ? '#949BA4' : '#5865F2';

  const focusInput = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    // This component is rendered inside a fixed overlay container in DualHeader;
    // therefore it should be position-agnostic and simply render the content.
    <div className="w-full">
      <div className="max-w-[1423px] mx-auto px-4 sm:px-6 xl:px-8 py-3 flex items-center gap-3 sm:gap-4 relative">
        {/* Centered combined control: filter + search (appears as a single pill) */}
        <div className="w-full flex justify-center">
          <div className="relative inline-flex items-center w-full max-w-[760px]">
            {/* Combined pill background */}
            <div className="flex items-center w-full rounded-2xl overflow-hidden transition-all duration-300 shadow-lg group hover:shadow-xl relative"
              style={{
                // Static Luxury Glass: High opacity, constant blur, subtle gold border
                background: isDark ? 'rgba(15, 16, 20, 0.85)' : bg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isDark ? '1px solid rgba(251, 191, 36, 0.15)' : `1px solid ${borderColor}`,
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 16px rgba(0,0,0,0.1)'
              }}>
              <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
              />
              {/* Filter button (left segment) */}
              <div className="relative flex items-center px-3 h-10 flex-shrink-0 border-l border-[#2B2D31]">
                <button
                  onClick={() => setIsFilterDropdownOpen(v => !v)}
                  className={`flex items-center gap-2 ${isDark ? 'text-gray-200 hover:text-white' : 'text-gray-800'} bg-transparent border-0 p-0 m-0 transition-colors`}
                  aria-haspopup="true"
                  aria-expanded={isFilterDropdownOpen}
                  aria-label="تحديد القسم"
                >
                  <ActiveFilterIcon className="w-4 h-4" style={{ color: isActive => (isActive ? '#5865F2' : iconColor) }} />
                  <span className="hidden sm:inline text-sm truncate max-w-[120px] font-medium">{activeFilter.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
                    style={{ color: iconColor }}
                  />
                </button>
              </div>

              {/* Search input (rest of the pill) */}
              <div className="flex items-center gap-2 px-3 py-2 flex-1">
                <Search className="h-5 w-5" style={{ color: isDark ? '#949BA4' : '#6B7280' }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  onFocus={() => onSearchFocusChange && onSearchFocusChange(true)}
                  onBlur={() => onSearchFocusChange && onSearchFocusChange(false)}
                  placeholder={placeholder}
                  className={`flex-1 bg-transparent outline-none text-sm ${inputTextClass} text-right font-['gg_sans']`}
                  autoComplete="off"
                  aria-label={placeholder}
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={focusInput}
                  className="text-sm px-4 py-1.5 rounded-xl text-white hover:brightness-110 transition-all font-bold shadow-[0_4px_15px_rgba(180,115,245,0.4)]"
                  style={{ background: 'linear-gradient(90deg, #b473f5 0%, #e292aa 100%)' }}
                >
                  بحث
                </button>
              </div>
            </div>
            <AnimatePresence>
              {isFilterDropdownOpen && (
                <>
                  {/* click-catcher to close dropdown when clicking outside */}
                  <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute top-full mt-1 right-0 z-20 sm:w-48 w-full rounded-md overflow-hidden"
                    style={{
                      background: isDark ? '#111214' : '#ffffff',
                      border: `1px solid ${borderColor}`,
                      boxShadow: isDark ? '0 8px 16px rgba(0,0,0,0.24)' : '0 6px 20px rgba(15,23,42,0.06)',
                    }}
                  >

                    {/* caret aligned near the right segment (filter button) for RTL */}
                    <div className={`absolute -top-2 right-4 w-3 h-3 rotate-45`} style={{ background: isDark ? darkBg : lightBg, borderRight: `1px solid ${borderColor}`, borderTop: `1px solid ${borderColor}` }} />
                    {filters.map(f => {
                      const Icon = f.icon;
                      const isActive = f.id === activeFilter.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => { onChangeSection && onChangeSection(f.id); setIsFilterDropdownOpen(false); }}
                          role="menuitem"
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all duration-200 text-right ${isActive ? 'bg-nitro-gradient text-white shadow-md' : (isDark ? 'text-white hover:bg-white/5' : 'text-gray-900 hover:bg-gray-50')}`}
                        >
                          <Icon className="w-4 h-4" style={{ color: isActive ? '#fff' : (isDark ? '#E5E7EB' : '#374151') }} />
                          <span className="truncate">{f.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Combined control rendered above; dropdown attached to the left segment (filter button) */}
      </div>
    </div >
  );
}
