import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, HardDrive, Tag, CheckCircle } from 'lucide-react';

const SummaryBar = ({ stats, onOpenModal }) => {
  const { selectedCount, totalSize, totalPrice } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-40 glass-effect border-t border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 max-w-7xl">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          {/* 2x2 grid: top-left button, top-right counter; bottom tiles: size (left), price (right) */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Confirm button (top-left) */}
            <div className="col-start-1 row-start-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenModal}
                disabled={selectedCount === 0}
                className="btn-primary w-full flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm px-3 py-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>تأكيد الطلب</span>
              </motion.button>
            </div>

            {/* Selected counter (top-right), vertically centered */}
            <div className="col-start-2 row-start-1 text-right min-h-[44px] flex flex-col justify-center pr-1">
              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {selectedCount} لعبة
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">المحددة</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Total size tile (bottom-left) */}
            <div className="flex items-center space-x-2 space-x-reverse bg-gray-100 dark:bg-gray-800 px-2 py-2 rounded-lg min-h-[44px]">
              <HardDrive className="h-4 w-4 text-primary-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-600 dark:text-gray-400">الحجم الكلي</div>
                <div className="text-sm font-bold text-primary-600 dark:text-primary-400 truncate">
                  {totalSize} جيجا
                </div>
              </div>
            </div>
            {/* Price tile (bottom-right) */}
            <div className="flex items-center space-x-2 space-x-reverse bg-gray-100 dark:bg-gray-800 px-2 py-2 rounded-lg min-h-[44px]">
              <Tag className="h-4 w-4 text-accent-600 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-600 dark:text-gray-400">السعر</div>
                <div className="text-sm font-bold text-accent-600 dark:text-accent-400 truncate">
                  {totalPrice} جنيه
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 space-x-reverse">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 space-x-reverse bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg"
              >
                <HardDrive className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  الحجم الكلي:
                </span>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                  {totalSize} جيجا
                </span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 space-x-reverse bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg"
              >
                <Tag className="h-4 w-4 text-accent-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  السعر:
                </span>
                <span className="text-sm font-bold text-accent-600 dark:text-accent-400">
                  {totalPrice} جنيه
                </span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 space-x-reverse bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  المحددة:
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {selectedCount} لعبة
                </span>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenModal}
              disabled={selectedCount === 0}
              className="btn-primary flex items-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>تأكيد الطلب</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryBar;
