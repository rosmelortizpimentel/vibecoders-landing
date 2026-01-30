import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        camera: ["CameraPlain", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Neon accent colors for direct usage
        neon: {
          violet: "hsl(263 70% 58%)",
          cyan: "hsl(187 80% 55%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(263 70% 58% / 0.4)" },
          "50%": { boxShadow: "0 0 30px hsl(263 70% 58% / 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(2deg)" },
        },
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fall-to-target": {
          "0%": { 
            transform: "translateY(0) translateX(0) scale(1) rotate(0deg)",
            opacity: "1"
          },
          "50%": { 
            transform: "translateY(var(--fall-y)) translateX(var(--fall-x)) scale(0.5) rotate(180deg)",
            opacity: "0.9"
          },
          "65%": { 
            transform: "translateY(calc(var(--fall-y) * 1.15)) translateX(calc(var(--fall-x) * 1.15)) scale(0.4) rotate(220deg)",
            opacity: "0.7"
          },
          "85%": { 
            transform: "translateY(var(--fall-y)) translateX(var(--fall-x)) scale(0.2) rotate(320deg)",
            opacity: "0.4"
          },
          "100%": { 
            transform: "translateY(var(--fall-y)) translateX(var(--fall-x)) scale(0) rotate(360deg)",
            opacity: "0"
          },
        },
        "pulse-absorb": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        "transform-verified": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.2) rotate(10deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "number-rise": {
          "0%": { 
            transform: "translateY(0) translateX(var(--rise-x, 0))", 
            opacity: "0" 
          },
          "20%": { 
            opacity: "1" 
          },
          "80%": { 
            opacity: "1" 
          },
          "100%": { 
            transform: "translateY(-80px) translateX(calc(var(--rise-x, 0) * 0.3))", 
            opacity: "0" 
          },
        },
        "explode-out": {
          "0%": { 
            transform: "translate(var(--fall-x), var(--fall-y)) scale(0)",
            opacity: "0"
          },
          "20%": {
            transform: "translate(calc(var(--fall-x) * 0.7), calc(var(--fall-y) * 0.7)) scale(1)",
            opacity: "1"
          },
          "100%": { 
            transform: "translate(0, 0) scale(1)",
            opacity: "1"
          },
        },
        "flash-explosion": {
          "0%": { 
            transform: "scale(0)", 
            opacity: "1" 
          },
          "50%": { 
            transform: "scale(1.5)", 
            opacity: "0.8" 
          },
          "100%": { 
            transform: "scale(2)", 
            opacity: "0" 
          },
        },
        "particle-burst": {
          "0%": { 
            transform: "translate(0, 0) scale(1)", 
            opacity: "1" 
          },
          "100%": { 
            transform: "translate(var(--particle-x), var(--particle-y)) scale(0)", 
            opacity: "0" 
          },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-3px)" },
          "75%": { transform: "translateX(3px)" },
        },
        "fall-to-center-mobile": {
          "0%": { 
            transform: "translate(var(--start-x), var(--start-y)) scale(1)",
            opacity: "1"
          },
          "60%": { 
            transform: "translate(0, 0) scale(0.5)",
            opacity: "0.8"
          },
          "80%": { 
            transform: "translate(0, 0) scale(0.3)",
            opacity: "0.5"
          },
          "100%": { 
            transform: "translate(0, 0) scale(0)",
            opacity: "0"
          }
        },
        "explode-from-center-mobile": {
          "0%": { 
            transform: "translate(-50%, -50%) scale(0)",
            opacity: "0"
          },
          "30%": {
            transform: "translate(calc(-50% + var(--start-x) * 0.4), calc(-50% + var(--start-y) * 0.4)) scale(1)",
            opacity: "1"
          },
          "100%": { 
            transform: "translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y))) scale(1)",
            opacity: "1"
          }
        },
        "cursor-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "scroll-left": "scroll-left 20s linear infinite",
        "fall-to-target": "fall-to-target 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        "pulse-absorb": "pulse-absorb 0.3s ease-out",
        "transform-verified": "transform-verified 0.5s ease-out",
        "number-rise": "number-rise 1.5s ease-out forwards",
        "explode-out": "explode-out 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "flash-explosion": "flash-explosion 0.4s ease-out forwards",
        "particle-burst": "particle-burst 0.6s ease-out forwards",
        "shake": "shake 0.3s ease-in-out",
        "fall-to-center-mobile": "fall-to-center-mobile 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        "explode-from-center-mobile": "explode-from-center-mobile 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "cursor-blink": "cursor-blink 1s step-end infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
