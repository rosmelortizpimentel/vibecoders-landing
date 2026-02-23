import { useEffect, useRef } from 'react';

/**
 * Dynamically loads a Google Font if not already loaded.
 * Falls back gracefully if the font doesn't exist in Google Fonts.
 */
export const useDynamicFont = (fontFamily: string | undefined | null) => {
    const loadedFontsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!fontFamily) return;

        // Normalize font name
        const normalizedFont = fontFamily.trim();
        if (!normalizedFont) return;

        // Skip if already loaded
        if (loadedFontsRef.current.has(normalizedFont)) return;

        // Check if link already exists in document
        const encodedFont = normalizedFont.replace(/ /g, '+');
        const existingLink = document.querySelector(
            `link[href*="family=${encodedFont}"]`
        );
        if (existingLink) {
            loadedFontsRef.current.add(normalizedFont);
            return;
        }

        // Create and append Google Fonts link
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700&display=swap`;

        // Handle load error gracefully (font might not exist in Google Fonts)
        link.onerror = () => {
            console.warn(`[useDynamicFont] Could not load font: ${normalizedFont}`);
        };

        document.head.appendChild(link);
        loadedFontsRef.current.add(normalizedFont);

        console.log(`[useDynamicFont] Loaded font: ${normalizedFont}`);
    }, [fontFamily]);
};

export default useDynamicFont;
