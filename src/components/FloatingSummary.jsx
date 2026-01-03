import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, HardDrive, Package, Banknote } from 'lucide-react';

// Fixed palette
const COLORS = {
  mainBgAlpha: 'rgba(21, 24, 32, 0.98)',
  headerBgAlpha: 'rgba(30, 33, 40, 0.95)',
  surface: '#1E2128',
  elevated: '#27292F',
  brand: '#039be4',
  textPrimary: '#E5E7EB',
  textSecondary: '#C7CCD6',
  textTertiary: '#9AA1AD',
  border: 'rgba(255,255,255,0.06)',
  shadow: '0 10px 30px rgba(0,0,0,0.45)'
};

export default function FloatingSummary({
  selectedCount = 0,
  totalSize = 0,
  totalPrice = 0,
  onViewDetails = () => {},
  onClear = () => {},
  isDark = true,
}) {
  const PALETTE = React.useMemo(() => {
    if (isDark) {
      return {
        containerBg: 'rgba(30, 33, 40, 0.95)',
        border: 'rgba(255,255,255,0.06)',
        textPrimary: '#E5E7EB',
        textSecondary: '#C7CCD6',
      };
    }
    return {
      containerBg: 'rgba(255,255,255,0.9)',
      border: 'rgba(0,0,0,0.06)',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
    };
  }, [isDark]);
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4 lg:p-6"
        >
          <div
            className="container mx-auto rounded-xl p-4 lg:p-6 backdrop-blur-lg"
            style={{
              background: PALETTE.containerBg,
              border: `1px solid ${PALETTE.border}`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
              backdropFilter: 'blur(16px)',
              willChange: 'opacity, transform, filter',
              WebkitBackdropFilter: 'blur(16px)',
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
              {/* Stats */}
              <div className="flex items-center gap-4 lg:gap-6 flex-1 w-full lg:w-auto">
                {/* Count (blue) */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: COLORS.brand }}>
                    <Package className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: PALETTE.textSecondary }}>الألعاب</div>
                    <div style={{ color: PALETTE.textPrimary }}>{selectedCount}</div>
                  </div>
                </div>

                {/* Size (green) */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#16a34a' }}>
                    <HardDrive className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: PALETTE.textSecondary }}>الحجم</div>
                    <div style={{ color: PALETTE.textPrimary }}>{Number(totalSize).toFixed(1)} جيجا</div>
                  </div>
                </div>

                {/* Price (orange) */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b' }}>
                    <Banknote className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: PALETTE.textSecondary }}>السعر</div>
                    <div style={{ color: PALETTE.textPrimary }}>{Number(totalPrice).toFixed(0)} جنيه</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={onClear}
                  className="flex-1 lg:flex-none px-6 h-12 rounded-lg transition-all hover:opacity-85"
                  style={{
                    background: COLORS.elevated,
                    color: COLORS.textSecondary,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  الغاء الكل
                </button>

                <button
                  onClick={onViewDetails}
                  className="flex-1 lg:flex-none px-8 h-12 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-95"
                  style={{
                    background: COLORS.brand,
                    color: '#FFFFFF',
                  }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>ملخص الطلب</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
