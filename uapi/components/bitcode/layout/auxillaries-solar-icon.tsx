import React from 'react';

import menuStyles from '../menus/glassy-menu.module.css';

interface AuxillariesSolarIconProps {
  className?: string;
}

export function AuxillariesSolarIcon({ className = '' }: AuxillariesSolarIconProps) {
  return (
    <span
      aria-hidden="true"
      className={`${menuStyles.auxillariesSolarIcon} ${className}`.trim()}
      data-testid="auxillaries-solar-icon"
    >
      <span className={menuStyles.auxillariesSolarHalo} />
      <span className={menuStyles.auxillariesSolarRing} data-ring="outer" />
      <span className={menuStyles.auxillariesSolarRing} data-ring="middle" />
      <span className={menuStyles.auxillariesSolarRing} data-ring="inner" />
      <span className={menuStyles.auxillariesSolarCore} />
    </span>
  );
}

export default AuxillariesSolarIcon;
