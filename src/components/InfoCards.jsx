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
            <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#b473f5' }} />
            <span className="text-sm">01204838286</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#b473f5' }} />
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
          <p><span style={{ color: '#fbbf24', fontWeight: 'bold' }}>هذا ليس موقع تحميل العاب</span> و لكنه يوضح الالعاب المتاحة لدينا في تكنيكال ستور</p>
        </div>
      ),
    },
    {
      id: 'pricing',
      title: 'طريقة احتساب السعر',
      icon: DollarSign,
      content: (
        <div className="space-y-2 text-sm" dir="rtl">
          <div className="flex justify-between items-center py-1.5 px-2 rounded" style={{ background: 'rgba(180,115,245, 0.08)', border: '1px solid rgba(180,115,245,0.1)' }}>
            <span>أقل من 100 جيجا</span>
            <span style={{ color: '#dea0d6', fontWeight: 'bold' }}>الجيجا = جنية</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 rounded" style={{ background: 'rgba(180,115,245, 0.08)', border: '1px solid rgba(180,115,245,0.1)' }}>
            <span>اكثر من 100 جيجا</span>
            <span style={{ color: '#dea0d6', fontWeight: 'bold' }}>الجيجا = نصف جنية</span>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
              className="rounded-2xl p-5 md:p-6 transition-all duration-300 group hover:-translate-y-1 relative"
              style={{
                // Static Luxury Glass
                background: isDark ? 'rgba(15, 16, 20, 0.85)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isDark ? '1px solid rgba(251, 191, 36, 0.15)' : '1px solid rgba(0,0,0,0.04)',
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.05)'
              }}
            >
              <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
              />
              <div className="flex items-center gap-4 mb-4 relative z-10" dir="rtl">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(180,115,245,0.3)]"
                  style={{ background: 'linear-gradient(135deg, rgba(180,115,245,0.1), rgba(226,146,170,0.1))', border: '1px solid rgba(180,115,245,0.2)' }}
                >
                  <Icon className="w-6 h-6 transition-colors duration-300" style={{ color: '#dea0d6' }} />
                </div>
                <h3
                  className="text-lg font-bold tracking-wide"
                  style={{ color: isDark ? '#fff' : '#0f172a' }}
                >
                  {card.title}
                </h3>
              </div>

              <div className="leading-relaxed opacity-90 relative z-10" style={{ color: isDark ? '#B5BAC1' : '#475569' }}>
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
