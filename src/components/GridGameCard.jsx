import React from 'react';
import { Check } from 'lucide-react';

export default function GridGameCard({
  title,
  sizeGB,
  section = 'offline', // 'online' | 'offline'
  selected = false,
  imageSrc,
  onClick,
  priority = false,
  jsonName = '', // Add for online badge
}) {
  const statusColor = section === 'online' ? '#22c55e' : 'rgba(251, 191, 36, 0.7)';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left rounded-none overflow-hidden bg-gradient-to-br from-discord-element to-discord-bg hover:to-discord-hover hover:-translate-y-1 transition-all duration-300 ease-out shadow-lg relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${selected ? 'ring-2 ring-primary-500 bg-discord-active' : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]'}`}
      style={{ border: '1px solid rgba(251, 191, 36, 0.7)' }}
    >
      {/* Image area (2:3 for 600x900 covers) */}
      <div className="relative z-0 w-full aspect-[2/3] bg-[#1E1F22] overflow-hidden">
        {/* Actual image */}
        <img
          src={imageSrc}
          alt={title}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={priority ? 'high' : 'low'}
          width={300}
          height={400}
          draggable={false}
          className="w-full h-full object-cover select-none z-0 transition-transform duration-300 group-hover:scale-105"
        />

        {/* Selected bubble */}
        {selected && (
          <div className="absolute top-2 right-2 z-40">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white shadow-lg border border-white/20">
              <Check className="h-4 w-4 text-white" />
            </span>
          </div>
        )}

        {/* Selected overlay */}
        {selected && (
          <div aria-hidden className="absolute inset-0 pointer-events-none bg-[#5865F2]/20 border-[3px] border-[#5865F2] rounded-md z-30" />
        )}

        {/* Bottom text block (Premium Glass) */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex flex-col items-center gap-1.5 w-full">
            <div
              className={`text-[15px] sm:text-base font-bold leading-snug text-gray-100 text-center drop-shadow-sm font-['gg_sans']`}
              dir="rtl"
            >
              {title}
            </div>

            {/* Info row */}
            <div dir="rtl" className="flex items-center gap-3 justify-center text-[11px] sm:text-xs text-gray-300">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
                  aria-hidden="true"
                />
                <span className="font-medium">{section === 'online' ? 'أونلاين' : 'كراك'}</span>
              </span>

              <span className="text-gray-400">|</span>

              <span className="font-medium text-gray-300">
                {Number(sizeGB).toFixed(1)} جيجا
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}