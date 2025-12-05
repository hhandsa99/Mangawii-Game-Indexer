import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Info, DollarSign } from 'lucide-react';

const InfoCards = ({ isDark = true }) => {
  const cards = [
    {
      id: 'contact',
      title: 'للتواصل',
      icon: Phone,
      content: (
        <div className="space-y-3" dir="rtl">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-brand, #039be4)' }} />
            <span className="text-sm">01204838286</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-brand, #039be4)' }} />
            <span className="text-sm">بورسعيد - شارع اوجينا و ابو الحسن</span>
          </div>
        </div>
      ),
    },
    {
      id: 'disclaimer',
      title: 'تنبيه هام',
      icon: Info,
      content: (
        <div className="text-sm leading-relaxed" dir="rtl">
          <p><span style={{ color: 'var(--accent-brand, #039be4)' }}>هذا ليس موقع تحميل العاب</span> و لكنه يوضح الالعاب المتاحة لدينا في تكنيكال ستور</p>
        </div>
      ),
    },
    {
      id: 'pricing',
      title: 'طريقة احتساب السعر',
      icon: DollarSign,
      content: (
        <div className="space-y-2 text-sm" dir="rtl">
          <div className="flex justify-between items-center py-1.5 px-2 rounded" style={{ background: 'rgba(3, 155, 228, 0.06)' }}>
            <span>أقل من 100 جيجا</span>
            <span style={{ color: 'var(--accent-brand, #039be4)' }}>الجيجا = جنية</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 rounded" style={{ background: 'rgba(3, 155, 228, 0.06)' }}>
            <span>اكثر من 100 جيجا</span>
            <span style={{ color: 'var(--accent-brand, #039be4)' }}>الجيجا = نصف جنية</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[1423px] mx-auto px-8 pt-4 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.38 }}
              className="rounded-lg p-4 md:p-5 border transition-all duration-300 hover:border-opacity-60"
                style={{
                  background: isDark ? 'rgba(30,33,40,0.6)' : 'rgba(255,255,255,0.98)',
                  border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)'
                }}
            >
              <div className="flex items-center gap-3 mb-3" dir="rtl">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(3, 155, 228, 0.12)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--accent-brand, #039be4)' }} />
                </div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: isDark ? 'var(--text-primary, #e5e7eb)' : '#0f172a' }}
                  >
                  {card.title}
                </h3>
              </div>

                <div style={{ color: isDark ? 'var(--text-secondary, #9aa1ad)' : '#475569' }}>
                {card.content}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InfoCards;
