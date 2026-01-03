import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DualHeader from './components/DualHeader';
import GameList from './components/GameList';
import SummaryModal from './components/SummaryModal';
import InfoCards from './components/InfoCards';
// Removed SummaryBar in favor of new FloatingSummary
import FloatingSummary from './components/FloatingSummary';
import { loadGamesFromJSON } from './data/games';
import WelcomeTour from './components/WelcomeTour';
import { getCacheVersion } from './utils/imageProvider';
import { Gamepad2, LayoutGrid, List } from 'lucide-react';
import { matchGameName, buildAliases } from './utils/searchUtils';
import ContextMenu from './components/ContextMenu';
function App() {
  // Helper to compute a stable unique key for a game. Use Id when available,
  // otherwise fall back to a composite of Name + JsonName (file) or section.
  const gameKey = (g) => {
    if (!g) return '';
    if (g.Id || g.id) return String(g.Id ?? g.id);
    const name = String(g.Name ?? g.name ?? '').trim();
    const src = String(g.JsonName ?? g.__section ?? '').trim();
    return `${name}::${src}`;
  };
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState(new Set()); // stores game IDs (fallback to Name if missing)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem('darkMode') === '0' ? false : true; } catch { return true; }
  });
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [activeSection, setActiveSection] = useState('all'); // 'offline' | 'online' | 'all'
  const [showSidebarHint, setShowSidebarHint] = useState(() => {
    try {
      // show hint only if user hasn't dismissed it and it's the first launch
      const dismissed = localStorage.getItem('sidebarHintDismissed') === '1';
      const firstDone = localStorage.getItem('firstLaunchDone') === '1';
      return !dismissed && !firstDone;
    } catch (_) {
      return true;
    }
  });
  const [gridDensity, setGridDensity] = useState('cozy'); // 'compact' | 'cozy' | 'comfortable'
  const [densityManual, setDensityManual] = useState(false); // user override
  const [whatsAppNumber, setWhatsAppNumber] = useState('201204838286');
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [headerHidden, setHeaderHidden] = useState(false); // legacy, no longer used by DualHeader
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const scrollStateRef = React.useRef({ lastY: 0, ticking: false });
  
  const [aboveFoldReady, setAboveFoldReady] = useState(false); // no longer gates hiding
  const [isFirstLaunch, setIsFirstLaunch] = useState(() => {
    try {
      // if firstLaunchDone is set to '1' we are NOT first launch
      return localStorage.getItem('firstLaunchDone') !== '1';
    } catch (_) {
      return true;
    }
  });
  // space to reserve for the fixed subheader overlay so it doesn't cover content
  const [subheaderOffset, setSubheaderOffset] = useState(() => (typeof window !== 'undefined' ? (window.innerWidth < 640 ? 88 : 96) : 96));
  // For loader first two phases: use a single text node, AnimatePresence crossfade on change
  
  const aliasesRef = React.useRef(buildAliases());
  const [ctxMenu, setCtxMenu] = useState({ open: false, x: 0, y: 0, gameName: '' });

  // Hint overlay anchoring (Grid/List button clone position)
  const hintAnchorElRef = React.useRef(null);
  const [hintAnchorRect, setHintAnchorRect] = useState(null);

  // Update cloned button/hint position when hint opens, on resize, and on scroll
  useEffect(() => {
    const el = hintAnchorElRef.current;
    if (!showSidebarHint || !el) {
      return;
    }
    const compute = () => {
      const r = el.getBoundingClientRect();
      // Use viewport coordinates for fixed positioning
      setHintAnchorRect({
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
      });
    };
    const raf = requestAnimationFrame(compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    }
  }, [showSidebarHint, layoutMode]);

  // Load games on component mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        const gameData = await loadGamesFromJSON();
        const sortedGames = gameData.sort((a, b) => a.Name.localeCompare(b.Name));
        setGames(sortedGames);
        setFilteredGames(sortedGames);
      } catch (error) {
        console.error('Failed to load games:', error);
      }
    };
    loadGames();
  }, []);

  // Receive real load progress from GameList
  const handleLoadProgress = () => {};

  // Persist view toggle hint dismissal across sessions
  useEffect(() => {
    try {
      if (!showSidebarHint) {
        localStorage.setItem('sidebarHintDismissed', '1');
      }
    } catch (_) {}
  }, [showSidebarHint]);

  // Responsive logic for grid density (auto unless user manually changes)
  useEffect(() => {
    if (densityManual) return; // don't override manual choice
    const apply = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setGridDensity('compact');
      } else if (w < 1200) {
        setGridDensity('cozy');
      } else {
        setGridDensity('comfortable');
      }
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [densityManual]);

  // Keep subheader offset in sync with window size (mobile vs desktop)
  useEffect(() => {
    const compute = () => {
      setSubheaderOffset(window.innerWidth < 640 ? 88 : 96);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Ensure dark mode class is applied globally so portaled components also receive dark styles
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (_) {}
  }, [isDarkMode]);

  // DualHeader handles its own hide/show logic now

  // Filter games based on fuzzy search query and active section
  useEffect(() => {
    let base = games;
    if (activeSection !== 'all') {
      base = base.filter(g => (g.__section || 'offline') === activeSection);
    }
    if (!searchQuery.trim()) {
      setFilteredGames(base);
    } else {
      const q = searchQuery;
      const filtered = base.filter(game => matchGameName(game.Name, q, aliasesRef.current));
      setFilteredGames(filtered);
    }
  }, [searchQuery, games, activeSection]);

  // Section-only count (does not include search filtering)
  const sectionCount = useMemo(() => {
    if (activeSection === 'all') return games.length;
    return games.filter(g => (g.__section || 'offline') === activeSection).length;
  }, [games, activeSection]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const selected = games.filter(game => {
      const gid = gameKey(game);
      return selectedGames.has(gid);
    });
    const totalSize = selected.reduce((sum, game) => {
      const size = parseFloat(game.SizeGB ?? game.Size ?? game.size ?? 0);
      return sum + (isNaN(size) ? 0 : size);
    }, 0);
    
    let totalPrice = totalSize;
    if (totalSize > 100) {
      totalPrice /= 2;
    }
    totalPrice = Math.round(totalPrice / 5) * 5;
    if (selected.length > 0 && totalPrice < 20) {
      totalPrice = 20;
    }

    return {
      selectedCount: selected.length,
      totalSize: totalSize.toFixed(1),
      totalPrice: totalPrice.toFixed(2),
      selectedGames: selected
    };
  }, [selectedGames, games]);

  // Handle game selection
  const handleGameSelection = (gameKeyOrId, isSelected) => {
    const newSelected = new Set(selectedGames);
    if (isSelected) {
      newSelected.add(gameKeyOrId);
    } else {
      newSelected.delete(gameKeyOrId);
    }
    setSelectedGames(newSelected);
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allIds = new Set(filteredGames.map(game => gameKey(game)));
      setSelectedGames(allIds);
    } else {
      setSelectedGames(new Set());
    }
  };

  // Toggle selection by name (used in modal checklist)
  const applySelectionFromModal = (namesArray) => {
    // `namesArray` now contains canonical keys (Id or composite key). For
    // backward compatibility, if caller passed plain names, map them to the
    // first matching game's key. Prefer exact keys when provided.
    const nameToKey = new Map(games.map(g => [g.Name, gameKey(g)]));
    const next = new Set(namesArray.map(item => {
      // If item matches an existing game's key, keep it
      // Otherwise treat it as a Name and map to first matching key
      const found = games.find(g => gameKey(g) === item);
      if (found) return item;
      return nameToKey.get(item) ?? item;
    }));
    setSelectedGames(next);
  };

  // Debounced search syncing
  const searchDebounceRef = React.useRef(null);
  const handleSearch = (query) => {
    setSearchInput(query);
  };
  useEffect(() => {
    const timeoutId = searchDebounceRef.current;
    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 150);
    searchDebounceRef.current = newTimeoutId;
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput]);
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Custom context menu handlers
  const handleCardContext = (gameName, evt) => {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    setCtxMenu({ open: true, x: evt.clientX, y: evt.clientY, gameName });
  };

  const closeContextMenu = () => setCtxMenu(prev => ({ ...prev, open: false }));


  useEffect(() => {
    try {
      const el = document.documentElement;
      if (isDarkMode) el.classList.add('dark'); else el.classList.remove('dark');
      localStorage.setItem('darkMode', isDarkMode ? '1' : '0');
    } catch (_) {}
  }, [isDarkMode]);

  // Explicit setter still supported if needed
  const setDarkModeExplicit = (val) => { setIsDarkMode(!!val); };

  // Generate summary text
  const generateSummaryText = () => {
    const { selectedGames: selectedArr } = summaryStats;
    if (!selectedArr || selectedArr.length === 0) {
      return `الألعاب المحددة: 0\nالحجم الكلي: 0 جيجا\nالسعر: 0 جنيه`;
    }

    // Helper: parse numeric size from various possible fields and formats
    const parseSize = (game) => {
      const raw = game.Size ?? game.size ?? game.SizeGB ?? game.sizeGB ?? game.SizeInGB ?? '';
      if (raw == null) return 0;
      if (typeof raw === 'number') return raw;
      // try to extract numeric part from string like '15gb' or '15 GB'
      const match = String(raw).replace(',', '.').match(/[-+]?\d*\.?\d+/);
      return match ? parseFloat(match[0]) : 0;
    };

    const formatSize = (n) => {
      if (n == null || isNaN(n)) return '0 جيجا';
      const rounded = Math.round(n * 10) / 10;
      if (Math.abs(rounded - Math.round(rounded)) < 1e-9) return `${Math.round(rounded)} جيجا`;
      return `${rounded.toFixed(1).replace(/\.0$/, '')} جيجا`;
    };

    // Group selected games by location. Map 'common' -> 'Steam' for exported text.
    const groups = new Map();
    for (const g of selectedArr) {
      const rawLoc = (g.Location ?? g.location ?? g.__folder ?? g.folder ?? 'Unknown');
      let loc = String(rawLoc ?? 'Unknown').trim();
      if (loc.toLowerCase() === 'common') loc = 'Steam';
      if (!groups.has(loc)) groups.set(loc, []);
      groups.get(loc).push(g);
    }

    // Sort locations alphabetically and games by name
    const sortedLocations = Array.from(groups.keys()).sort((a, b) => String(a).localeCompare(String(b)));
    const lines = [];
    for (const loc of sortedLocations) {
      const list = groups.get(loc).slice().sort((a, b) => String(a.Name).localeCompare(String(b.Name)));
      lines.push(`📂 ${loc}`);
      for (const g of list) {
        const sizeNum = parseSize(g);
        lines.push(`• ${g.Name} — ${formatSize(sizeNum)}`);
      }
      lines.push('');
    }

    // Separator and totals (Arabic labels with simple emojis)
    lines.push('———————————————');
    lines.push(`🟦 الالعاب المحددة: ${summaryStats.selectedCount}`);
    lines.push(`🟩 الحجم الكلي: ${summaryStats.totalSize} جيجا`);
    lines.push(`💵 السعر: ${summaryStats.totalPrice} جنيه`);
    return lines.join('\n');
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateSummaryText());
      // You could add a toast notification here
      setShowSummaryModal(false);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Send to WhatsApp
  const sendToWhatsApp = () => {
    const phoneNumber = whatsAppNumber || "201204838286";
    const encodedMessage = encodeURIComponent(generateSummaryText());
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setShowSummaryModal(false);
  };

  // Sticky subheader moved to its own component

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`} style={{ backgroundColor: isDarkMode ? 'rgba(21, 24, 32, 0.98)' : '#f5f7fb' }}>
      {/* Dark mode class for Tailwind */}
      <div className={isDarkMode ? 'dark' : ''}>
        <WelcomeTour
          open={showWelcomeTour}
          onClose={(reason) => {
            // Mark tour as done when the user finishes or explicitly skips it so it won't reappear
            try {
              if (reason === 'done' || reason === 'skip') localStorage.setItem('welcomeTourDone', '1');
            } catch (_) {}
            setShowWelcomeTour(false);
          }}
        />
        <DualHeader
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onSetDarkMode={setDarkModeExplicit}
          totalGames={games.length}
          layoutMode={layoutMode}
          onChangeLayout={(mode) => { setLayoutMode(mode); setShowSidebarHint(false); }}
          showSidebarHint={showSidebarHint}
          gridDensity={gridDensity}
          onChangeDensity={(val) => { setDensityManual(true); setGridDensity(val); }}
          onDismissHint={() => setShowSidebarHint(false)}
          onRegisterHintAnchor={(el) => { hintAnchorElRef.current = el; }}
          section={activeSection}
          onChangeSection={setActiveSection}
          searchValue={searchInput}
          onSearchChange={handleSearch}
          count={sectionCount}
        />

        {/* Global dim overlay when hint is shown (below the clone button/hint which have higher z-index) */}
        <AnimatePresence>
          {showSidebarHint && !showWelcomeTour && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[900] bg-black/90"
              onClick={() => {
                try { localStorage.setItem('sidebarHintDismissed', '1'); } catch (_) {}
                setShowSidebarHint(false);
              }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Position and render the cloned glowing button and hint on top of the overlay */}
        <AnimatePresence>
          {showSidebarHint && !showWelcomeTour && hintAnchorRect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-[1000]"
            >
              {/* Cloned button at exact screen coords */}
              <button
                type="button"
                className={`pointer-events-auto fixed rounded-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-[0_0_0_6px_rgba(59,130,246,0.35)]`}
                style={{ left: hintAnchorRect.left, top: hintAnchorRect.top, width: hintAnchorRect.width, height: hintAnchorRect.height }}
                aria-label={layoutMode === 'grid' ? 'تبديل إلى القائمة الكلاسيكية' : 'تبديل إلى القائمة بالصور'}
                onClick={() => {
                  try { localStorage.setItem('sidebarHintDismissed', '1'); } catch (_) {}
                  setShowSidebarHint(false);
                }}
              >
                <span className="flex items-center justify-center w-full h-full text-gray-700 dark:text-gray-200">
                  {layoutMode === 'grid' ? (
                    <List className="h-5 w-5" />
                  ) : (
                    <LayoutGrid className="h-5 w-5" />
                  )}
                </span>
              </button>

              {/* Hint bubble positioned under the button */}
              <div
                className="pointer-events-auto fixed"
                style={{ left: hintAnchorRect.left, top: hintAnchorRect.top + hintAnchorRect.height + 8 }}
              >
                <div className="relative rounded-lg bg-primary-600 text-white shadow-lg px-3 py-2 text-center w-[200px] sm:w-[240px]">
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-primary-600 rotate-45" />
                  <div className="text-xs font-bold leading-tight whitespace-nowrap">طريقة العرض</div>
                  <div className="text-[11px] opacity-90 leading-tight whitespace-nowrap">بدّل بين الشبكة والقائمة</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
  <main className="py-6 sm:py-8 pb-24 sm:pb-20" style={{ paddingTop: subheaderOffset + 8 }}>
          {/* Info cards at top of page */}
          <InfoCards isDark={isDarkMode} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 sm:space-y-8 max-w-[1423px] mx-auto px-8"
          >
            {/* Search moved to StickySubHeader; section toggle also in subheader */}
            
              <GameList
                key={layoutMode}
                games={filteredGames}
                selectedGames={selectedGames}
                onGameSelection={handleGameSelection}
                onSelectAll={handleSelectAll}
                totalGames={games.length}
                layoutMode={layoutMode}
                gridDensity={gridDensity}
                onAboveFoldReady={() => setAboveFoldReady(true)}
                onLoadProgress={handleLoadProgress}
                onCardContext={handleCardContext}
              />
        </motion.div>
      </main>

        {/* New FloatingSummary bar */}
        <FloatingSummary
          selectedCount={Number(summaryStats.selectedCount || 0)}
          totalSize={Number(summaryStats.totalSize || 0)}
          totalPrice={Number(summaryStats.totalPrice || 0)}
          onViewDetails={() => setShowSummaryModal(true)}
          onClear={() => setSelectedGames(new Set())}
          isDark={isDarkMode}
        />

        <AnimatePresence>
          {showSummaryModal && (
            <SummaryModal
              summaryText={generateSummaryText()}
              stats={summaryStats}
              selectedList={summaryStats.selectedGames}
              onApplySelection={applySelectionFromModal}
              onClose={() => setShowSummaryModal(false)}
              onCopy={copyToClipboard}
              onWhatsApp={sendToWhatsApp}
              isDark={isDarkMode}
            />
          )}
        </AnimatePresence>

        
        {/* Custom Context Menu */}
        <ContextMenu
          open={ctxMenu.open}
          x={ctxMenu.x}
          y={ctxMenu.y}
          gameName={ctxMenu.gameName}
          onClose={closeContextMenu}
          isDark={isDarkMode}
        />
      </div>
    </div>
  );
}

export default App;
