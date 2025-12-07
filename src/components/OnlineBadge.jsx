// src/components/OnlineBadge.jsx
// Badge overlay for online game cards with platform branding

import React from 'react';
import { getCachedBadgeUrl } from '../utils/badgeProvider';

const OnlineBadge = ({ jsonName, className = '', style = {} }) => {
  const [badgeUrl, setBadgeUrl] = React.useState(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const loadBadge = async () => {
      try {
        const url = await getCachedBadgeUrl(jsonName);
        if (!cancelled) {
          if (url) {
            setBadgeUrl(url);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(true);
        }
      }
    };

    loadBadge();

    return () => {
      cancelled = true;
    };
  }, [jsonName]);

  // Don't render anything if no badge found
  if (!badgeUrl || error) {
    return null;
  }

  return (
    <div
      className={`absolute inset-x-0 bottom-0 pointer-events-none ${className}`}
      style={style}
    >
      {/* Blurred darkened gradient background (bottom 25% of card) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent backdrop-blur-sm" />

      {/* Badge image centered in the space */}
      <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
        <img
          src={badgeUrl}
          alt={`${jsonName} badge`}
          loading="lazy"
          decoding="async"
          className="h-auto w-auto max-h-[45px] sm:max-h-[55px] max-w-[85%] object-contain drop-shadow-lg"
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
};

export default OnlineBadge;
