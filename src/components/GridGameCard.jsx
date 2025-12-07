import React from 'react';
import { Check } from 'lucide-react';
import OnlineBadge from './OnlineBadge';

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
  const statusColor = section === 'online' ? '#22c55e' : '#ef4444';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-transform duration-150 border border-gray-200 dark:border-neutral-800 relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${selected ? 'shadow-lg' : ''}`}
    >
      {/* Image area (3:4) */}
      <div className="relative z-0 w-full aspect-[3/4] bg-gray-200 dark:bg-neutral-800 overflow-hidden rounded-xl">
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
          className="w-full h-full object-cover select-none z-0"
        />

        {/* Selected bubble */}
        {selected && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white shadow">
              <Check className="h-4 w-4 text-white" />
            </span>
          </div>
        )}

        {/* Selected overlay to match site effect */}
        {selected && (
          <div aria-hidden className="absolute inset-0 pointer-events-none rounded-xl bg-primary-500/85" style={{ zIndex: 30 }} />
        )}

        {/* Online badge: bottom 25% with blurred gradient + badge image */}
        {section === 'online' && (
          <OnlineBadge 
            jsonName={jsonName}
            style={{ height: '25%' }}
          />
        )}

        {/* Bottom text block (no pills) */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-3.5">
          <div className="flex flex-col items-start gap-1.5 w-full">
            <div
              className={`text-[15px] sm:text-base font-extrabold leading-snug whitespace-normal break-words text-white`}
              dir="rtl"
            >
              {title}
            </div>

            {/* Info row: status dot + label and size as plain text */}
            <div dir="ltr" className="flex items-center gap-2 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1 text-gray-200">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusColor }}
                  aria-hidden="true"
                />
                <span>{section === 'online' ? 'Online' : 'Offline'}</span>
              </span>

              <span style={{ color: '#9AA1AD' }}>
                {Number(sizeGB).toFixed(2)} GB
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}