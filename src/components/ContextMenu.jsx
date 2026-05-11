import React from 'react';
import { Copy, Search, Youtube, MapPin } from 'lucide-react';

export default function ContextMenu({ open, x, y, gameName, onClose, isDark = true, showLocation = false, onToggleLocation }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    const onScroll = () => onClose?.();
    document.addEventListener('mousedown', onDocClick, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDocClick, true);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, onClose]);

  // Hooks that must always run to keep order stable
  const [pos, setPos] = React.useState({ left: x, top: y });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vw = window.innerWidth; const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();
    let left = x; let top = y;
    if (left + rect.width > vw) left = Math.max(8, vw - rect.width - 8);
    if (top + rect.height > vh) top = Math.max(8, vh - rect.height - 8);
    setPos({ left, top });
  }, [x, y, open]);

  if (!open) return null;

  const actions = [
    {
      label: 'نسخ اسم اللعبة',
      icon: <Copy className="w-4 h-4" />,
      run: async () => {
        try { await navigator.clipboard.writeText(gameName || ''); } catch (_) { }
        onClose?.();
      },
    },
    {
      label: 'بحث Google',
      icon: <Search className="w-4 h-4" />,
      run: () => {
        const q = encodeURIComponent(gameName || '');
        window.open(`https://www.google.com/search?q=${q}`, '_blank');
        onClose?.();
      },
    },
    {
      label: 'بحث YouTube',
      icon: <Youtube className="w-4 h-4" />,
      run: () => {
        const q = encodeURIComponent(gameName || '');
        window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank');
        onClose?.();
      },
    }, {
      label: 'بحث عن متطلبات التشغيل',
      icon: <Search className="w-4 h-4" />,
      run: () => {
        const q = encodeURIComponent(`متطلبات تشغيل ${gameName || ''}`);
        window.open(`https://www.google.com/search?q=${q}`, '_blank');
        onClose?.();
      },
    },
  ];

  return (
    <div
      ref={ref}
      className={`fixed z-[1200] min-w-[220px] p-1.5 rounded-md shadow-[0_8px_16px_rgba(0,0,0,0.24)] ${isDark
        ? 'bg-[#050508] text-gray-200 border border-[#15161A]'
        : 'bg-white text-gray-900 border border-gray-200'
        }`}
      style={{ left: pos.left, top: pos.top }}
      onContextMenu={(e) => e.preventDefault()}
      dir="rtl"
    >
      <ul className="flex flex-col gap-0.5">
        {actions.map((a, i) => (
          <li key={i}>
            <button
              onClick={a.run}
              className={`w-full flex items-center justify-between gap-3 text-right px-2 py-1.5 text-sm rounded-sm transition-colors group ${isDark
                ? 'hover:bg-[#5865F2] hover:text-white'
                : 'hover:bg-gray-100'
                }`}
            >
              <span className="flex-1 font-medium">{a.label}</span>
              <span className={`shrink-0 ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-500'}`}>
                {a.icon}
              </span>
            </button>
          </li>
        ))}
        <div className={`my-1 mx-1 h-[1px] ${isDark ? 'bg-gray-700/50' : 'bg-gray-200'}`} />
        <li>
          <button
            onClick={() => { onToggleLocation && onToggleLocation(); }}
            className={`w-full flex items-center justify-between gap-3 text-right px-2 py-1.5 text-sm rounded-sm transition-colors group ${isDark
              ? 'hover:bg-[#5865F2] hover:text-white'
              : 'hover:bg-gray-100'
              }`}
          >
            <span className="flex-1 font-medium">إظهار المكان</span>
            {/* Toggle switch */}
            <span
              dir="ltr"
              className="relative inline-flex items-center w-9 h-5 rounded-full shrink-0 transition-colors duration-200"
              style={{ backgroundColor: showLocation ? '#5865F2' : (isDark ? '#4B5563' : '#D1D5DB') }}
            >
              <span
                className="inline-block w-3.5 h-3.5 rounded-full bg-white shadow transform transition-transform duration-200"
                style={{ transform: showLocation ? 'translateX(18px)' : 'translateX(3px)' }}
              />
            </span>
          </button>
        </li>
        <div className={`my-1 mx-1 h-[1px] ${isDark ? 'bg-gray-700/50' : 'bg-gray-200'}`} />
        <li className={`px-2 py-1.5 text-[10px] uppercase font-bold tracking-wide text-center select-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Made with ❤️ by Mangawii
        </li>
      </ul>
    </div >
  );
}
