import React from 'react';
import { ProjectFont } from '../../hooks/useProjectData';

interface FontDisplayProps {
  fonts: ProjectFont[];
}

const FontDisplay: React.FC<FontDisplayProps> = ({ fonts }) => {
  return (
    <div className="font-display">
      <h3 className="font-display-title">Fonts</h3>
      <div className="font-display-grid">
        {fonts.map((font, index) => (
          <div key={index} className="font-display-item">
            <div className="font-display-sample" style={{ fontFamily: 'Geist' }}>
              {font.sample}
            </div>
            <div className="font-display-details">
              <span className="font-display-name">{font.name}</span>
              <div className="font-display-divider"></div>
              <p className="font-display-description">{font.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FontDisplay;