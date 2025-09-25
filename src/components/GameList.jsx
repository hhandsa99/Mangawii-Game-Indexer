import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ImageOff, Gamepad2, SquareCheckBig } from 'lucide-react';
import { getGameImageUrl, getFallbackImageUrl } from '../utils/imageProvider';

const GameList = ({ games, selectedGames, onGameSelection, onSelectAll, totalGames, layoutMode = 'grid', gridDensity = 'cozy' }) => {
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [imageMap, setImageMap] = useState({});
  const [lightbox, setLightbox] = useState({ open: false, src: '', title: '' });
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [selectAllIndeterminate, setSelectAllIndeterminate] = useState(false);

  // Update select all state
  React.useEffect(() => {
    const visibleSelectedCount = games.filter(game => selectedGames.has(game.Name)).length;
    setSelectAllChecked(visibleSelectedCount === games.length && games.length > 0);
    setSelectAllIndeterminate(visibleSelectedCount > 0 && visibleSelectedCount < games.length);
  }, [games, selectedGames]);

  // Load thumbnails progressively for current games list
  React.useEffect(() => {
    let isMounted = true;
    // Reset image map so items will show skeletons
    setImageMap({});
    (async () => {
      for (const g of games) {
        getGameImageUrl(g).then((url) => {
          if (!isMounted) return;
          setImageMap(prev => ({ ...prev, [g.Name]: url }));
        });
      }
    })();
    return () => { isMounted = false; };
  }, [games]);

  // Resolve fallback image that can have any extension
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const url = await getFallbackImageUrl();
      if (!mounted) return;
      setFallbackUrl(url || `${import.meta.env.BASE_URL}covers/fallback.jpg`);
    })();
    return () => { mounted = false; };
  }, []);

  // Compute grid density classes BEFORE any conditional returns
  const densityCfg = React.useMemo(() => {
    switch (gridDensity) {
      case 'compact':
        return { gap: 'gap-1 sm:gap-2', basis: 'basis-[180px] sm:basis-[200px]' };
      case 'comfortable':
        return { gap: 'gap-3 sm:gap-4', basis: 'basis-[260px] sm:basis-[300px]' };
      default:
        return { gap: 'gap-2 sm:gap-3', basis: 'basis-[220px] sm:basis-[250px]' };
    }
  }, [gridDensity]);

  const handleSelectAll = () => {
    const newState = !selectAllChecked;
    setSelectAllChecked(newState);
    onSelectAll(newState);
  };

  // For the new GRID, we do not group by letters. We'll sort by name once.
  const sortedForGrid = React.useMemo(
    () => [...games].sort((a, b) => (a.Name || '').localeCompare(b.Name || '')),
    [games]
  );
  // Group for GRID letter headers
  const groupedForGrid = React.useMemo(() => {
    const groups = {};
    for (const g of sortedForGrid) {
      const letter = (g.Name?.[0] || '#').toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(g);
    }
    return Object.keys(groups).sort().map(l => [l, groups[l]]);
  }, [sortedForGrid]);

  if (games.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card text-center py-12"
      >
        <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          لا توجد ألعاب مطابقة للبحث
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          جرب البحث بكلمات مختلفة
        </p>
      </motion.div>
    );
  }

  // Classic LIST layout (refined to match grid visual language)
  if (layoutMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-transparent"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">القائمة الكلاسيكية</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">{games.length} لعبة</div>
        </div>

        {/* Select All */}
        <div className="mb-3">
          <button onClick={handleSelectAll} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-200 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800">
              {selectAllChecked && <Check className="h-3 w-3 text-primary-600" />}
              {selectAllIndeterminate && !selectAllChecked && (<div className="w-3 h-0.5 bg-primary-600 rounded" />)}
            </div>
            <SquareCheckBig className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="font-medium">تحديد الكل</span>
          </button>
        </div>

        {/* Grouped rows by letter to align with grid sections */}
        <div className="space-y-6">
          {groupedForGrid.map(([letter, items]) => (
            <div key={`list-sec-${letter}`} className="space-y-2">
              {/* Themed letter header */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-extrabold tracking-widest bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-400/10 dark:text-primary-300 dark:border-primary-500/20">
                  {letter}
                </span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-neutral-800" />
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {items.map((g, idx) => {
                  const selected = selectedGames.has(g.Name);
                  return (
                    <label
                      key={`row-${g.Name}-${idx}`}
                      className="flex items-center gap-3 min-h-[44px]"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/40 px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className={`flex-1 text-right font-extrabold text-sm sm:text-base whitespace-normal break-words ${selected ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`} title={g.Name}>
                              {g.Name}
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              <span className="inline-block text-xs font-extrabold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-400/10 dark:text-primary-300 dark:border-primary-500/20 whitespace-nowrap">
                                {Number(g.SizeGB).toFixed(2)} GB
                              </span>
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-primary-600"
                                checked={selected}
                                onChange={() => onGameSelection(g.Name, !selected)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // GRID layout (new design)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-transparent"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">قائمة الألعاب</h2>
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
          <Gamepad2 className="h-4 w-4" />
          <span>{games.length} لعبة</span>
        </div>
      </div>

      {/* Select All (minimal) */}
      <div className="flex items-center space-x-3 space-x-reverse mb-3">
        <button
          onClick={handleSelectAll}
          className="flex items-center space-x-2 space-x-reverse text-sm text-gray-700 dark:text-gray-300"
        >
          <div className="relative">
            <input
              type="checkbox"
              checked={selectAllChecked}
              ref={(el) => {
                if (el) el.indeterminate = selectAllIndeterminate;
              }}
              onChange={handleSelectAll}
              className="sr-only"
            />
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-200 ${
              selectAllChecked 
                ? 'border-primary-500 bg-primary-500 shadow-md' 
                : selectAllIndeterminate
                ? 'border-primary-500 bg-primary-100 dark:bg-primary-900/30'
                : 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800'
            }`}>
              {selectAllChecked && <Check className="h-3 w-3 text-white" />}
              {selectAllIndeterminate && !selectAllChecked && (
                <div className="w-3 h-0.5 bg-primary-600 rounded" />
              )}
            </div>
          </div>
          <SquareCheckBig className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            تحديد الكل
          </span>
        </button>
      </div>

      {/* Grid with alphabetical headers */}
      <div className="w-full space-y-6">
        {groupedForGrid.map(([letter, items]) => (
          <div key={`sec-${letter}`} className="space-y-3">
            {/* Section header */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-extrabold tracking-widest bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-400/10 dark:text-primary-300 dark:border-primary-500/20">
                {letter}
              </span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-neutral-800" />
            </div>
            {/* Items grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((game, index) => {
            const selected = selectedGames.has(game.Name);
            return (
              <motion.button
                key={`${game.Name}-${game.Drive || 'D'}-${game.SizeGB}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: (index % 12) * 0.02 }}
                onClick={() => onGameSelection(game.Name, !selected)}
                className={`text-left rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-200 border border-gray-200 dark:border-neutral-800 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${selected ? 'ring-2 ring-green-500 ring-offset-0' : ''}`}
                aria-pressed={selected}
              >
                {/* Full-bleed image with bottom overlay (title + size) */}
                <div className="relative w-full aspect-[3/4] bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                  {imageMap[game.Name] === undefined ? (
                    <div className="w-full h-full skeleton" />
                  ) : (
                    (() => {
                      const raw = imageMap[game.Name] || fallbackUrl;
                      if (!raw) return <div className="w-full h-full skeleton" />;
                      const safe = encodeURI(raw);
                      return (
                        <div
                          aria-label={game.Name}
                          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
                          style={{
                            backgroundImage: `url("${safe}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                      );
                    })()
                  )}
                  {/* Selected */}
                  {selected && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white shadow">
                        <Check className="h-4 w-4" />
                      </span>
                    </div>
                  )}
                  {/* Smoothing gradient above overlay */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 sm:h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Bottom overlay with title and meta */}
                  <div className="absolute inset-x-0 bottom-0">
                    <div className="bg-black/75 backdrop-blur-md px-3 sm:px-3.5 py-2 sm:py-2.5">
                      <div className="text-white text-[15px] sm:text-base font-extrabold leading-snug whitespace-normal break-words" title={game.Name}>
                        {game.Name}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] sm:text-xs text-gray-100">
                        <span className="inline-block font-semibold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-200 border border-primary-500/30">
                          {Number(game.SizeGB).toFixed(2)} GB
                        </span>
                        <span className={`font-bold ${selected ? 'text-green-300' : 'text-gray-100'}`}>اضغط للتحديد</span>
                      </div>
                    </div>
                  </div>
                </div>
                
              </motion.button>
            );
          })}
            </div>
          </div>
        ))}
      </div>
      {/* Lightbox */}
      <AnimatePresence>
        {lightbox.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setLightbox({ open: false, src: '', title: '' })}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img src={lightbox.src} alt={lightbox.title} className="w-full max-h-[70vh] object-contain bg-black/5 dark:bg-white/5" />
                <button onClick={() => setLightbox({ open: false, src: '', title: '' })} className="absolute top-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded">إغلاق</button>
              </div>
              <div className="p-3 text-sm text-gray-700 dark:text-gray-300 text-center truncate">{lightbox.title}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GameList;
