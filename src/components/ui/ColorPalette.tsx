import React, { useEffect, useRef, useState } from 'react';

interface ColorPaletteProps {
  colors: string[];
}

const getRelativeLuminance = (hex: string): number => {
  const cleaned = hex.replace('#', '').trim();
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : cleaned;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return 0;

  const toLinear = (channel: number) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(parseInt(normalized.slice(0, 2), 16));
  const g = toLinear(parseInt(normalized.slice(2, 4), 16));
  const b = toLinear(parseInt(normalized.slice(4, 6), 16));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getSwatchInk = (hex: string): '#131313' | '#FFFFFF' => {
  const luminance = getRelativeLuminance(hex);
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  const contrastWithDark = (luminance + 0.05) / 0.057;
  return contrastWithDark >= contrastWithWhite ? '#131313' : '#FFFFFF';
};

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = (color: string, index: number) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(color).catch(() => {});
    }
    setCopiedIndex(index);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setCopiedIndex(null);
    }, 1400);
  };

  return (
    <div className="color-palette">
      <div className="color-palette-header">
        <h3 className="color-palette-title">Colours</h3>
        <span className="color-palette-count" aria-hidden="true">
          {String(colors.length).padStart(2, '0')}
        </span>
      </div>
      <div className="color-palette-grid">
        {colors.map((color, index) => {
          const ink = getSwatchInk(color);
          const isCopied = copiedIndex === index;

          return (
            <button
              key={`${color}-${index}`}
              type="button"
              className="color-palette-swatch"
              style={{ backgroundColor: color, color: ink }}
              onClick={() => handleCopy(color, index)}
              aria-label={`Copy colour ${color}`}
              title={`Click to copy ${color}`}
            >
              <span className="color-palette-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="color-palette-code">{isCopied ? 'Copied' : color}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorPalette;
