import React, { memo } from 'react';

const AmbientBackground = memo(({ isDark }) => {
    if (!isDark) return null;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {/* Base Pitch Black */}
            <div className="absolute inset-0 bg-[#111111]" />

            {/* Top Center: Deep Blurple/Violet Nebula (Restored Base) */}
            <div
                className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[90vw] h-[70vh] rounded-full opacity-20 blur-[130px]"
                style={{ background: 'radial-gradient(circle, #4c1d95 0%, #c158f238 40%, transparent 80%)' }}
            />

            {/* Bottom Right: The Warm Champagne/Gold Spot */}
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] rounded-full opacity-20 blur-[120px]"
                style={{ background: 'radial-gradient(circle, #fbbf24 0%, #d4af3777 50%, transparent 7%)' }}
            />

            {/* Bottom Left: Deep Rose/Pink (Bridge) */}
            <div
                className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vh] rounded-full opacity-15 blur-[100px]"
                style={{ background: 'radial-gradient(circle, #db2777 0%, transparent 70%)' }}
            />

            {/* Top Right: Cyan/Teal (Cool Contrast) */}
            <div
                className="absolute top-[-5%] right-[-10%] w-[40vw] h-[40vh] rounded-full opacity-10 blur-[90px]"
                style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }}
            />

            {/* Top Left: Cyan/Teal (Cool Contrast) */}
            <div
                className="absolute top-[-5%] left-[-10%] w-[40vw] h-[40vh] rounded-full opacity-10 blur-[90px]"
                style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }}
            />

            {/* Noise Texture (Optional for texture) */}
            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
        </div>
    );
});

export default AmbientBackground;
