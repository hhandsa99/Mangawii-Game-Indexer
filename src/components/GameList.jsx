import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ImageOff, Gamepad2, SquareCheckBig } from 'lucide-react';
import { getGameImageUrl, getCachedImageUrlByName } from '../utils/imageProvider';

// GameImage component handles the image loading and display logic
const GameImage = ({ name, imageMap, loadedMap, setLoadedMap, priorityNames }) => {
  if (imageMap[name] === undefined) {
    return <div className="w-full h-full skeleton" />;
  }

  const preferred = imageMap[name];
  if (!preferred) {
    return <div className="w-full h-full skeleton" />;
  }

  const safe = encodeURI(preferred);
  const isPriority = priorityNames.has(name);
  const isLoaded = !!loadedMap[name];

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
        alt={name}
        loading={isPriority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={isPriority ? 'high' : 'low'}
        sizes="(min-width:1280px) 16.66vw, (min-width:1024px) 20vw, (min-width:768px) 25vw, (min-width:640px) 33.33vw, 50vw"
        width={300}
        height={400}
        draggable={false}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-out select-none transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.03] ${isLoaded ? 'opacity-100' : 'opacity-90'}`}
        onLoad={() => {
          setLoadedMap(prev => ({ ...prev, [name]: true }));
        }}
        onError={() => {
          // keep skeleton by not marking as loaded and not swapping to fallback
        }}
      />
    </>
  );
};

// Lazily resolve an image URL when a card enters the viewport
const LazyImage = ({ name, imageMap, setImageMap }) => {
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
  }, [name, imageMap, setImageMap]);
  return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
};

const GameList = ({ games, selectedGames, onGameSelection, onSelectAll, totalGames, layoutMode = 'grid', gridDensity = 'cozy', preloadVersion = 0, onAboveFoldReady, onLoadProgress, onCardContext }) => {
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [imageMap, setImageMap] = useState({});
  const [lightbox, setLightbox] = useState({ open: false, src: '', title: '' });
  
  const [selectAllIndeterminate, setSelectAllIndeterminate] = useState(false);
  const [loadedMap, setLoadedMap] = useState({});
  const signalledRef = React.useRef(false);

  // Update select all state
  React.useEffect(() => {
    const visibleSelectedCount = games.filter(game => {
      const gid = game.Id ?? game.id ?? game.Name;
      return selectedGames.has(gid);
    }).length;
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
  // Group for GRID sections by first letter
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

  // Track per-letter section positions to drive the floating right-side indicator
  const sectionRefs = React.useRef({});
  const [activeLetter, setActiveLetter] = React.useState(groupedForGrid[0]?.[0] || '');
  const [indicatorItems, setIndicatorItems] = React.useState([]); // [{letter, top}]
  React.useEffect(() => {
    // Reset when groups change
    sectionRefs.current = {};
    setActiveLetter(groupedForGrid[0]?.[0] || '');
  }, [groupedForGrid]);
  React.useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight || 0;
      const centerY = vh / 2;
      const pad = 20; // spacing from section bounds
      const visible = [];
      for (const [letter] of groupedForGrid) {
        const el = sectionRefs.current[letter];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= vh) continue; // not visible at all
        const topBound = r.top;
        const bottomBound = r.bottom;
        // Distance metric for picking the primary section (closest bound to center)
        const distToBounds = Math.min(Math.abs(centerY - topBound), Math.abs(centerY - bottomBound));
        visible.push({ letter, topBound, bottomBound, dist: distToBounds });
      }
      // Sort by closeness to center and pick primary section
      visible.sort((a, b) => a.dist - b.dist);
      const primary = visible[0];
      const out = [];
      if (primary) {
        setActiveLetter(primary.letter);
        out.push({ letter: primary.letter, top: primary.topBound + pad });
        out.push({ letter: primary.letter, top: primary.bottomBound - pad });
      }
      setIndicatorItems(out);
    };
    const onScrollRaf = () => requestAnimationFrame(onScroll);
    window.addEventListener('scroll', onScrollRaf, { passive: true });
    window.addEventListener('resize', onScrollRaf);
    // Initial position after mount
    onScrollRaf();
    return () => {
      window.removeEventListener('scroll', onScrollRaf);
      window.removeEventListener('resize', onScrollRaf);
    };
  }, [groupedForGrid, activeLetter]);

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
        <div className="flex items-center justify-between mb-4 max-w-[1423px] mx-auto px-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">القائمة الكلاسيكية</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">{games.length} لعبة</div>
        </div>

        {/* Select All */}
        <div className="mb-3">
          <button onClick={handleSelectAll} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="w-4 h-4"
              style={{ accentColor: '#039be4' }}
              checked={selectAllChecked}
              ref={(el) => { if (el) el.indeterminate = selectAllIndeterminate; }}
              onChange={handleSelectAll}
            />
            <SquareCheckBig className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="font-medium">تحديد الكل</span>
          </button>
        </div>

        {/* Grouped rows by letter to align with grid sections */}
        <div className="space-y-6 max-w-[1423px] mx-auto px-8">
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
                  const gid = g.Id ?? g.id ?? g.Name;
                  const selected = selectedGames.has(gid);
                  return (
                    <label
                      key={`row-${g.Name}-${idx}`}
                      className="flex items-center gap-3 min-h-[44px]"
                      onContextMenu={(e) => onCardContext && onCardContext(g.Name, e)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/40 px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            {/* Right: checkbox */}
                            <div className="shrink-0 order-1">
                              <input
                                type="checkbox"
                                className="w-4 h-4"
                                style={{ accentColor: '#039be4' }}
                                checked={selected}
                                onChange={() => onGameSelection(gid, !selected)}
                              />
                            </div>
                            {/* Middle: title */}
                            <div
                              className={`order-2 flex-1 text-right font-extrabold text-sm sm:text-base whitespace-normal break-words ${selected ? 'text-[#039be4]' : 'text-gray-900 dark:text-gray-200'}`}
                              title={g.Name}
                            >
                              {g.Name}
                            </div>
                            {/* Left: size/status plain text */}
                            <div className="order-3 shrink-0 flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
                              <span className="text-gray-600 dark:text-[#9AA1AD]">{Number(g.SizeGB ?? g.Size ?? g.size ?? 0).toFixed(2)} GB</span>
                              <span className="mx-1 text-gray-400 dark:text-[#9AA1AD]">|</span>
                              {(g.__section || 'offline') === 'online' ? (
                                <span className="font-extrabold" style={{ color: '#22c55e' }}>Online</span>
                              ) : (
                                <span className="font-extrabold" style={{ color: '#ef4444' }}>Offline</span>
                              )}
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
  // Hooks for section indicator are declared earlier to guarantee stable hook order.

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-transparent"
    >
      <div className="flex items-center justify-between mb-4 max-w-[1423px] mx-auto px-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">قائمة الألعاب</h2>
      </div>

      {/* Select All (minimal) */}
      <div className="flex items-center space-x-3 space-x-reverse mb-3 max-w-[1423px] mx-auto px-8">
        <button
          onClick={handleSelectAll}
          className="flex items-center space-x-2 space-x-reverse text-sm text-gray-700 dark:text-gray-300"
        >
          <input
            type="checkbox"
            checked={selectAllChecked}
            ref={(el) => { if (el) el.indeterminate = selectAllIndeterminate; }}
            onChange={handleSelectAll}
            className="w-4 h-4"
            style={{ accentColor: '#039be4' }}
          />
          <SquareCheckBig className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            تحديد الكل
          </span>
        </button>
        <div className="flex-1" />
        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-700 dark:text-gray-300">
          <Gamepad2 className="h-4 w-4" style={{ color: '#039be4' }} />
          <span>{games.length} لعبة</span>
        </div>
      </div>

      {/* Grid without in-flow headers; per-section sticky letters for first/last row */}
      <div className="w-full space-y-6 max-w-[1423px] mx-auto px-8">
        {groupedForGrid.map(([letter, items]) => (
          <div
            key={`sec-${letter}`}
            ref={(el) => { if (el) sectionRefs.current[letter] = el; }}
            className="space-y-3"
          >
            {/* Sticky letter centered at top of the section with a minimal separator above */}
            <div className="flex justify-center pointer-events-none">
              <div className="sticky top-24 w-full z-10">
                <div className="w-full flex justify-center mb-1">
                  <div className="h-px w-full bg-gray-200 dark:bg-neutral-800" />
                </div>
                <div className="px-2 py-1 rounded-md text-center text-gray-400 dark:text-gray-400 text-2xl sm:text-3xl font-extrabold tracking-widest">
                  {letter}
                </div>
              </div>
            </div>
            {/* Responsive grid: 2 cols (sm), 3 (md), 4 (lg), fixed 6x220.5px (xl+) */}
            <div
              className="grid gap-x-4 sm:gap-x-5 gap-y-8 sm:gap-y-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:[grid-template-columns:repeat(6,220.5px)] justify-center items-start"
            >
          {items.map((game, index) => {
            const gid = game.Id ?? game.id ?? game.Name;
            const selected = selectedGames.has(gid);
            return (
              <motion.button
                key={`${game.Name}-${game.Drive || 'D'}-${game.SizeGB}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: (index % 12) * 0.01 }}
                onClick={() => onGameSelection(gid, !selected)}
                onContextMenu={(e) => onCardContext && onCardContext(game.Name, e)}
                className={`text-left rounded-xl overflow-hidden bg-transparent dark:bg-transparent relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 w-full xl:w-[220.5px] flex flex-col`}
                aria-pressed={selected}
              >
                {/* Image (3:4) with ambient glow on hover */}
                <div className="relative z-0 w-full aspect-[3/4] transition-shadow duration-300 group-hover:shadow-[0_14px_48px_rgba(0,0,0,0.22)] dark:group-hover:shadow-[0_14px_48px_rgba(255,255,255,0.07)]">
                  {/* Clipped inner to keep rounded corners; outer wrapper holds shadow */}
                  <div className="absolute inset-0 bg-gray-200 dark:bg-neutral-800 overflow-hidden" style={{ clipPath: 'inset(0 round 12px)' }}>
                  {/* Ambient glow layer behind (no blur) */}
                  <div
                    className="pointer-events-none absolute -inset-2 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(120px 120px at 50% 85%, rgba(59,130,246,0.18), rgba(59,130,246,0))'
                    }}
                    aria-hidden="true"
                  />
                  {/* Trigger lazy resolution of image URL when in view */}
                  <LazyImage name={game.Name} imageMap={imageMap} setImageMap={setImageMap} />
                  <GameImage 
                    name={game.Name}
                    imageMap={imageMap}
                    loadedMap={loadedMap}
                    setLoadedMap={setLoadedMap}
                    priorityNames={priorityNames}
                  />
                  {/* Selected overlay: cover image with a big check and text */}
                  {selected && (
                    <div className="absolute inset-0 z-30 bg-black/60 grid place-items-center">
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Check className="w-10 h-10 sm:w-12 sm:h-12" />
                        <div className="text-sm sm:text-base font-extrabold">تم التحديد</div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
                {/* Title under image (unlimited lines) */}
                <div className="px-3 py-2">
                  <div className={`text-[15px] font-extrabold leading-snug whitespace-normal break-words text-gray-900 dark:text-white`} title={game.Name} dir="rtl">
                    {game.Name}
                  </div>
                  {/* Size | Status */}
                  <div dir="ltr" className="mt-1 text-[14px]">
                    <span className="text-gray-700 dark:text-[#9AA1AD]">{Number(game.SizeGB ?? game.Size ?? game.size ?? 0).toFixed(2)} GB</span>
                    <span className="mx-2 text-gray-400 dark:text-[#9AA1AD]">|</span>
                    {(game.__section || 'offline') === 'online' ? (
                      <span className="font-semibold" style={{ color: '#22c55e' }}>Online</span>
                    ) : (
                      <span className="font-semibold" style={{ color: '#ef4444' }}>Offline</span>
                    )}
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
