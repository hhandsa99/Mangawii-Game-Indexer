import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, ClipboardList, MessageCircle, Copy, Check, Search } from 'lucide-react';

const steps = [
  {
    key: 'step-search',
    title: 'ابحث عن الألعاب',
    description: 'تستطيع استخدام شريط البحث للوصول السريع إلى اللعبة التي تريدها.',
    demo: 'search'
  },
  {
    key: 'step-select',
    title: 'اختر لعبة',
    description: 'أولاً: قم بتحديد لعبة واحدة أو أكثر من القائمة الرئيسية بالضغط عليها.'
  },
  {
    key: 'step-confirm',
    title: 'تأكيد الطلب',
    description: 'ثانياً: اضغط على زر "تأكيد الطلب" لفتح الملخص ومراجعة اختيارك.',
    demo: 'confirm'
  },
  {
    key: 'step-send',
    title: 'الإرسال أو النسخ',
    description: 'أخيراً: اضغط على زر الواتساب لإرسال القائمة لنا، أو زر النسخ لنسخها.',
    demo: 'actions'
  }
];

const DemoConfirmBar = () => (
  <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3">
    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
      <ClipboardList className="h-5 w-5 text-primary-600" />
      <span className="text-sm font-semibold">ملخص الطلب</span>
    </div>
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
      aria-label="تأكيد الطلب (تجريبي)"
      onClick={(e) => e.preventDefault()}
    >
      <Check className="h-4 w-4" />
      <span>تأكيد الطلب</span>
    </button>
  </div>
);

const DemoSearch = () => (
  <div className="mt-3">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">شريط البحث (تجريبي)</label>
    <div className="flex items-center gap-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 shadow-sm">
      <Search className="h-5 w-5 text-gray-500" />
      <input
        type="text"
        disabled
        placeholder="ابحث باسم اللعبة..."
        className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
      />
      <button type="button" disabled className="text-sm px-3 py-1.5 rounded-md bg-primary-600 text-white">بحث</button>
    </div>
  </div>
);

const DemoActions = () => (
  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white shadow hover:bg-[#1ebe5d]"
      aria-label="ارسال عن طريق الواتساب (تجريبي)"
      onClick={(e) => e.preventDefault()}
    >
      <MessageCircle className="h-4 w-4" />
      <span>ارسال عن طريق الواتساب</span>
    </button>
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-neutral-800"
      aria-label="نسخ (تجريبي)"
      onClick={(e) => e.preventDefault()}
    >
      <Copy className="h-4 w-4" />
      <span>نسخ</span>
    </button>
  </div>
);

export default function WelcomeTour({ open, onClose }) {
  const [index, setIndex] = React.useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => {}}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-neutral-800 flex items-center gap-3">
              <Gamepad2 className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">دليل الاستخدام السريع</h2>
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                {step.title}
              </div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                {step.description}
              </p>

              {step.demo === 'confirm' && <DemoConfirmBar />}
              {step.demo === 'search' && <DemoSearch />}
              {step.demo === 'actions' && <DemoActions />}

              {/* Progress dots */}
              <div className="mt-5 flex items-center justify-center gap-2">
                {steps.map((s, i) => (
                  <span
                    key={s.key}
                    className={`h-2 w-2 rounded-full ${i === index ? 'bg-primary-600' : 'bg-gray-300 dark:bg-neutral-700'}`}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between">
              <button
                type="button"
                className="text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800"
                onClick={() => onClose && onClose('skip')}
              >
                تخطي
              </button>
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    className="text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800"
                    onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  >
                    السابق
                  </button>
                )}
                {!isLast ? (
                  <button
                    type="button"
                    className="text-sm px-4 py-2 rounded-md bg-primary-600 text-white font-semibold hover:bg-primary-700"
                    onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
                  >
                    التالي
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-sm px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
                    onClick={() => onClose && onClose('done')}
                  >
                    تم
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
