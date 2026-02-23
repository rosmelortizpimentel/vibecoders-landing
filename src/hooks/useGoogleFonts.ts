import { useQuery } from "@tanstack/react-query";

export interface GoogleFont {
    family: string;
    category: string;
    variants: string[];
}

interface GoogleFontsAPIResponse {
    kind: string;
    items: {
        family: string;
        variants: string[];
        subsets: string[];
        version: string;
        lastModified: string;
        files: Record<string, string>;
        category: string;
        kind: string;
    }[];
}

const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;

/**
 * Fetches Google Fonts list from the API
 * Returns top 500 fonts sorted by popularity
 */
const fetchGoogleFonts = async (): Promise<GoogleFont[]> => {
    if (!GOOGLE_FONTS_API_KEY) {
        console.warn("[useGoogleFonts] No API key found, using fallback fonts");
        return FALLBACK_FONTS;
    }

    const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
    );

    if (!response.ok) {
        console.error("[useGoogleFonts] API error:", response.status);
        return FALLBACK_FONTS;
    }

    const data: GoogleFontsAPIResponse = await response.json();

    // Return all fonts
    return data.items.map((font) => ({
        family: font.family,
        category: font.category,
        variants: font.variants,
    }));
};

// Fallback fonts if API fails or no key
const FALLBACK_FONTS: GoogleFont[] = [
    { family: "Inter", category: "sans-serif", variants: ["400", "500", "600", "700"] },
    { family: "Roboto", category: "sans-serif", variants: ["400", "500", "700"] },
    { family: "Open Sans", category: "sans-serif", variants: ["400", "600", "700"] },
    { family: "Lato", category: "sans-serif", variants: ["400", "700"] },
    { family: "Poppins", category: "sans-serif", variants: ["400", "500", "600", "700"] },
    { family: "Montserrat", category: "sans-serif", variants: ["400", "500", "600", "700"] },
    { family: "Nunito", category: "sans-serif", variants: ["400", "600", "700"] },
    { family: "Playfair Display", category: "serif", variants: ["400", "500", "600", "700"] },
    { family: "Merriweather", category: "serif", variants: ["400", "700"] },
    { family: "Source Sans Pro", category: "sans-serif", variants: ["400", "600", "700"] },
    { family: "PT Sans", category: "sans-serif", variants: ["400", "700"] },
    { family: "Raleway", category: "sans-serif", variants: ["400", "500", "600", "700"] },
    { family: "Ubuntu", category: "sans-serif", variants: ["400", "500", "700"] },
    { family: "Oswald", category: "sans-serif", variants: ["400", "500", "600", "700"] },
    { family: "Quicksand", category: "sans-serif", variants: ["400", "500", "600", "700"] },
];

export const useGoogleFonts = () => {
    const query = useQuery({
        queryKey: ["google-fonts"],
        queryFn: fetchGoogleFonts,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
        retry: 1,
    });

    const searchFonts = (searchQuery: string): GoogleFont[] => {
        const fonts = query.data || FALLBACK_FONTS;
        if (!searchQuery.trim()) return fonts.slice(0, 50); // Return top 50 if no search

        const lowerQuery = searchQuery.toLowerCase();
        return fonts.filter((font) =>
            font.family.toLowerCase().includes(lowerQuery)
        );
    };

    return {
        fonts: query.data || FALLBACK_FONTS,
        isLoading: query.isLoading,
        error: query.error,
        searchFonts,
    };
};

export default useGoogleFonts;
