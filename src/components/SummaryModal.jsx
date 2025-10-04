import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, MessageCircle, Package, HardDrive, Banknote } from 'lucide-react';

const SummaryModal = ({ summaryText, stats, selectedList = [], onApplySelection, onClose, onCopy, onWhatsApp, isDark = true }) => {
  const PALETTE = React.useMemo(() => ({
    textPrimary: isDark ? '#E5E7EB' : '#0f172a',
    // Use the same dark color for secondary text in light mode so sizes are readable
    textSecondary: isDark ? '#9AA1AD' : '#0f172a',
    surface: isDark ? '#1E2128' : '#f8fafc'
  }), [isDark]);
  const [localSelection, setLocalSelection] = React.useState(() => selectedList.map(g => g.Name));
  const initialNames = React.useMemo(() => selectedList.map(g => g.Name), [selectedList]);
  const hasChanges = React.useMemo(() => {
    const a = new Set(initialNames);
    const b = new Set(localSelection);
    if (a.size !== b.size) return true;
    for (const n of a) if (!b.has(n)) return true;
    return false;
  }, [initialNames, localSelection]);

  React.useEffect(() => {
    setLocalSelection(selectedList.map(g => g.Name));
  }, [selectedList]);

  // Real-time derived stats based on localSelection
  const derived = React.useMemo(() => {
    const selected = selectedList.filter(g => localSelection.includes(g.Name));
    const selectedCount = selected.length;
    const totalSizeNum = selected.reduce((sum, g) => sum + (parseFloat(g.SizeGB) || 0), 0);
    let totalPriceNum = totalSizeNum;
    if (totalSizeNum > 100) totalPriceNum /= 2; // same rule as App
    totalPriceNum = Math.round(totalPriceNum / 5) * 5;
    if (selectedCount > 0 && totalPriceNum < 20) totalPriceNum = 20;
    return {
      selectedCount,
      totalSize: totalSizeNum.toFixed(2),
      totalPrice: totalPriceNum.toFixed(2)
    };
  }, [localSelection, selectedList]);

  const applyAndClose = () => {
    if (hasChanges) {
      onApplySelection && onApplySelection(localSelection);
    }
    onClose && onClose();
  };

  // Apply without closing the modal
  const applyOnly = () => {
    if (hasChanges) {
      onApplySelection && onApplySelection(localSelection);
    }
    // If no games selected at all, dismiss the popup to avoid empty summary
    if (derived.selectedCount === 0) {
      onClose && onClose();
    }
  };

  // Discard without closing the modal
  const discardOnly = () => {
    setLocalSelection(initialNames);
  };

  const discardAndClose = () => {
    // Discard changes (revert to initialNames) and close
    setLocalSelection(initialNames);
    onClose && onClose();
  };

  const removedNames = React.useMemo(() => {
    const a = new Set(initialNames);
    const b = new Set(localSelection);
    const removed = [];
    for (const n of a) if (!b.has(n)) removed.push(n);
    return removed;
  }, [initialNames, localSelection]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/90"
        onClick={(e) => { /* ignore background clicks */ }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden mx-2 sm:mx-0"
          style={{
            background: isDark ? 'rgba(30, 33, 40, 0.95)' : 'rgba(255,255,255,0.92)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.45)' : '0 10px 24px rgba(0,0,0,0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 sm:p-6 border-b"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
              <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {hasChanges ? 'تأكيد التغييرات' : 'ملخص الطلب'}
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={applyAndClose}
              className="p-2 rounded-full transition-colors duration-200"
              style={{ backgroundColor: 'transparent' }}
            >
              <X className="h-5 w-5" style={{ color: '#9AA1AD' }} />
            </motion.button>
          </div>
          {/* Stats Summary (real-time) aligned with FloatingSummary tiles */}
          <div className="p-4 sm:p-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Count tile */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg"
                   style={{ background: isDark ? '#1E2128' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#039be4' }}>
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className={`text-xs ${isDark ? 'text-[#9AA1AD]' : 'text-gray-500'}`}>الألعاب</div>
                  <div className={`text-base sm:text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{derived.selectedCount}</div>
                </div>
              </div>

              {/* Size tile */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg"
                   style={{ background: isDark ? '#1E2128' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#16a34a' }}>
                  <HardDrive className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className={`text-xs ${isDark ? 'text-[#9AA1AD]' : 'text-gray-500'}`}>الحجم</div>
                  <div className={`text-base sm:text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{derived.totalSize} جيجا</div>
                </div>
              </div>

              {/* Price tile */}
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg"
                   style={{ background: isDark ? '#1E2128' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b' }}>
                  <Banknote className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className={`text-xs ${isDark ? 'text-[#9AA1AD]' : 'text-gray-500'}`}>السعر</div>
                  <div className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{derived.totalPrice} جنيه</div>
                </div>
              </div>
            </div>
          </div>
          {/* Review list (styled like website list rows) */}
          <div className="p-4 sm:p-6 max-h-64 sm:max-h-72 overflow-y-auto">
            <ul className="space-y-2">
              {selectedList.map((g, idx) => {
                const selected = localSelection.includes(g.Name);
                const size = Number(g.SizeGB ?? g.Size ?? g.size ?? 0).toFixed(2);
                const status = (g.__section || 'offline') === 'online' ? 'online' : 'offline';
                return (
                  <li key={`review-${g.Name}-${idx}`} className="min-w-0">
                    <label className="flex items-center gap-3 min-h-[44px] cursor-pointer w-full">
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
                                onChange={() => {
                                  setLocalSelection(prev => {
                                    const next = new Set(prev);
                                    if (next.has(g.Name)) next.delete(g.Name); else next.add(g.Name);
                                    return Array.from(next);
                                  });
                                }}
                              />
                            </div>
                            {/* Middle: title */}
                            <div className="order-2 flex-1 text-right font-extrabold text-sm sm:text-base whitespace-normal break-words" title={g.Name} style={{ color: selected ? '#039be4' : PALETTE.textPrimary }}>
                              {g.Name}
                            </div>
                            {/* Left: size | status */}
                            <div className="order-3 shrink-0 flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
                              <span style={{ color: PALETTE.textSecondary }}>{size} جيجا</span>
                              <span className="mx-1" style={{ color: PALETTE.textSecondary }}>|</span>
                              {status === 'online' ? (
                                <span className="font-extrabold" style={{ color: '#22c55e' }}>Online</span>
                              ) : (
                                <span className="font-extrabold" style={{ color: '#ef4444' }}>Offline</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* Changes summary and actions */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-white/10">
            {hasChanges && removedNames.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-bold mb-1 text-red-600 dark:text-red-500">سيتم إزالة الألعاب التالية:</div>
                <ul className="list-disc pr-5 text-sm space-y-1 text-gray-800 dark:text-gray-200">
                  {removedNames.map(name => (
                    <li key={`removed-${name}`}>{name}</li>
                  ))}
                </ul>
              </div>
            )}

            {!hasChanges ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onApplySelection && onApplySelection(localSelection); onWhatsApp && onWhatsApp(); }}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-3 rounded-lg font-semibold shadow-sm focus:outline-none transition"
                  style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
                  aria-label="ارسال عن طريق الواتساب"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">ارسال عن طريق الواتساب</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onApplySelection && onApplySelection(localSelection); onCopy && onCopy(); }}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-3 rounded-lg font-semibold shadow-sm transition"
                  style={{ backgroundColor: '#039be4', color: '#FFFFFF' }}
                  aria-label="نسخ القائمة"
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">نسخ القائمة</span>
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyOnly}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-3 rounded-lg font-semibold shadow-sm transition"
                  style={{ backgroundColor: '#039be4', color: '#FFFFFF' }}
                  aria-label="تطبيق التغييرات"
                >
                  <span className="text-sm">تطبيق التغييرات</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={discardOnly}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-3 rounded-lg font-semibold shadow-sm transition border border-gray-200 text-gray-600 dark:text-[#9AA1AD] dark:border-white/10 bg-transparent"
                  aria-label="تجاهل التغييرات"
                >
                  <span className="text-sm">تجاهل التغييرات</span>
                </motion.button>
              </div>
            )}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SummaryModal;