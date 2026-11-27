import React, { useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { useScrollAnimation } from '../../hooks/useLenisScroll';
import responsiveImages from '../../data/responsive-images.json';

interface ResponsiveImageEntry {
  width: number;
  height: number;
  widths: number[];
}

const RESPONSIVE_IMAGES: Record<string, ResponsiveImageEntry> = responsiveImages;

/**
 * srcset with the generated `-<w>w.webp` variants plus the original (see
 * scripts/generate-images.mjs), and the intrinsic size for width/height.
 */
const getResponsiveAttributes = (src: string, sizes: string) => {
  const entry = RESPONSIVE_IMAGES[src];
  if (!entry) return {};
  const candidates = [
    ...entry.widths.map((width) => `${src.replace(/\.webp$/, `-${width}w.webp`)} ${width}w`),
    `${src} ${entry.width}w`,
  ];
  return {
    srcSet: candidates.join(', '),
    sizes,
    width: entry.width,
    height: entry.height,
  };
};

interface ImageWithCurtainProps {
  src: string;
  alt: string;
  /** Rendered width of the image per breakpoint, for srcset selection. */
  sizes?: string;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

const ImageWithCurtain: React.FC<ImageWithCurtainProps> = ({
  src,
  alt,
  sizes = '100vw',
  className = '',
  delay = 0,
  duration = 1.2,
  threshold = 0.1,
  once = true,
  loading = 'lazy',
  fetchPriority,
}) => {
  const curtainRef = useRef<HTMLDivElement>(null);
  // React 18 no reconoce la prop camelCase `fetchPriority`; el atributo HTML en
  // minúsculas se pasa tal cual al DOM sin warnings.
  const priorityAttributes = fetchPriority ? { fetchpriority: fetchPriority } : {};
  const imageRef = useRef<HTMLImageElement>(null);

  const elementRef = useScrollAnimation(
    () => {
      setTimeout(() => {
        if (curtainRef.current) {
          // Animar la cortina desde arriba hacia abajo (saliendo)
          gsap.fromTo(
            curtainRef.current,
            {
              y: '0%',
              scaleY: 1,
            },
            {
              y: '100%',
              scaleY: 1,
              duration: duration,
              ease: 'power2.inOut',
              transformOrigin: 'top center',
            }
          );
        }
      }, delay * 1000);
    },
    { threshold, once }
  );

  return (
    <div
      ref={elementRef}
      className={`image-curtain-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
      }}
    >
      <img
        ref={imageRef}
        src={src}
        {...getResponsiveAttributes(src, sizes)}
        alt={alt}
        decoding="async"
        loading={loading}
        {...priorityAttributes}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: '1',
        }}
      />

      {/* Cortina blanca */}
      <div
        ref={curtainRef}
        className="image-curtain"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--global-bg-3, #f5f5f5)',
          zIndex: 1,
          transformOrigin: 'top center',
        }}
      />
    </div>
  );
};

export default ImageWithCurtain;
