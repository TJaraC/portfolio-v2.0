import React from 'react';

interface ColorPaletteProps {
  colors: string[];
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  return (
    <div className="color-palette">
      <h3 className="color-palette-title">Colours</h3>
      <div className="color-palette-grid">
        {colors.map((color, index) => (
          <div 
            key={index} 
            className="color-palette-swatch" 
            style={{ backgroundColor: color }}
          >
            <div className="color-palette-code">{color}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;