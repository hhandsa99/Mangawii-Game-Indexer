import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import GameList from './components/GameList';
import SummaryBar from './components/SummaryBar';
import LoadingSpinner from './components/LoadingSpinner';
import SummaryModal from './components/SummaryModal';
import { loadGamesFromJSON } from './data/games';

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

  // Load games on component mount
  useEffect(() => {
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
    const phoneNumber = "201204838286";
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
        <Header 
          isDarkMode={isDarkMode} 
          onToggleDarkMode={toggleDarkMode}
          totalGames={games.length}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => {
            setIsSidebarOpen(s => !s);
            setShowSidebarHint(false);
          }}
          activeSection={activeSection}
          onChangeSection={(sec) => {
            setActiveSection(sec);
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
            <SearchBar 
              onSearch={handleSearch}
              searchQuery={searchQuery}
            />
            {/* Layout toggle with glow on inactive button */}
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-bold border transition-colors ${layoutMode === 'grid' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-800 border-gray-300 dark:bg-neutral-900 dark:text-gray-100 dark:border-neutral-700 glow-pulse'}`}
                aria-pressed={layoutMode === 'grid'}
              >
                القائمة بالصور
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-bold border transition-colors ${layoutMode === 'list' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-800 border-gray-300 dark:bg-neutral-900 dark:text-gray-100 dark:border-neutral-700 glow-pulse'}`}
                aria-pressed={layoutMode === 'list'}
              >
                القائمة الكلاسيكية
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
              />
            )}
          </motion.div>
        </main>

        <SummaryBar
          stats={summaryStats}
          onOpenModal={() => setShowSummaryModal(true)}
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
      </div>
    </div>
  );
}

export default App;
