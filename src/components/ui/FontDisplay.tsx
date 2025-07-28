import React from 'react';
import { ProjectFont } from '../../hooks/useProjectData';

interface FontDisplayProps {
  fonts: ProjectFont[];
}

const FontDisplay: React.FC<FontDisplayProps> = ({ fonts }) => {
  const getWeightClass = (index: number) => {
    const weights = ['font-weight-light', 'font-weight-regular', 'font-weight-medium', 'font-weight-bold'];
    return weights[index % weights.length];
  };

  return (
    <div className="font-display">
      <h3 className="font-display-title">Fonts</h3>
      <div className="font-display-column">
        {fonts.map((font, index) => (
          <React.Fragment key={index}>
            <div className="font-display-item-vertical">
              <span className={`font-display-name-vertical ${getWeightClass(index)}`}>{font.name}</span>
            </div>
            {index < fonts.length - 1 && <div className="font-display-divider-vertical"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FontDisplay;