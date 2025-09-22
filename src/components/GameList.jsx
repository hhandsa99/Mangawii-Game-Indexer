import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ImageOff, Gamepad2 } from 'lucide-react';
import { getGameImageUrl } from '../utils/imageProvider';

const GameList = ({ games, selectedGames, onGameSelection, onSelectAll, totalGames, layoutMode = 'grid' }) => {
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [imageMap, setImageMap] = useState({});
  const [lightbox, setLightbox] = useState({ open: false, src: '', title: '' });
  const [selectAllIndeterminate, setSelectAllIndeterminate] = useState(false);

  // Update select all state
  React.useEffect(() => {
    const visibleSelectedCount = games.filter(game => selectedGames.has(game.Name)).length;
    setSelectAllChecked(visibleSelectedCount === games.length && games.length > 0);
    setSelectAllIndeterminate(visibleSelectedCount > 0 && visibleSelectedCount < games.length);
  }, [games, selectedGames]);

  // Load thumbnails for current games list
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      const entries = await Promise.all(
        games.map(async (g) => {
          const url = await getGameImageUrl(g.Name);
          return [g.Name, url];
        })
      );
      if (!isMounted) return;
      const next = Object.fromEntries(entries);
      setImageMap(next);
    })();
    return () => { isMounted = false; };
  }, [games]);

  const handleSelectAll = () => {
    const newState = !selectAllChecked;
    setSelectAllChecked(newState);
    onSelectAll(newState);
  };

  // Group by first letter for big alphabetical lettering
  const groupedGames = games.reduce((groups, game) => {
    const letter = (game.Name?.[0] || '#').toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(game);
    return groups;
  }, {});
  const sortedLetters = Object.keys(groupedGames).sort();
  const [activeLetter, setActiveLetter] = useState('');
  const [hoverLetter, setHoverLetter] = useState('');

  // Highlight current letter section while scrolling
  React.useEffect(() => {
    const sections = Array.from(document.querySelectorAll('[data-letter-section]'));
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        // Pick the section with maximum intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const l = visible.target.getAttribute('data-letter-section') || '';
          setActiveLetter(l);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sortedLetters]);

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

  // Classic LIST layout (table-like, simple)
  if (layoutMode === 'list') {
    // Prepare rows sorted by name with letter separators
    const sorted = [...games].sort((a,b)=> (a.Name||'').localeCompare(b.Name||''));
    let lastLetter = '';
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-transparent"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">قائمة الألعاب</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">{games.length} لعبة</div>
        </div>

        {/* Select All */}
        <div className="mb-2">
          <button onClick={handleSelectAll} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-200 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800">
              {selectAllChecked && <Check className="h-3 w-3 text-primary-600" />}
              {selectAllIndeterminate && !selectAllChecked && (<div className="w-3 h-0.5 bg-primary-600 rounded" />)}
            </div>
            <span className="font-medium">تحديد الكل</span>
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <table className="w-full table-fixed text-right">
            <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 text-sm">
              <tr>
                <th className="w-12 p-3"> </th>
                <th className="p-3 w-auto">اسم اللعبة</th>
                <th className="w-28 p-3">الحجم</th>
              </tr>
            </thead>
            <tbody className="text-gray-900 dark:text-gray-100">
              {sorted.map((g, idx) => {
                const letter = (g.Name?.[0] || '#').toUpperCase();
                const isSep = letter !== lastLetter;
                if (isSep) lastLetter = letter;
                return (
                  <React.Fragment key={`row-${g.Name}-${idx}`}>
                    {isSep && (
                      <tr className="bg-primary-50 dark:bg-primary-500/10">
                        <td colSpan={3} className="p-2 font-extrabold tracking-widest text-primary-700 dark:text-primary-300">{letter}</td>
                      </tr>
                    )}
                    <tr className="border-t border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors">
                      <td className="p-3 align-middle">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-primary-600"
                          checked={selectedGames.has(g.Name)}
                          onChange={() => onGameSelection(g.Name, !selectedGames.has(g.Name))}
                        />
                      </td>
                      <td className="p-3 align-middle break-words whitespace-normal">
                        <button onClick={() => onGameSelection(g.Name, !selectedGames.has(g.Name))} className={`font-extrabold text-right ${selectedGames.has(g.Name) ? 'text-green-600' : ''}`}>{g.Name}</button>
                      </td>
                      <td className="p-3 align-middle">
                        <span className="inline-block text-xs font-extrabold px-2 py-0.5 rounded-full bg-primary-600 text-white whitespace-nowrap">{Number(g.SizeGB).toFixed(2)} GB</span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }

  // GRID layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-transparent"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
          قائمة الألعاب
        </h2>
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
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            تحديد الكل
          </span>
        </button>
      </div>

      {/* Games Grid by letter (page scroll, not inner scroll) */}
      <div className="space-y-6">
        {sortedLetters.map((letter) => (
          <div
            key={`section-${letter}`}
            data-letter-section={letter}
            className={"relative transition-all duration-300 py-2"}
          >
            {/* Stroke wrapper that hugs cards width */}
            <div
              onMouseEnter={() => setHoverLetter(letter)}
              onMouseLeave={() => setHoverLetter('')}
              className={`relative inline-block rounded-2xl px-4 py-4 border-2 transition-all ${
                (hoverLetter ? hoverLetter === letter : activeLetter === letter)
                  ? 'border-primary-500 shadow-lg bg-primary-50 dark:bg-primary-500/10'
                  : 'border-transparent bg-transparent'
              } ${layoutMode === 'grid' ? 'hover:border-primary-500 hover:shadow-lg hover:bg-primary-50/70 dark:hover:bg-primary-500/10' : ''}`}
            >
              {/* Letter badge aligned to stroke */}
              <div className="absolute -top-3 left-4">
                <span
                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-extrabold tracking-widest ${
                    activeLetter === letter
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-neutral-800 dark:text-gray-100'
                  }`}
                >
                  {letter}
                </span>
              </div>
              <div className={`${layoutMode === 'list' ? 'flex flex-col gap-1 sm:gap-2' : 'flex flex-wrap gap-2 sm:gap-3'}`}>
                {groupedGames[letter].map((game, index) => {
                const selected = selectedGames.has(game.Name);
                return (
                    layoutMode === 'list' ? (
                      <label
                        key={`${game.Name}-${game.Drive || 'D'}-${game.SizeGB}-${index}`}
                        className={`w-full flex items-start gap-2 rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 cursor-pointer ${selected ? 'ring-2 ring-green-500' : ''} overflow-hidden`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 w-4 h-4 accent-primary-600"
                          checked={selected}
                          onChange={() => onGameSelection(game.Name, !selected)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-primary-600 text-white whitespace-nowrap">{Number(game.SizeGB).toFixed(2)} GB</span>
                            <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-gray-100 whitespace-normal break-words break-all leading-snug min-w-0" title={game.Name}>{game.Name}</span>
                          </div>
                        </div>
                      </label>
                    ) : (
                      <motion.button
                        key={`${game.Name}-${game.Drive || 'D'}-${game.SizeGB}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: (index % 12) * 0.02 }}
                        onClick={() => onGameSelection(game.Name, !selected)}
                        className={`basis-[220px] sm:basis-[250px] grow-0 shrink-0 text-left rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-200 dark:border-neutral-800 ${selected ? 'outline outline-2 outline-green-500 outline-offset-0' : ''}`}
                        aria-pressed={selected}
                      >
                        {/* Top: image (RAWG-like prominence; taller on desktop) */}
                        <div className="w-full aspect-[16/9] sm:aspect-[16/9] lg:h-48 bg-gray-100 dark:bg-neutral-800">
                          {imageMap[game.Name] ? (
                            <img src={imageMap[game.Name]} alt={game.Name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageOff className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        {/* Bottom: info panel */}
                        <div className="p-2 sm:p-2.5 lg:p-3 bg-white text-gray-900 dark:bg-[#202020] dark:text-white">
                          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                            <div className="text-[10px] sm:text-[11px] lg:text-xs font-extrabold px-2 py-0.5 rounded-full bg-primary-600/90 text-white">
                              {Number(game.SizeGB).toFixed(2)} GB
                            </div>
                          </div>
                          <div className={`text-sm sm:text-base lg:text-lg font-extrabold whitespace-normal leading-snug min-h-[36px] sm:min-h-[44px] lg:min-h-[48px] ${selected ? 'text-green-600' : ''}`} title={game.Name}>{game.Name}</div>
                        </div>
                      </motion.button>
                    )
                );
              })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* A–Z rail removed per request */}
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
