import { useState, useRef, useCallback, useEffect } from 'react';

interface UseResizableOptions {
    initialWidth: number;
    minWidth: number;
    maxWidth: number;
    direction: 'left' | 'right'; // Which side the resize handle is on
    storageKey?: string; // Optional localStorage key for persistence
}

export function useResizable({
    initialWidth,
    minWidth,
    maxWidth,
    direction,
    storageKey,
}: UseResizableOptions) {
    // Load from localStorage if key provided
    const getInitialWidth = () => {
        if (storageKey) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const parsed = parseInt(saved, 10);
                    if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
                        return parsed;
                    }
                }
            } catch {
                // localStorage might not be available
            }
        }
        return initialWidth;
    };

    const [width, setWidth] = useState(getInitialWidth);
    const isResizing = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;

        const delta = direction === 'right'
            ? e.clientX - startX.current
            : startX.current - e.clientX;

        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta));
        setWidth(newWidth);
    }, [direction, minWidth, maxWidth]);

    const handleMouseUp = useCallback(() => {
        if (!isResizing.current) return;

        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // Save to localStorage
        if (storageKey) {
            try {
                localStorage.setItem(storageKey, width.toString());
            } catch {
                // localStorage might not be available
            }
        }
    }, [storageKey, width]);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const startResize = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        startX.current = e.clientX;
        startWidth.current = width;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
    }, [width]);

    return {
        width,
        startResize,
        isResizing: isResizing.current,
    };
}
