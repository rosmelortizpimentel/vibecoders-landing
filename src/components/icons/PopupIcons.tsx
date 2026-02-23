import React from 'react';

export const ModalIcon = ({ selected, className }: { selected?: boolean; className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width="16" height="16"
    >
        {/* Base Screen */}
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />

        {/* Modal Box - Centered Card */}
        <rect x="6" y="8" width="12" height="8" rx="1.5"
            fill={selected ? "#3b82f6" : "transparent"}
            stroke={selected ? "#3b82f6" : "currentColor"}
            strokeWidth="1.5"
        />
        {/* Content Lines */}
        <path d="M8.5 12H15.5" stroke={selected ? "white" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const BannerIcon = ({ selected, className }: { selected?: boolean; className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width="16" height="16"
    >
        {/* Base Screen */}
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />

        {/* Banner Bar - Top Strip */}
        <path d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7.5H3V5Z"
            fill={selected ? "#3b82f6" : "currentColor"}
            fillOpacity={selected ? "1" : "0.1"}
            stroke={selected ? "#3b82f6" : "currentColor"}
            strokeWidth="1.5"
        />
        {/* Content Detail */}
        <circle cx="12" cy="5.25" r="1.25" fill={selected ? "white" : "currentColor"} />
    </svg>
);
