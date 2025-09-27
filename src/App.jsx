import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import GameList from './components/GameList';
import LoadingSpinner from './components/LoadingSpinner';
import SummaryModal from './components/SummaryModal';
import SummaryBar from './components/SummaryBar';
import { loadGamesFromJSON } from './data/games';
import WelcomeTour from './components/WelcomeTour';
import { getCacheVersion } from './utils/imageProvider';
import { Gamepad2, LayoutGrid, List } from 'lucide-react';
function App() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [activeSection, setActiveSection] = useState('all'); // 'offline' | 'online' | 'all'
  const [showSidebarHint, setShowSidebarHint] = useState(true);
  const [gridDensity, setGridDensity] = useState('cozy'); // 'compact' | 'cozy' | 'comfortable'
  const [densityManual, setDensityManual] = useState(false); // user override
  const [whatsAppNumber, setWhatsAppNumber] = useState('201204838286');
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const scrollStateRef = React.useRef({ lastY: 0, ticking: false });
  const [showPreloader, setShowPreloader] = useState(true);
  // Preloader progress [0..100]
  const [displayProgress, setDisplayProgress] = useState(0);
  const [preloadVersion, setPreloadVersion] = useState(0);
  const [preloaderStep, setPreloaderStep] = useState(0); // derived from progress
  const [aboveFoldReady, setAboveFoldReady] = useState(false); // no longer gates hiding
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  // For loader first two phases: use a single text node, AnimatePresence crossfade on change
  const [phase01Text, setPhase01Text] = useState('Technical Store');

  // Hint overlay anchoring (Grid/List button clone position)
  const hintAnchorElRef = React.useRef(null);
  const [hintAnchorRect, setHintAnchorRect] = useState(null);

  // Update cloned button/hint position when hint opens, on resize, and on scroll
  useEffect(() => {
    const el = hintAnchorElRef.current;
    if (!showSidebarHint || !el) {
      setHintAnchorRect(null);
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
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [showSidebarHint, layoutMode]);

  // Load games on component mount
  useEffect(() => {
    // Restore view toggle hint dismissed state from localStorage
    try {
      // Versioned tips reset: if version changes, re-enable tips and tour
      const currentTipsVersion = '2';
      const storedTipsVersion = localStorage.getItem('tipsVersion');
      if (storedTipsVersion !== currentTipsVersion) {
        try {
          localStorage.removeItem('welcomeTourDone');
          localStorage.removeItem('sidebarHintDismissed');
          localStorage.setItem('tipsVersion', currentTipsVersion);
        } catch (_) {}
      }
      const dismissed = localStorage.getItem('sidebarHintDismissed');
      if (dismissed === '1') setShowSidebarHint(false);
      const tourDone = localStorage.getItem('welcomeTourDone');
      if (tourDone !== '1') setShowWelcomeTour(false); // will open after loader hides
      setIsFirstLaunch(localStorage.getItem('firstLaunchDone') !== '1');
    } catch (_) {}
    // Load WhatsApp phone number from public/whatsapp.json so it works on GitHub Pages
    (async () => {
      try {
        const url = `${import.meta.env.BASE_URL}whatsapp.json`;
        const res = await fetch(url, { cache: 'no-cache' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.phoneNumber) {
            const digits = String(data.phoneNumber).replace(/[^\d]/g, '');
            if (digits) setWhatsAppNumber(digits);
          }
        }
      } catch (_) {}
    })();
    const loadGames = async () => {
      setIsLoading(true);
      try {
        const gameData = await loadGamesFromJSON();
        const sortedGames = gameData.sort((a, b) => a.Name.localeCompare(b.Name));
        setGames(sortedGames);
        setFilteredGames(sortedGames);
      } catch (error) {
        console.error('Failed to load games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, []);

  // Startup preloader overlay: pure visual layer; count to 100% and then hide.
  useEffect(() => {
    let cancelled = false;
    let timerId = null;
    (async () => {
      // Begin time-based progress immediately once we have data
      if (isLoading || games.length === 0) return;
      // Drive to 100%
      const stepMs = isFirstLaunch ? 180 : 100; // slower: ~18s on first launch, ~10s afterwards
      timerId = setInterval(() => {
        if (!cancelled) setDisplayProgress(p => Math.min(100, p + 1));
      }, stepMs);
      // Hide when displayProgress reaches 100% (handled below)
    })();
    return () => {
      cancelled = true;
      if (timerId) clearInterval(timerId);
    };
  }, [isLoading, games, isFirstLaunch]);

  // No additional smoothing; displayProgress is the source of truth

  // Derive preloader step from progress thresholds (using displayProgress)
  useEffect(() => {
    const p = displayProgress;
    if (p < 20) {
      setPreloaderStep(0); // Technical Store
    } else if (p < 60) {
      setPreloaderStep(1); // قسم الألعاب
    } else if (p < 90) {
      setPreloaderStep(2); // Games count + icon
    } else {
      setPreloaderStep(3); // Loading
    }
  }, [displayProgress]);

  // Update phase01Text when entering phase 0 or 1; AnimatePresence handles the smooth crossfade
  useEffect(() => {
    const p = displayProgress;
    const target = p < 20 ? 'Technical Store' : p < 60 ? 'قسم الألعاب' : '';
    if (target && target !== phase01Text) setPhase01Text(target);
  }, [displayProgress, phase01Text]);

  // Receive real load progress from GameList
  const handleLoadProgress = () => {};

  // Hide overlay strictly when displayProgress hits 100
  useEffect(() => {
    if (!showPreloader) return;
    if (displayProgress >= 100) {
      setShowPreloader(false);
      setPreloadVersion(v => v + 1);
      try { localStorage.setItem('firstLaunchDone', '1'); } catch (_) {}
      // Start welcome tour after overlay hides if not completed before
      try {
        const tourDone = localStorage.getItem('welcomeTourDone');
        if (isFirstLaunch || tourDone !== '1') setShowWelcomeTour(true);
      } catch (_) {}
    }
  }, [displayProgress, showPreloader, isFirstLaunch]);

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

  // Hide SearchBar on scroll down, show on slight scroll up
  useEffect(() => {
    const onScroll = () => {
      const { ticking, lastY } = scrollStateRef.current;
      const currentY = window.scrollY || window.pageYOffset || 0;
      if (ticking) return;
      scrollStateRef.current.ticking = true;
      window.requestAnimationFrame(() => {
        const delta = currentY - lastY;
        // Hide when scrolling down more than threshold and away from top
        if (delta > 8 && currentY > 100) {
          setShowSearchBar(false);
        }
        // Show when scrolling up slightly
        if (delta < -5) {
          setShowSearchBar(true);
        }
        // Always show near the very top
        if (currentY < 80) {
          setShowSearchBar(true);
        }
        scrollStateRef.current.lastY = currentY;
        scrollStateRef.current.ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Filter games based on search query and active section
  useEffect(() => {
    let base = games;
    if (activeSection !== 'all') {
      base = base.filter(g => (g.__section || 'offline') === activeSection);
    }
    if (!searchQuery.trim()) {
      setFilteredGames(base);
    } else {
      const filtered = base.filter(game =>
        game.Name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGames(filtered);
    }
  }, [searchQuery, games, activeSection]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const selected = games.filter(game => selectedGames.has(game.Name));
    const totalSize = selected.reduce((sum, game) => sum + parseFloat(game.SizeGB), 0);
    
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
      totalSize: totalSize.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      selectedGames: selected
    };
  }, [selectedGames, games]);

  // Handle game selection
  const handleGameSelection = (gameName, isSelected) => {
    const newSelected = new Set(selectedGames);
    if (isSelected) {
      newSelected.add(gameName);
    } else {
      newSelected.delete(gameName);
    }
    setSelectedGames(newSelected);
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allGameNames = new Set(filteredGames.map(game => game.Name));
      setSelectedGames(allGameNames);
    } else {
      setSelectedGames(new Set());
    }
  };

  // Toggle selection by name (used in modal checklist)
  const applySelectionFromModal = (namesArray) => {
    const next = new Set(namesArray);
    setSelectedGames(next);
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Generate summary text
  const generateSummaryText = () => {
    const { selectedGames } = summaryStats;
    if (!selectedGames || selectedGames.length === 0) {
      return `الألعاب المحددة: 0\nالحجم الكلي: 0 جيجا\nالسعر: 0 جنيه`;
    }

    // Group by JsonName and sort groups and items alphabetically
    const groups = new Map();
    for (const g of selectedGames) {
      const key = g.JsonName || 'Unknown.json';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(g);
    }
    const groupKeys = Array.from(groups.keys()).sort((a, b) => String(a).localeCompare(String(b)));

    const lines = [];
    for (let i = 0; i < groupKeys.length; i++) {
      const key = groupKeys[i];
      const displayKey = String(key).replace(/\.json$/i, '');
      const arr = groups.get(key).slice().sort((a, b) => a.Name.localeCompare(b.Name));
      for (const game of arr) {
        // Exact spacing: Game name   |   Size   |   json name
        lines.push(`${game.Name}   |   ${Number(game.SizeGB).toFixed(2)} GB   |   ${displayKey}`);
      }
      if (i !== groupKeys.length - 1) lines.push('');
    }

    lines.push('');
    lines.push(`الألعاب المحددة: ${summaryStats.selectedCount}`);
    lines.push(`الحجم الكلي: ${summaryStats.totalSize} جيجا`);
    lines.push(`السعر: ${summaryStats.totalPrice} جنيه`);
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'dark bg-neutral-900' : 'bg-gray-50'
    }`}>
      {/* Dark mode class for Tailwind */}
      <div className={isDarkMode ? 'dark' : ''}>
        <WelcomeTour
          open={showWelcomeTour}
          onClose={(reason) => {
            if (reason === 'done') {
              try { localStorage.setItem('welcomeTourDone', '1'); } catch (_) {}
            }
            setShowWelcomeTour(false);
          }}
        />
        <Header 
          isDarkMode={isDarkMode} 
          onToggleDarkMode={toggleDarkMode}
          totalGames={games.length}
          layoutMode={layoutMode}
          onChangeLayout={(mode) => {
            setLayoutMode(mode);
            setShowSidebarHint(false);
          }}
          showSidebarHint={showSidebarHint}
          gridDensity={gridDensity}
          onChangeDensity={(val) => { setDensityManual(true); setGridDensity(val); }}
          onDismissHint={() => setShowSidebarHint(false)}
          onRegisterHintAnchor={(el) => { hintAnchorElRef.current = el; }}
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
        
        <main className="px-3 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Sticky search bar that hides on scroll down and shows on slight scroll up */}
            <motion.div
              className="sticky top-24 sm:top-28 z-40"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: showSearchBar ? 0 : -72, opacity: showSearchBar ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <SearchBar 
                onSearch={handleSearch}
                searchQuery={searchQuery}
              />
            </motion.div>
            {/* Section toggle (replaces layout toggle): Offline / Online / All */}
            <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => setActiveSection('offline')}
                  className={`px-3 py-2 rounded-md text-sm font-bold border transition-colors ${activeSection === 'offline' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-800 border-gray-300 dark:bg-neutral-900 dark:text-gray-100 dark:border-neutral-700'} ${activeSection === 'online' ? 'glow-pulse' : ''}`}
                  aria-pressed={activeSection === 'offline'}
                >
                  الألعاب أوفلاين
                </button>
                <button
                  onClick={() => setActiveSection('online')}
                  className={`px-3 py-2 rounded-md text-sm font-bold border transition-colors ${activeSection === 'online' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-800 border-gray-300 dark:bg-neutral-900 dark:text-gray-100 dark:border-neutral-700'} ${activeSection === 'offline' ? 'glow-pulse' : ''}`}
                  aria-pressed={activeSection === 'online'}
                >
                  الألعاب أونلاين
                </button>
                <button
                  onClick={() => setActiveSection('all')}
                  className={`px-3 py-2 rounded-md text-sm font-bold border transition-colors ${activeSection === 'all' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-800 border-gray-300 dark:bg-neutral-900 dark:text-gray-100 dark:border-neutral-700'}`}
                  aria-pressed={activeSection === 'all'}
                >
                  الكل
                </button>
            </div>
            
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <GameList
                games={filteredGames}
                selectedGames={selectedGames}
                onGameSelection={handleGameSelection}
                onSelectAll={handleSelectAll}
                totalGames={games.length}
                layoutMode={layoutMode}
                gridDensity={gridDensity}
                preloadVersion={preloadVersion}
                onAboveFoldReady={() => setAboveFoldReady(true)}
                onLoadProgress={handleLoadProgress}
              />
            )}
        </motion.div>
      </main>

        <SummaryBar
          stats={summaryStats}
          onOpenModal={() => setShowSummaryModal(true)}
          isDarkMode={isDarkMode}
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
            />
          )}
        </AnimatePresence>

        {/* Startup preloader overlay (top-most) */}
        <AnimatePresence>
          {showPreloader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000]"
            >
              {/* Background splash image (cover, responsive) */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}images/Splash%20Screen.webp`}
                  alt="Splash Background"
                  decoding="async"
                  loading="eager"
                  fetchpriority="high"
                  className="w-full h-full object-cover object-center select-none pointer-events-none"
                  draggable={false}
                />
                {/* Dim overlay (~90% opacity) */}
                <div className="absolute inset-0 bg-black/90" aria-hidden="true" />
              </div>

              {/* Foreground content */}
              <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-6">
                {/* Reserve fixed space for text so progress bar stays fixed */}
                <div className="relative mb-4 h-9 sm:h-10 w-full flex items-center justify-center">
                  {/* First two phases: AnimatePresence crossfade keyed by phase01Text */}
                  {displayProgress < 60 && (
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={phase01Text}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeInOut' }}
                        className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-gray-900 dark:text-gray-100 whitespace-nowrap"
                      >
                        {phase01Text === 'Technical Store' ? (
                          <span className="text-gradient">Technical Store</span>
                        ) : (
                          <span>قسم الألعاب</span>
                        )}
                      </motion.span>
                    </AnimatePresence>
                  )}

                  {/* Phases 2 and 3: a single presence wrapper, opacity-only dissolves for 60fps smoothness */}
                  <AnimatePresence initial={false} mode="popLayout">
                    {preloaderStep === 2 && (
                      <motion.div
                        key="phase-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
                        className="absolute inset-0 flex items-center justify-center gap-2 text-lg sm:text-xl font-bold"
                      >
                        <Gamepad2
                          className={`h-5 w-5 ${displayProgress < 55 ? 'text-gray-400 dark:text-gray-500' : 'text-accent-600 dark:text-accent-400'}`}
                        />
                        <span className="text-gray-900 dark:text-gray-100">{games.length} لعبة متاحة</span>
                      </motion.div>
                    )}
                    {preloaderStep === 3 && (
                      <motion.div
                        key="phase-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
                        className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-gray-900 dark:text-gray-100"
                      >
                        Loading
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="w-64 h-3 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden mx-auto shadow-inner">
                  <div
                    className="h-full bg-primary-600 transition-[width] duration-150"
                    style={{ width: `${displayProgress}%` }}
                  />
                </div>
                <div className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {displayProgress}%
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
