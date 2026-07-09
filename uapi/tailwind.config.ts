import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  /* ---------------------------------------------------------------------
   * Safelist – classes that are generated dynamically via template strings
   * or user data and therefore cannot be detected by Tailwind’s static
   * scanner.  Without safelisting they are purged from the final CSS bundle
   * leading to missing styles on production.  Keeping the list tight ensures
   * we do not accidentally negate the benefits of tree-shaking.
   * ------------------------------------------------------------------- */
  safelist: [
    // Marketing screenshot borders & glows
    'border-orange-400',
    'border-green-400',
    'border-purple-500',

    // Badge colours in PipelineShowcase legend
    'text-emerald-400',
    'text-amber-400',
    'text-purple-400',
    'text-sky-400',

    // Brand color system - dynamic usage patterns
    { pattern: /^(bg|text|border)-brand-(emerald|purple|orange|blue)(-glow|-bright|-soft|-subtle|-strong|-light|-lighter|-overlay)?$/ },
    { pattern: /^(bg|text|border)-ai-(thinking|processing|complete|error|tool-use|pattern-recognition|consciousness-awakening|celebration-gold|mastery-purple|learning-glow)$/ },
    { pattern: /^(bg|text|border)-quantum-(particle|dust|star|star-blue|trail)$/ },
    
    // Retained shadow patterns used by existing grouped hover states.
    'group-hover:shadow-[0_0_2rem_-0.5rem_rgba(103,254,183,0.45)]',
    'group-hover:shadow-[0_0_2rem_-0.5rem_rgba(168,85,247,0.45)]',
    'group-hover:shadow-[0_0_2rem_-0.5rem_rgba(249,115,22,0.45)]',
  ],
  prefix: "",
  theme: {
    screens: {
      'phone': '480px',    // Mobile
      'tablet': '768px',   // Tablet
      'laptop': '1024px',  // Laptop
      'desktop': '1280px', // Desktop
      'wide': '1440px',    // Widescreen
      '2xl': '1400px',     // Keep existing container breakpoint
    },
    container: {
      center: 'true',
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      boxShadow: {
        // Subtle elevation for cards/panels (no visual change vs common usage)
        surface: '0 8px 20px rgba(0,0,0,0.20)',
        // Crisper edge + ambient for menus/popovers (matches current heavy menus)
        popover: '0 12px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
        // Emerald glow layers used across hover/active effects (kept for parity)
        'glow-emerald-subtle': '0 0 20px rgba(103,254,183,0.25)',
        'glow-emerald-strong': '0 0 30px rgba(103,254,183,0.45)'
      },
      spacing: {
        '18': '4.5rem',
      },
      maxWidth: {
        '4.5xl': '60rem',
      },
    transitionTimingFunction: {
      elegant: 'cubic-bezier(0.4, 0, 0.2, 1)',
      'orbit-snap': 'cubic-bezier(0.16, 1, 0.3, 1)',
      'orbit-fluid': 'cubic-bezier(0.23, 1, 0.32, 1)',
      'orbit-overshoot': 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    },
      colors: {
        'green-primary': '#65FEB7',
        
        /* ====================================================================
         * BITCODE BRAND COLOR SYSTEM - Single source of truth
         * Consolidates 4+ variations of same colors into semantic tokens
         * ==================================================================== */
        brand: {
          // Primary brand colors (consolidates #65FEB7, #67feb7, #91fbbc variations)
          emerald: '#65FEB7',
          'emerald-bright': '#67FEB7', 
          'emerald-soft': '#91FBBC',
          'emerald-glow': 'rgba(103, 254, 183, 0.4)',
          'emerald-glow-strong': 'rgba(103, 254, 183, 0.7)',
          'emerald-glow-subtle': 'rgba(103, 254, 183, 0.2)',
          // Fine-grained glow alphas for exact visual parity migrations
          'emerald-glow-05': 'rgba(103, 254, 183, 0.05)',
          'emerald-glow-08': 'rgba(103, 254, 183, 0.08)',
          'emerald-glow-10': 'rgba(103, 254, 183, 0.1)',
          'emerald-glow-15': 'rgba(103, 254, 183, 0.15)',
          'emerald-glow-30': 'rgba(103, 254, 183, 0.3)',
          'emerald-glow-50': 'rgba(103, 254, 183, 0.5)',
          'emerald-glow-60': 'rgba(103, 254, 183, 0.6)',
          'emerald-glow-90': 'rgba(103, 254, 183, 0.9)',
          
          // Supporting palette
          purple: '#A855F7',
          'purple-glow': 'rgba(168, 85, 247, 0.4)',
          'purple-glow-subtle': 'rgba(168, 85, 247, 0.2)',
          orange: '#F97316', 
          'orange-glow': 'rgba(249, 115, 22, 0.4)',
          'orange-glow-subtle': 'rgba(249, 115, 22, 0.2)',
          blue: '#0EA5E9',
          'blue-glow': 'rgba(14, 165, 233, 0.4)',
          
          // Red for marketplace bearish indicators
          red: '#EF4444',
          'red-glow': 'rgba(239, 68, 68, 0.4)',
          'red-glow-subtle': 'rgba(239, 68, 68, 0.2)',
          
          // Cosmic backgrounds (consolidates multiple dark variations)
          cosmic: '#030816',           // Primary background
          'cosmic-light': '#0F1928',   // Component backgrounds
          'cosmic-lighter': '#1A2433', // Input backgrounds
          'cosmic-overlay': 'rgba(3, 8, 22, 0.9)', // Semi-transparent overlays
        },
        
        // AI semantic colors (consolidates log colors and AI states)
        ai: {
          thinking: '#34D399',    // emerald-400 - AI processing
          processing: '#A855F7',  // purple-500 - AI working
          complete: '#10B981',    // emerald-500 - AI finished
          error: '#EF4444',       // red-500 - AI error
          'tool-use': '#F97316',  // orange-500 - Tool execution
          
          // Intelligence enhancement colors
          'pattern-recognition': '#34D399', // emerald-400 - Pattern detected
          'consciousness-awakening': '#A78BFA', // violet-400 - Orb awakening
          'celebration-gold': '#F59E0B',    // amber-500 - Achievement celebration
          'mastery-purple': '#8B5CF6',      // violet-500 - Pattern mastery
          'learning-glow': 'rgba(52, 211, 153, 0.6)', // thinking with glow
        },
        
        // Quantum effects (for particle systems and cosmic animations)
        quantum: {
          particle: 'rgba(103, 254, 183, 0.8)',
          dust: 'rgba(255, 255, 255, 0.3)',
          star: 'rgba(255, 255, 255, 0.8)',
          'star-blue': 'rgba(200, 220, 255, 0.2)',
          trail: 'rgba(255, 255, 255, 0.4)',
        },
        
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
        keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        /* ====================================================================
         * CONSOLIDATED BASE ANIMATIONS - Single source of truth
         * Each animation has base behavior + specific variants via CSS classes
         * ==================================================================== */
        
        // Base shine animation - sophisticated version with CSS variables
        'shine-base': {
          '0%': {
            'background-position': 'calc(-1.5 * var(--shine-width, 500%)) 0'
          },
          '10%': {
            'background-position': 'calc(-1.2 * var(--shine-width, 500%)) 0'
          },
          '40%': {
            'background-position': 'calc(-0.2 * var(--shine-width, 500%)) 0'
          },
          '50%': {
            'background-position': '0 0'
          },
          '60%': {
            'background-position': 'calc(0.2 * var(--shine-width, 500%)) 0'
          },
          '90%': {
            'background-position': 'calc(1.2 * var(--shine-width, 500%)) 0'
          },
          '100%': {
            'background-position': 'calc(1.5 * var(--shine-width, 500%)) 0'
          }
        },
        
        // Simple shine variant for command menu
        'shine-simple': {
          'to': {
            'background-position': '200% center',
            'opacity': '0'
          }
        },
        
        // Base orbital glow - unified from 7 duplicates
        'orbital-glow-base': {
          '0%, 100%': {
            'box-shadow': '0 0 15px rgba(103, 254, 183, 0.4)'
          },
          '50%': {
            'box-shadow': '0 0 25px rgba(103, 254, 183, 0.7)'
          }
        },
        
        // Base pulse - unified from 7 duplicates  
        'pulse-base': {
          '0%, 100%': {
            'opacity': '0.8',
            'transform': 'scale(1)'
          },
          '50%': {
            'opacity': '1',
            'transform': 'scale(1.05)'
          }
        },
        
        // Base shimmer - unified from 4 duplicates
        'shimmer-base': {
          '0%, 90%, 100%': {
            'background-position': 'calc(-100% - var(--shimmer-width, 200%)) 0'
          },
          '30%, 60%': {
            'background-position': 'calc(100% + var(--shimmer-width, 200%)) 0'
          }
        },
        /* -----------------------------------------------------------------
         * Testimonials / reviews marquee
         * -----------------------------------------------------------------
         * Uses its own bespoke custom properties so that timing + spacing
         * can never bleed into other, independent carousels (e.g. the logo
         * strip).  The variables are quite verbose on purpose – the longer
         * names virtually guarantee uniqueness across the entire codebase.
         */
        'review-marquee': {
          from: {
            transform: 'translateX(0)'
          },
          to: {
            transform: 'translateX(calc(-100% - var(--review-marquee-gap)))'
          }
        },
        'review-marquee-vertical': {
          from: {
            transform: 'translateY(0)'
          },
          to: {
            transform: 'translateY(calc(-100% - var(--review-marquee-gap)))'
          }
        },
        shimmer: {
          '0%, 90%, 100%': {
            'background-position': 'calc(-100% - var(--shimmer-width)) 0'
          },
          '30%, 60%': {
            'background-position': 'calc(100% + var(--shimmer-width)) 0'
          }
        },
        'spin-around': {
          '0%': {
            transform: 'translateZ(0) rotate(0)'
          },
          '15%, 35%': {
            transform: 'translateZ(0) rotate(90deg)'
          },
          '65%, 85%': {
            transform: 'translateZ(0) rotate(270deg)'
          },
          '100%': {
            transform: 'translateZ(0) rotate(360deg)'
          }
        },
        slide: {
          to: {
            transform: 'translate(calc(100cqw - 100%), 0)'
          }
        },
        meteor: {
          '0%': {
            transform: 'rotate(215deg) translateX(0)',
            opacity: '1'
          },
          '70%': {
            opacity: '1'
          },
          '100%': {
            transform: 'rotate(215deg) translateX(-5000px)',
            opacity: '0'
          }
        },
        'cosmic-traverse': {
          '0%': {
            transform: 'rotate(215deg) translateX(0) scale(0.3)',
            opacity: '0'
          },
          '5%': {
            transform: 'rotate(215deg) translateX(100px) scale(0.6)',
            opacity: '0.4'
          },
          '15%': {
            transform: 'rotate(215deg) translateX(300px) scale(0.8)',
            opacity: '0.8'
          },
          '80%': {
            opacity: '0.8'
          },
          '100%': {
            transform: 'rotate(215deg) translateX(6000px) scale(0.6)',
            opacity: '0'
          }
        },

        // Logo specific marquee – identical to horizontal marquee but uses a
        // unique name so that it never collides with the generic marquee
        // animation. This lets the two run with independent play-states and
        // durations.
        'logo-marquee': {
          from: {
            transform: 'translateX(0)'
          },
          to: {
            transform: 'translateX(calc(-100% - var(--logo-marquee-gap)))'
          }
        },
        'distant-star': {
          '0%': {
            transform: 'rotate(215deg) translateX(0) scale(0.1)',
            opacity: '0'
          },
          '10%': {
            transform: 'rotate(215deg) translateX(200px) scale(0.2)',
            opacity: '0.3'
          },
          '80%': {
            opacity: '0.3'
          },
          '100%': {
            transform: 'rotate(215deg) translateX(4000px) scale(0.1)',
            opacity: '0'
          }
        },
        'bright-comet': {
          '0%': {
            transform: 'rotate(215deg) translateX(0) scale(0)',
            opacity: '0'
          },
          '2%': {
            transform: 'rotate(215deg) translateX(100px) scale(0.4)',
            opacity: '0.2'
          },
          '5%': {
            transform: 'rotate(215deg) translateX(300px) scale(1)',
            opacity: '1'
          },
          '20%': {
            transform: 'rotate(215deg) translateX(1000px) scale(1.2)',
            opacity: '1'
          },
          '80%': {
            opacity: '0.8'
          },
          '100%': {
            transform: 'rotate(215deg) translateX(6000px) scale(0.2)',
            opacity: '0'
          }
        },
        'star-twinkle': {
          '0%, 100%': {
            opacity: 'var(--base-opacity, 0.7)',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: 'var(--peak-opacity, 1)',
            transform: 'scale(1.2)'
          }
        },
        'border-beam': {
          '100%': {
            'offset-distance': '100%'
          }
        },
        'shiny-text': {
          '0%, 90%, 100%': {
            'background-position': 'calc(-100% - var(--shiny-width)) 0'
          },
          '30%, 60%': {
            'background-position': 'calc(100% + var(--shiny-width)) 0'
          }
        },
        
        /* ====================================================================
         * INTELLIGENCE ENHANCEMENT ANIMATIONS
         * ==================================================================== */
        'intelligence-pulse': {
          '0%, 100%': { 
            'transform': 'scale(1)',
            'filter': 'brightness(1) saturate(1)',
          },
          '33%': { 
            'transform': 'scale(1.05)',
            'filter': 'brightness(1.1) saturate(1.1)',
          },
          '66%': { 
            'transform': 'scale(1.02)',
            'filter': 'brightness(1.05) saturate(1.05)',
          }
        },
        
        'pattern-recognition': {
          '0%': {
            'opacity': '0',
            'transform': 'scale(0.8) translateY(5px)',
            'filter': 'blur(1px)'
          },
          '30%': {
            'opacity': '1',
            'transform': 'scale(1.05) translateY(0px)',
            'filter': 'blur(0px)'
          },
          '100%': {
            'opacity': '1',
            'transform': 'scale(1) translateY(0px)',
            'filter': 'blur(0px)'
          }
        },
        
        'consciousness-awakening': {
          '0%': {
            'opacity': '0.3',
            'transform': 'scale(0.9)',
            'filter': 'blur(2px)'
          },
          '25%': {
            'opacity': '0.6',
            'transform': 'scale(0.95)',
            'filter': 'blur(1px)'
          },
          '50%': {
            'opacity': '0.8',
            'transform': 'scale(1.02)',
            'filter': 'blur(0.5px)'
          },
          '100%': {
            'opacity': '1',
            'transform': 'scale(1)',
            'filter': 'blur(0px)'
          }
        },
        
        'success-cascade': {
          '0%': {
            'transform': 'scale(0.8) rotate(0deg)',
            'opacity': '0'
          },
          '25%': {
            'transform': 'scale(1.1) rotate(5deg)',
            'opacity': '1'
          },
          '75%': {
            'transform': 'scale(1.05) rotate(-2deg)',
            'opacity': '1'
          },
          '100%': {
            'transform': 'scale(1) rotate(0deg)',
            'opacity': '1'
          }
        },
        
        'confidence-building': {
          '0%': {
            'opacity': '0.5'
          },
          '100%': {
            'opacity': '1'
          }
        }
      },
        animation: {
            'accordion-down': 'accordion-down 0.2s ease-out',
            'accordion-up': 'accordion-up 0.2s ease-out',
            
            /* ====================================================================
             * CONSOLIDATED ANIMATION UTILITIES - Base + Specific Pattern
             * Format: 'base-animation' + 'base-animation-specific-use-case'
             * ==================================================================== */
            
            // Shine animations - base + specific variants
            'shine-text-hero': 'shine-base 4s ease-in-out infinite',
            'shine-text-marketing': 'shine-base 6s ease-in-out infinite', 
            'shine-button-hover': 'shine-base 2s ease-in-out',
            // command-menu removed
            
            // Orbital glow - base + specific variants
            'orbital-glow-hero': 'orbital-glow-base 3s infinite ease-in-out',
            'orbital-glow-button': 'orbital-glow-base 2s infinite ease-in-out',
            'orbital-glow-quantum': 'orbital-glow-base 4s infinite ease-in-out',
            
            // Pulse - base + specific variants
            'pulse-text-subtle': 'pulse-base 4s ease-in-out infinite',
            'pulse-button-hover': 'pulse-base 2s ease-in-out infinite',
            'pulse-notification': 'pulse-base 1.5s ease-in-out infinite',
            
            // Shimmer - base + specific variants
            'shimmer-button-emerald': 'shimmer-base 8s infinite',
            'shimmer-button-purple': 'shimmer-base 8s infinite',
            'shimmer-button-orange': 'shimmer-base 8s infinite',
            'shimmer-text-shiny': 'shimmer-base 8s infinite',
            // Review carousel specific animation utilities.
            'review-marquee': 'review-marquee var(--review-marquee-duration) linear infinite',
            'review-marquee-vertical': 'review-marquee-vertical var(--review-marquee-duration) linear infinite',

        // Logo marquee uses its own CSS custom property for duration so speed
        // tweaks never affect other marquees.
        'logo-marquee': 'logo-marquee var(--logo-marquee-duration) linear infinite',
        shimmer: 'shimmer 8s infinite',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
        slide: 'slide var(--speed) ease-in-out infinite alternate',
        meteor: 'meteor 5s linear infinite',
        'cosmic-traverse': 'cosmic-traverse var(--duration, 5s) linear forwards',
        'distant-star': 'distant-star var(--duration, 7s) linear forwards',
        'bright-comet': 'bright-comet var(--duration, 4s) linear forwards',
        'star-twinkle': 'star-twinkle calc(var(--twinkle-duration, 3s) + var(--random-offset, 0s)) ease-in-out infinite',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'shiny-text': 'shiny-text 8s infinite',
        
        // Intelligence enhancement animations
        'intelligence-pulse': 'intelligence-pulse 3s ease-in-out infinite',
        'pattern-recognition': 'pattern-recognition 2s ease-out',
        'consciousness-awakening': 'consciousness-awakening 4s ease-out',
        'success-cascade': 'success-cascade 1.5s ease-out',
        'confidence-building': 'confidence-building 3s ease-out'
      },
      variants: {
        extend: {
          boxShadow: ['hover', 'dark']
        }
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    
    // Custom utility classes for repeated patterns
    function({ addUtilities, theme }) {
      addUtilities({
        /* ================================================================
         * GLOW UTILITIES - Replaces scattered glow effects
         * ================================================================ */
        '.glow-emerald': {
          'box-shadow': `0 0 15px ${theme('colors.brand.emerald-glow')}`,
          'filter': `drop-shadow(0 0 6px ${theme('colors.brand.emerald-glow')})`
        },
        '.glow-emerald-strong': {
          'box-shadow': `0 0 25px ${theme('colors.brand.emerald-glow-strong')}`,
          'filter': `drop-shadow(0 0 8px ${theme('colors.brand.emerald-glow-strong')})`
        },
        '.glow-purple': {
          'box-shadow': `0 0 15px ${theme('colors.brand.purple-glow')}`,
          'filter': `drop-shadow(0 0 6px ${theme('colors.brand.purple-glow')})`
        },
        '.glow-orange': {
          'box-shadow': `0 0 15px ${theme('colors.brand.orange-glow')}`,
          'filter': `drop-shadow(0 0 6px ${theme('colors.brand.orange-glow')})`
        },
        // Red glow utilities for cancel/"danger" hover states (no borders)
        '.glow-red': {
          'box-shadow': `0 0 15px ${theme('colors.brand.red-glow')}`,
          'filter': `drop-shadow(0 0 6px ${theme('colors.brand.red-glow')})`
        },
        '.glow-red-strong': {
          // Use solid brand red for a stronger effect akin to emerald-strong
          'box-shadow': `0 0 25px ${theme('colors.brand.red')}`,
          'filter': `drop-shadow(0 0 8px ${theme('colors.brand.red')})`
        },
        
        /* ================================================================
         * QUANTUM UTILITIES - Particle and cosmic effects
         * ================================================================ */
        '.quantum-dot': {
          'width': '6px',
          'height': '6px',
          'border-radius': '50%',
          'background-color': theme('colors.quantum.particle'),
          'box-shadow': `0 0 15px ${theme('colors.brand.emerald-glow-strong')}`
        },
        '.quantum-dot-small': {
          'width': '4px',
          'height': '4px',
          'border-radius': '50%',
          'background-color': theme('colors.quantum.particle'),
          'box-shadow': `0 0 10px ${theme('colors.brand.emerald-glow')}`
        },
        '.quantum-dot-large': {
          'width': '8px',
          'height': '8px',
          'border-radius': '50%',
          'background-color': theme('colors.quantum.particle'),
          'box-shadow': `0 0 20px ${theme('colors.brand.emerald-glow-strong')}`
        },
        '.cosmic-dust': {
          'width': '1px',
          'height': '1px',
          'border-radius': '50%',
          'background-color': theme('colors.quantum.dust'),
          'opacity': '0.3'
        },
        '.star-cluster': {
          'width': '2px',
          'height': '2px',
          'border-radius': '50%',
          'background-color': theme('colors.quantum.star'),
          'box-shadow': `
            0 0 4px 1px ${theme('colors.quantum.star')},
            0 0 8px 2px ${theme('colors.quantum.star-blue')}
          `
        },
        
        /* ================================================================
         * TEXT UTILITIES - Shiny and neon effects
         * ================================================================ */
        '.text-shiny': {
          'position': 'relative',
          'display': 'inline',
          'color': theme('colors.brand.emerald'),
          'text-shadow': `0 0 8px ${theme('colors.brand.emerald-glow')}`,
          '--shine-width': '500%',
          'background': `linear-gradient(90deg,
            transparent 0%,
            ${theme('colors.brand.emerald-glow-subtle')} 10%,
            ${theme('colors.brand.emerald-glow-strong')} 50%,
            ${theme('colors.brand.emerald-glow-subtle')} 90%,
            transparent 100%)`,
          'background-size': 'var(--shine-width) 100%',
          'background-clip': 'text',
          '-webkit-background-clip': 'text'
        },
        '.text-neon': {
          'text-shadow': `
            0 0 6px rgba(255,255,255,0.8), 
            0 0 12px ${theme('colors.brand.emerald-glow-strong')}
          `
        },
        
        /* ================================================================
         * RING UTILITIES - Orbital and hover effects
         * ================================================================ */
        // Note: Ring glow utilities moved to separate CSS file due to pseudo-element complexity
        
        /* ================================================================
         * PERFORMANCE UTILITIES - GPU acceleration hints
         * ================================================================ */
        '.gpu-accelerate': {
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
          'perspective': '1000px'
        },
        '.will-animate': {
          'will-change': 'transform, opacity'
        },
        '.will-animate-glow': {
          'will-change': 'box-shadow, filter'
        }
      })
    }
  ],
} satisfies Config

export default config
