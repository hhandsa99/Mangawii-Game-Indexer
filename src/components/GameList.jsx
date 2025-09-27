import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ImageOff, Gamepad2, SquareCheckBig } from 'lucide-react';
import { getGameImageUrl, getCachedImageUrlByName } from '../utils/imageProvider';

const GameList = ({ games, selectedGames, onGameSelection, onSelectAll, totalGames, layoutMode = 'grid', gridDensity = 'cozy', preloadVersion = 0, onAboveFoldReady, onLoadProgress }) => {
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [imageMap, setImageMap] = useState({});
  const [lightbox, setLightbox] = useState({ open: false, src: '', title: '' });
  
  const [selectAllIndeterminate, setSelectAllIndeterminate] = useState(false);
  const [loadedMap, setLoadedMap] = useState({});
  const signalledRef = React.useRef(false);

  // Update select all state
  React.useEffect(() => {
    const visibleSelectedCount = games.filter(game => selectedGames.has(game.Name)).length;
    setSelectAllChecked(visibleSelectedCount === games.length && games.length > 0);
    setSelectAllIndeterminate(visibleSelectedCount > 0 && visibleSelectedCount < games.length);
  }, [games, selectedGames]);

  // Seed from session cache so reload/view switches show instantly; lazily resolve missing via IO
  React.useEffect(() => {
    const initial = {};
    for (const g of games) {
      const u = getCachedImageUrlByName(g.Name);
      if (u) initial[g.Name] = u;
    }
    setImageMap(initial);
    setLoadedMap({});
  }, [games, preloadVersion]);

  // No fallback image: keep skeleton when URL missing or fails

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

  // Keep a notion of priority items for rendering hints (e.g., fetchpriority)
  const priorityNames = React.useMemo(() => {
    const N = 1; // first item only
    return new Set(sortedForGrid.slice(0, N).map(g => g.Name));
  }, [sortedForGrid]);

  // Eagerly resolve and start loading the first 24 images so they load behind the overlay
  React.useEffect(() => {
    if (layoutMode === 'list') return; // list has no images
    let cancelled = false;
    const firstNames = sortedForGrid.slice(0, 24).map(g => g.Name);
    (async () => {
      for (const name of firstNames) {
        // If we already have a URL, just kick off loading
        let url = imageMap[name];
        if (!url) {
          try { url = await getGameImageUrl({ Name: name }); } catch (_) {}
          if (cancelled) return;
          if (url) setImageMap(prev => ({ ...prev, [name]: url }));
        }
        if (url) {
          try {
            const img = new Image();
            img.decoding = 'async';
            img.referrerPolicy = 'no-referrer';
            img.src = encodeURI(url);
          } catch (_) {}
        }
      }
    })();
    return () => { cancelled = true; };
  }, [sortedForGrid, layoutMode]);

  // Lightweight readiness: signal when the first 12 images have loaded
  React.useEffect(() => {
    if (signalledRef.current) return;
    if (!onAboveFoldReady || typeof onAboveFoldReady !== 'function') return;
    if (layoutMode === 'list') return; // list handled elsewhere
    const first = sortedForGrid.slice(0, 12).map(g => g.Name);
    if (first.length === 0) return;
    const allLoaded = first.every(n => !!loadedMap[n]);
    if (allLoaded) {
      signalledRef.current = true;
      try { onAboveFoldReady(); } catch (_) {}
    }
  }, [sortedForGrid, loadedMap, layoutMode, onAboveFoldReady]);

  // If list layout, there are no images to wait for; signal immediately
  React.useEffect(() => {
    if (signalledRef.current) return;
    if (!onAboveFoldReady || typeof onAboveFoldReady !== 'function') return;
    if (layoutMode === 'list') {
      signalledRef.current = true;
      try { onAboveFoldReady(); } catch (_) {}
    }
  }, [layoutMode, onAboveFoldReady]);

  // Report real loading progress for the preloader overlay
  React.useEffect(() => {
    if (typeof onLoadProgress !== 'function') return;
    if (layoutMode === 'list') {
      const t = Math.min(100, games.length || 0);
      onLoadProgress(t, t);
      return;
    }
    const firstNames = sortedForGrid.slice(0, 100).map(g => g.Name);
    const target = firstNames.length;
    if (target === 0) {
      onLoadProgress(0, 1);
      return;
    }
    const loaded = firstNames.reduce((acc, n) => acc + (loadedMap[n] ? 1 : 0), 0);
    onLoadProgress(loaded, target);
  }, [loadedMap, sortedForGrid, games.length, layoutMode, onLoadProgress]);

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
                            {/* Right: checkbox */}
                            <div className="shrink-0 order-1">
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-primary-600"
                                checked={selected}
                                onChange={() => onGameSelection(g.Name, !selected)}
                              />
                            </div>
                            {/* Middle: title */}
                            <div className={`order-2 flex-1 text-right font-extrabold text-sm sm:text-base whitespace-normal break-words ${selected ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`} title={g.Name}>
                              {g.Name}
                            </div>
                            {/* Left: size/status pills */}
                            <div className="order-3 shrink-0 flex items-center gap-2">
                              {/* Size pill */}
                              <span className="inline-block text-xs font-extrabold px-2 py-0.5 rounded-md bg-primary-600 text-white border border-primary-700 whitespace-nowrap">
                                {Number(g.SizeGB).toFixed(2)} GB
                              </span>
                              {/* Status pill: green for online, red for offline */}
                              <span
                                className={`inline-block text-xs font-extrabold px-2 py-0.5 rounded-md border whitespace-nowrap ${
                                  (g.__section || 'offline') === 'online'
                                    ? 'bg-green-600 text-white border-green-700'
                                    : 'bg-red-600 text-white border-red-700'
                                }`}
                              >
                                {(g.__section || 'offline') === 'online' ? 'Online' : 'Offline'}
                              </span>
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
        {/* Mobile spacer to account for fixed SummaryBar height */}
        <div className="h-40 sm:h-0" aria-hidden="true" />
      </motion.div>
    );
  }

  // GRID layout (new design)
  // Lazily resolve an image URL when a card enters the viewport
  const LazyImage = ({ name }) => {
    const ref = React.useRef(null);
    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (imageMap[name] !== undefined) return; // already requested/resolved
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Mark as requested to avoid duplicate work
            setImageMap(prev => (prev[name] === undefined ? { ...prev, [name]: '' } : prev));
            getGameImageUrl({ Name: name }).then((url) => {
              setImageMap(prev => ({ ...prev, [name]: url }));
            });
            observer.disconnect();
          }
        });
      }, { rootMargin: '200px' });
      observer.observe(el);
      return () => observer.disconnect();
    }, [name, imageMap]);
    return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
  };

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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: (index % 12) * 0.01 }}
                onClick={() => onGameSelection(game.Name, !selected)}
                className={`text-left rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-transform duration-150 border border-gray-200 dark:border-neutral-800 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${selected ? 'ring-2 ring-green-500 ring-offset-0' : ''}`}
                aria-pressed={selected}
              >
                {/* Full-bleed image with bottom overlay (title + size) */}
                <div
                  className="relative z-0 w-full aspect-[3/4] bg-gray-200 dark:bg-neutral-800 overflow-hidden"
                  style={{ clipPath: 'inset(0 round 12px)' }}
                >
                  {/* Trigger lazy resolution of image URL when in view */}
                  <LazyImage name={game.Name} />
                  {imageMap[game.Name] === undefined ? (
                    <div className="w-full h-full skeleton" />
                  ) : (
                    (() => {
                      const preferred = imageMap[game.Name];
                      const chosen = preferred; // no fallback
                      if (!chosen) return <div className="w-full h-full skeleton" />;
                      const safe = encodeURI(chosen);
                      const isPriority = priorityNames.has(game.Name);
                      const isLoaded = !!loadedMap[game.Name];
                      return (
                        <>
                          {/* LQIP placeholder (blurred gradient) */}
                          <div
                            className={`absolute inset-0 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
                            aria-hidden="true"
                          >
                            <div className="w-full h-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 animate-pulse" />
                          </div>
                          <img
                            src={safe}
                            alt={game.Name}
                            loading={isPriority ? 'eager' : 'lazy'}
                            decoding="async"
                            fetchpriority={isPriority ? 'high' : 'low'}
                            sizes="(min-width:1280px) 16.66vw, (min-width:1024px) 20vw, (min-width:768px) 25vw, (min-width:640px) 33.33vw, 50vw"
                            width={300}
                            height={400}
                            draggable={false}
                            className={`w-full h-full object-cover transition-opacity duration-500 ease-out select-none ${isLoaded ? 'opacity-100' : 'opacity-90'}`}
                            onLoad={() => {
                              setLoadedMap(prev => ({ ...prev, [game.Name]: true }));
                            }}
                            onError={() => {
                              // keep skeleton by not marking as loaded and not swapping to fallback
                            }}
                          />
                        </>
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
                  {/* Smoothing gradient above overlay (layered above image) */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 sm:h-16 bg-gradient-to-t from-black/20 dark:from-black/60 to-transparent z-10" />
                  {/* Bottom overlay with title above and pills left (layered above gradient) */}
                  <div className="absolute inset-x-0 bottom-0 z-20">
                    {/* Light translucent white in light mode; dark translucent black in dark mode */}
                    <div className="bg-white/70 dark:bg-black/75 backdrop-blur-md px-3 sm:px-3.5 py-2 sm:py-2.5">
                      <div className="flex flex-col items-start gap-1.5 w-full">
                        {/* Title above (Arabic), left positioned with RTL text direction */}
                        <div
                          className={`text-[15px] sm:text-base font-extrabold leading-snug whitespace-normal break-words ${selected ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}
                          title={game.Name}
                          dir="rtl"
                        >
                          {game.Name}
                        </div>
                        {/* Pills below on the left */}
                        <div dir="ltr" className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-700 dark:text-gray-100">
                          <span className="inline-block font-semibold px-2 py-0.5 rounded-md bg-primary-600 text-white border border-primary-700">
                            {Number(game.SizeGB).toFixed(2)} GB
                          </span>
                          <span
                            className={`inline-block font-semibold px-2 py-0.5 rounded-md border ${
                              (game.__section || 'offline') === 'online'
                                ? 'bg-green-600 text-white border-green-700'
                                : 'bg-red-600 text-white border-red-700'
                            }`}
                          >
                            {(game.__section || 'offline') === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
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
      {/* Mobile spacer to account for fixed SummaryBar height */}
      <div className="h-40 sm:h-0" aria-hidden="true" />
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
