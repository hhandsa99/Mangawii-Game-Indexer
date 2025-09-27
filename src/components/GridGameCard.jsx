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
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-transform duration-150 border border-gray-200 dark:border-neutral-800 relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${selected ? 'ring-2 ring-green-500 ring-offset-0' : ''}`}
    >
      {/* Image area (3:4) */}
      <div
        className="relative z-0 w-full aspect-[3/4] bg-gray-200 dark:bg-neutral-800 overflow-hidden rounded-xl"
      >
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
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white shadow">
              <Check className="h-4 w-4" />
            </span>
          </div>
        )}

        {/* Gradient above bottom overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 sm:h-16 bg-gradient-to-t from-black/20 dark:from-black/60 to-transparent z-10" />

        {/* Bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="bg-white/70 dark:bg-black/75 backdrop-blur-md px-3 sm:px-3.5 py-2 sm:py-2.5">
            <div className="flex flex-col items-start gap-1.5 w-full">
              {/* Title above (Arabic), kept RTL but positioned on left */}
              <div className={`text-[15px] sm:text-base font-extrabold leading-snug whitespace-normal break-words ${selected ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`} dir="rtl">
                {title}
              </div>
              {/* Pills below on the left */}
              <div dir="ltr" className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-700 dark:text-gray-100">
                <span className="inline-block font-semibold px-2 py-0.5 rounded-md bg-primary-600 text-white border border-primary-700">
                  {Number(sizeGB).toFixed(2)} GB
                </span>
                <span
                  className={`inline-block font-semibold px-2 py-0.5 rounded-md border ${section === 'online' ? 'bg-green-600 text-white border-green-700' : 'bg-red-600 text-white border-red-700'}`}
                >
                  {section === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
