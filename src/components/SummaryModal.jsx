import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, MessageCircle, ClipboardList } from 'lucide-react';

const SummaryModal = ({ summaryText, stats, selectedList = [], onApplySelection, onClose, onCopy, onWhatsApp }) => {
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
    if (!hasChanges) {
      onClose && onClose();
      return;
    }
    const shouldApply = window.confirm('تأكيد التغييرات؟ سيتم تطبيق التحديدات الحالية.');
    if (shouldApply) {
      onApplySelection && onApplySelection(localSelection);
    }
    onClose && onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={applyAndClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden mx-2 sm:mx-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
              <ClipboardList className="h-5 sm:h-6 w-5 sm:w-6 text-primary-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                ملخص الطلب
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={applyAndClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>

          {/* Stats Summary (real-time) */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {derived.selectedCount}
                </div>
                <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                  لعبة محددة
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {derived.totalSize}
                </div>
                <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                  جيجا
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {derived.totalPrice}
                </div>
                <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">
                  جنيه
                </div>
              </div>
            </div>
          </div>

          {/* Review checklist */}
          <div className="p-4 sm:p-6 max-h-64 sm:max-h-72 overflow-y-auto">
            <ul className="space-y-2">
              {selectedList.map((g) => (
                <li key={`review-${g.Name}`} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 min-w-0">
                  <label className="flex flex-wrap items-start gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={localSelection.includes(g.Name)}
                      onChange={() => {
                        setLocalSelection(prev => {
                          const next = new Set(prev);
                          if (next.has(g.Name)) next.delete(g.Name); else next.add(g.Name);
                          return Array.from(next);
                        });
                      }}
                      className="w-4 h-4 accent-primary-600"
                    />
                    <span className="font-semibold text-gray-900 dark:text-gray-100 flex-1 min-w-0 whitespace-normal break-words leading-snug">{g.Name}</span>
                    <span className="shrink-0 self-start text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-primary-600 text-white whitespace-nowrap ml-auto">{Number(g.SizeGB).toFixed(2)} GB</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onApplySelection && onApplySelection(localSelection); onWhatsApp && onWhatsApp(); }}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg min-h-[44px] bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20b558] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 transition"
              aria-label="ارسال عن طريق الواتساب"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">ارسال عن طريق الواتساب</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onApplySelection && onApplySelection(localSelection); onCopy && onCopy(); }}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg min-h-[44px] border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 transition"
              aria-label="نسخ"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm">نسخ</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SummaryModal;
