import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, MessageCircle, ClipboardList } from 'lucide-react';

const SummaryModal = ({ summaryText, stats, selectedList = [], onApplySelection, onClose, onCopy, onWhatsApp }) => {
  const { selectedCount, totalSize, totalPrice } = stats;
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

          {/* Stats Summary */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedCount}
                </div>
                <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                  لعبة محددة
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalSize}
                </div>
                <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                  جيجا
                </div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {totalPrice}
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
          <div className="flex space-x-2 sm:space-x-3 space-x-reverse p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onApplySelection && onApplySelection(localSelection); onWhatsApp && onWhatsApp(); }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 space-x-reverse"
            >
              <MessageCircle className="h-4 w-4" />
              <span>واتساب</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onApplySelection && onApplySelection(localSelection); onCopy && onCopy(); }}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2 space-x-reverse"
            >
              <Copy className="h-4 w-4" />
              <span>نسخ</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SummaryModal;
