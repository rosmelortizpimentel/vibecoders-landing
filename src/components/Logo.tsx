import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string; // Should control the overall height/size
    theme?: "dark" | "light"; // In case we need inverted colors later
}

const Logo: React.FC<LogoProps> = ({ className, theme = "light" }) => {
    // We use em units so the logo scales with the font-size derived from className (e.g. text-2xl)
    // Or if className sets height, we might need a viewbox. 
    // Safest for replacing <img> is to use an SVG that scales with height.
    // But mixing text and shapes in SVG is easier.

    const textColor = theme === "dark" ? "white" : "#000000";

    return (
        <svg
            viewBox="0 0 170 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("h-full w-auto", className)}
            preserveAspectRatio="xMidYMid meet"
        >
            {/* T */}
            <text x="0" y="30" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="32" fill={textColor}>T</text>

            {/* Switch (replaces 'o') */}
            <g transform="translate(24, 8)">
                <rect x="0" y="0" width="36" height="20" rx="10" stroke={textColor} strokeWidth="3" fill="none" />
                <circle cx="26" cy="10" r="6" fill="#0066FF" />
            </g>

            {/* ggle */}
            <text x="64" y="30" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="32" fill={textColor}>ggle</text>

            {/* Up (Superscript) */}
            <text x="134" y="18" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="24" fill="#0066FF">Up</text>
        </svg>
    );
};

export default Logo;
