/**
 * Browser Compatibility Utilities
 * Handles cross-browser compatibility issues and feature detection
 */

// Type definitions
interface FeatureDetection {
  supportsBackdropFilter: () => boolean;
  supportsClamp: () => boolean;
  supportsGrid: () => boolean;
  supportsCustomProperties: () => boolean;
  supportsObjectFit: () => boolean;
  supportsAspectRatio: () => boolean;
  supportsGap: () => boolean;
  supportsSmoothScrolling: () => boolean;
}

interface FontLoading {
  isFontLoaded: (fontFamily: string) => boolean;
  waitForFonts: (fontFamilies?: string[]) => Promise<void>;
  addFontFallbacks: () => void;
}

interface BrowserDetection {
  isIOS: () => boolean;
  isSafari: () => boolean;
  isIE: () => boolean;
  isEdgeLegacy: () => boolean;
  isFirefox: () => boolean;
  isChrome: () => boolean;
}

interface PerformanceOptimization {
  optimizeForAnimation: (element: HTMLElement | null) => void;
  cleanupAfterAnimation: (element: HTMLElement | null) => void;
  enableHardwareAcceleration: (element: HTMLElement | null) => void;
}

interface AccessibilityUtils {
  prefersReducedMotion: () => boolean;
  prefersHighContrast: () => boolean;
  handleReducedMotion: () => void;
  handleHighContrast: () => void;
}

// Fix for mobile viewport height issues
export const fixMobileViewportHeight = (): void => {
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Set initial value
  setVH();

  // Update on resize and orientation change
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
};

// Feature detection utilities
export const featureDetection: FeatureDetection = {
  // Check if backdrop-filter is supported
  supportsBackdropFilter: () => {
    return CSS.supports('backdrop-filter', 'blur(1px)') || 
           CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  },

  // Check if clamp() is supported
  supportsClamp: () => {
    return CSS.supports('font-size', 'clamp(1rem, 2vw, 3rem)');
  },

  // Check if CSS Grid is supported
  supportsGrid: () => {
    return CSS.supports('display', 'grid');
  },

  // Check if CSS Custom Properties are supported
  supportsCustomProperties: () => {
    return CSS.supports('color', 'var(--test)');
  },

  // Check if object-fit is supported
  supportsObjectFit: () => {
    return CSS.supports('object-fit', 'cover');
  },

  // Check if aspect-ratio is supported
  supportsAspectRatio: () => {
    return CSS.supports('aspect-ratio', '16 / 9');
  },

  // Check if gap property is supported
  supportsGap: () => {
    return CSS.supports('gap', '1rem');
  },

  // Check if smooth scrolling is supported
  supportsSmoothScrolling: () => {
    return CSS.supports('scroll-behavior', 'smooth');
  }
};

// Font loading utilities
export const fontLoading: FontLoading = {
  // Check if a font is loaded
  isFontLoaded: (fontFamily: string) => {
    if (!document.fonts) return true; // Assume loaded if API not available
    
    return document.fonts.check(`1em ${fontFamily}`);
  },

  // Wait for fonts to load
  waitForFonts: async (fontFamilies = ['Geist', 'Gilda Display']) => {
    if (!document.fonts) return Promise.resolve();
    
    try {
      await document.fonts.ready;
      
      // Double check specific fonts
      const fontChecks = fontFamilies.map(font => 
        document.fonts.load(`1em ${font}`)
      );
      
      await Promise.all(fontChecks);
    } catch (error) {
      console.warn('Font loading failed:', error);
    }
  },

  // Add fallback classes if fonts fail to load
  addFontFallbacks: () => {
    const checkAndAddFallback = (fontFamily: string, fallbackClass: string) => {
      if (!fontLoading.isFontLoaded(fontFamily)) {
        document.documentElement.classList.add(fallbackClass);
      }
    };

    // Check after a delay to allow fonts to load
    setTimeout(() => {
      checkAndAddFallback('Geist', 'geist-fallback');
      checkAndAddFallback('Gilda Display', 'gilda-fallback');
    }, 3000);
  }
};

// Browser detection utilities
export const browserDetection: BrowserDetection = {
  // Check if running on iOS
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  // Check if running on Safari
  isSafari: () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },

  // Check if running on Internet Explorer
  isIE: () => {
    return /MSIE|Trident/.test(navigator.userAgent);
  },

  // Check if running on Edge (legacy)
  isEdgeLegacy: () => {
    return /Edge/.test(navigator.userAgent);
  },

  // Check if running on Firefox
  isFirefox: () => {
    return /Firefox/.test(navigator.userAgent);
  },

  // Check if running on Chrome
  isChrome: () => {
    return /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  }
};

// Performance optimization utilities
export const performanceOptimization: PerformanceOptimization = {
  // Add will-change property for animations
  optimizeForAnimation: (element: HTMLElement | null) => {
    if (element) {
      element.style.willChange = 'transform, opacity';
    }
  },

  // Remove will-change property after animation
  cleanupAfterAnimation: (element: HTMLElement | null) => {
    if (element) {
      element.style.willChange = 'auto';
    }
  },

  // Enable hardware acceleration
  enableHardwareAcceleration: (element: HTMLElement | null) => {
    if (element) {
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
    }
  }
};

// Accessibility utilities
export const accessibilityUtils: AccessibilityUtils = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check if user prefers high contrast
  prefersHighContrast: () => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Add reduced motion class if needed
  handleReducedMotion: () => {
    if (accessibilityUtils.prefersReducedMotion()) {
      document.documentElement.classList.add('reduce-motion');
    }
  },

  // Add high contrast class if needed
  handleHighContrast: () => {
    if (accessibilityUtils.prefersHighContrast()) {
      document.documentElement.classList.add('high-contrast');
    }
  }
};

// Main initialization function
export const initBrowserCompatibility = (): void => {
  // Fix mobile viewport height
  fixMobileViewportHeight();

  // Handle font loading
  fontLoading.waitForFonts();
  fontLoading.addFontFallbacks();

  // Handle accessibility preferences
  accessibilityUtils.handleReducedMotion();
  accessibilityUtils.handleHighContrast();

  // Add browser-specific classes
  const html = document.documentElement;
  
  if (browserDetection.isIOS()) html.classList.add('ios');
  if (browserDetection.isSafari()) html.classList.add('safari');
  if (browserDetection.isIE()) html.classList.add('ie');
  if (browserDetection.isEdgeLegacy()) html.classList.add('edge-legacy');
  if (browserDetection.isFirefox()) html.classList.add('firefox');
  if (browserDetection.isChrome()) html.classList.add('chrome');

  // Add feature support classes
  if (!featureDetection.supportsBackdropFilter()) {
    html.classList.add('no-backdrop-filter');
  }
  
  if (!featureDetection.supportsClamp()) {
    html.classList.add('no-clamp');
  }
  
  if (!featureDetection.supportsGrid()) {
    html.classList.add('no-grid');
  }
  
  if (!featureDetection.supportsCustomProperties()) {
    html.classList.add('no-custom-properties');
  }

  console.log('Browser compatibility utilities initialized');
};

// Export default initialization
export default initBrowserCompatibility;