import React from 'react';
import { ProjectFont } from '../../hooks/useProjectData';

interface FontDisplayProps {
  fonts: ProjectFont[];
}

interface ParsedFontMeta {
  weightClass: string;
  weightCode: string;
  fontFamily?: string;
}

const parseFontMeta = (name: string): ParsedFontMeta => {
  const lower = name.toLowerCase();

  let weightClass = 'font-weight-regular';
  let weightCode = '400';

  if (/\bthin\b/.test(lower)) {
    weightClass = 'font-weight-thin';
    weightCode = '100';
  } else if (/\blight\b/.test(lower)) {
    weightClass = 'font-weight-light';
    weightCode = '300';
  } else if (/\bsemi[\s-]?bold\b/.test(lower)) {
    weightClass = 'font-weight-semibold';
    weightCode = '600';
  } else if (/\bbold\b/.test(lower)) {
    weightClass = 'font-weight-bold';
    weightCode = '700';
  } else if (/\bmedium\b/.test(lower)) {
    weightClass = 'font-weight-medium';
    weightCode = '500';
  } else if (/\bregular\b/.test(lower)) {
    weightClass = 'font-weight-regular';
    weightCode = '400';
  }

  let fontFamily: string | undefined;
  if (lower.includes('gilda')) {
    fontFamily = "'Gilda Display', 'Gilda-Fallback', serif";
  } else if (lower.includes('geist')) {
    fontFamily = "'Geist', 'Geist-Fallback', sans-serif";
  }

  return { weightClass, weightCode, fontFamily };
};

const FontDisplay: React.FC<FontDisplayProps> = ({ fonts }) => {
  const primaryFontMeta = fonts.length ? parseFontMeta(fonts[0].name) : null;

  return (
    <div className="font-display">
      <div className="font-display-header">
        <h3 className="font-display-title">Fonts</h3>
        <span className="font-display-count" aria-hidden="true">
          {String(fonts.length).padStart(2, '0')}
        </span>
      </div>
      <div className="font-display-column">
        {fonts.map((font, index) => {
          const meta = parseFontMeta(font.name);

          return (
            <React.Fragment key={`${font.name}-${index}`}>
              <div className="font-display-item-vertical">
                <span
                  className={`font-display-name-vertical ${meta.weightClass}`}
                  style={meta.fontFamily ? { fontFamily: meta.fontFamily } : undefined}
                >
                  {font.name}
                </span>
                <span className="font-display-weight-code" aria-hidden="true">
                  {meta.weightCode}
                </span>
              </div>
              {index < fonts.length - 1 && <div className="font-display-divider-vertical" />}
            </React.Fragment>
          );
        })}
      </div>
      <div
        className="font-display-specimen"
        style={primaryFontMeta?.fontFamily ? { fontFamily: primaryFontMeta.fontFamily } : undefined}
        aria-hidden="true"
      >
        <span className="font-display-glyph">Aa</span>
        <span className="font-display-alphabet">ABCDEFGHIJKLM · 0123456789</span>
      </div>
    </div>
  );
};

export default FontDisplay;
