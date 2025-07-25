import React, { useState } from 'react';
import './Switch.css';

interface SwitchProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onToggle?: (isOn: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ className = '', size = 'medium', onToggle }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <div 
      className={`switch ${className} switch--${size} ${isOn ? 'switch--on' : 'switch--off'}`}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <div className="switch__track">
        <div className="switch__thumb"></div>
      </div>
    </div>
  );
};

export default Switch;