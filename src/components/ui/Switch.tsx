import React, { useState } from 'react';
import '../../styles/Switch.css';

interface SwitchProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onToggle?: (isOn: boolean) => void;
  /** Accessible name announced by screen readers (WCAG 4.1.2). */
  label: string;
}

const Switch: React.FC<SwitchProps> = ({ className = '', size = 'medium', onToggle, label }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  // Native <button> gives focus, Enter and Space for free; role="switch" + aria-checked
  // exposes the on/off state.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      className={`switch ${className} switch--${size} ${isOn ? 'switch--on' : 'switch--off'}`}
      onClick={handleToggle}
    >
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb"></span>
      </span>
    </button>
  );
};

export default Switch;
