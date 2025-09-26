import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import GameList from './components/GameList';
import SummaryBar from './components/SummaryBar';
import LoadingSpinner from './components/LoadingSpinner';
import SummaryModal from './components/SummaryModal';
import { loadGamesFromJSON } from './data/games';
import WelcomeTour from './components/WelcomeTour';
import { getGameImageUrl, getFallbackImageUrl, preloadImages, getCacheVersion } from './utils/imageProvider';
import { Gamepad2 } from 'lucide-react';

function App() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [activeSection, setActiveSection] = useState('offline'); // 'offline' | 'online' | 'all'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSidebarHint, setShowSidebarHint] = useState(true);
  const [gridDensity, setGridDensity] = useState('cozy'); // 'compact' | 'cozy' | 'comfortable'
  const [densityManual, setDensityManual] = useState(false); // user override
  const [whatsAppNumber, setWhatsAppNumber] = useState('201204838286');
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const scrollStateRef = React.useRef({ lastY: 0, ticking: false });
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadVersion, setPreloadVersion] = useState(0);
  const [preloaderStep, setPreloaderStep] = useState(0); // derived from progress

  // Load games on component mount
  useEffect(() => {
    // Restore hamburger hint dismissed state from localStorage
    try {
      const dismissed = localStorage.getItem('sidebarHintDismissed');
      if (dismissed === '1') setShowSidebarHint(false);
      const tourDone = localStorage.getItem('welcomeTourDone');
      if (tourDone !== '1') setShowWelcomeTour(true);
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

  // Preload all cover images at startup with a progress overlay
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // If this app version already preloaded before, hide overlay immediately
      let version = '1';
      try { version = await getCacheVersion(); } catch (_) {}
      const flagKey = `coversPreloaded:${version}`;
      try {
        if (localStorage.getItem(flagKey) === '1') {
          if (!cancelled) setShowPreloader(false);
          return;
        }
      } catch (_) {}

      // Otherwise, wait for games to load, then preload and hide
      if (isLoading || games.length === 0) {
        // Keep overlay visible until games are ready
        return;
      }

      try {
        const fallback = await getFallbackImageUrl();
        const urlsSet = new Set();
        if (fallback) urlsSet.add(fallback);
        for (const g of games) {
          const u = await getGameImageUrl(g);
          if (u) urlsSet.add(u);
        }
        const urls = Array.from(urlsSet);
        await preloadImages(urls, (p) => {
          if (!cancelled) setPreloadProgress(p);
        });
        try { localStorage.setItem(flagKey, '1'); } catch (_) {}
      } finally {
        if (!cancelled) {
          setShowPreloader(false);
          setPreloadVersion(v => v + 1);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [isLoading, games]);

  // Derive preloader step from progress thresholds
  useEffect(() => {
    const p = preloadProgress;
    if (p < 0.35) {
      setPreloaderStep(0); // Loading
    } else if (p < 0.55) {
      setPreloaderStep(1); // Title
    } else if (p < 0.80) {
      setPreloaderStep(2); // Count + Icon
    } else {
      setPreloaderStep(0); // Loading again
    }
  }, [preloadProgress]);

  // Persist hamburger hint dismissal across sessions
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
    let summaryText = '';
    selectedGames.forEach(game => {
      summaryText += `${game.Name} | ${game.SizeGB} GB | Drive: ${game.Drive}\n`;
    });

    summaryText += `\nالألعاب المحددة: ${summaryStats.selectedCount}\n`;
    summaryText += `الحجم الكلي: ${summaryStats.totalSize} جيجا\n`;
    summaryText += `السعر: ${summaryStats.totalPrice} جنيه`;
    
    return summaryText;
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
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => {
            setIsSidebarOpen(s => !s);
            setShowSidebarHint(false);
          }}
          layoutMode={layoutMode}
          onChangeLayout={(mode) => {
            setLayoutMode(mode);
            setIsSidebarOpen(false);
            setShowSidebarHint(false);
          }}
          showSidebarHint={showSidebarHint}
          gridDensity={gridDensity}
          onChangeDensity={(val) => { setDensityManual(true); setGridDensity(val); }}
        />
        
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

        {/* Startup preloader overlay */}
        <AnimatePresence>
          {showPreloader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
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
                <AnimatePresence mode="wait">
                  {preloaderStep === 0 && (
                    <motion.div
                      key="step-loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-4"
                    >
                      Loading
                    </motion.div>
                  )}
                  {preloaderStep === 1 && (
                    <motion.div
                      key="step-title"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      className="text-2xl font-extrabold leading-tight mb-4"
                    >
                      <span className="block sm:inline text-gradient">Technical Store</span>
                      <span className="mx-2 text-gray-400 dark:text-gray-500 hidden sm:inline">|</span>
                      <span className="block sm:inline text-gray-900 dark:text-gray-100">قسم الألعاب</span>
                    </motion.div>
                  )}
                  {preloaderStep === 2 && (
                    <motion.div
                      key="step-count"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      className="text-lg sm:text-xl font-bold mb-4 flex items-center justify-center gap-2"
                    >
                      <Gamepad2
                        className={`h-5 w-5 ${preloadProgress < 0.55 ? 'text-gray-400 dark:text-gray-500' : 'text-accent-600 dark:text-accent-400'}`}
                      />
                      <span className="text-gray-900 dark:text-gray-100">{games.length} لعبة متاحة</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="w-64 h-3 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden mx-auto shadow-inner">
                  <div
                    className="h-full bg-primary-600 transition-[width] duration-200"
                    style={{ width: `${Math.round(preloadProgress * 100)}%` }}
                  />
                </div>
                <div className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Math.round(preloadProgress * 100)}%
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
