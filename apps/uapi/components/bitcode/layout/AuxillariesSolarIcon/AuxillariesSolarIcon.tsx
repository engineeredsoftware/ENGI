import React from 'react';

import menuStyles from '../../menus/GlassyMenu/glassy-menu.module.css';

interface AuxillariesSolarIconProps {
  className?: string;
  /**
   * `menu` — compact chrome glyph (UserMenu row); circular rings + ::after planets.
   * `backdrop` — full-bleed elliptical field; circular planets + epic multi-layer star.
   */
  variant?: 'menu' | 'backdrop';
}

export function AuxillariesSolarIcon({
  className = '',
  variant = 'menu',
}: AuxillariesSolarIconProps) {
  const isBackdrop = variant === 'backdrop';
  const variantClass = isBackdrop ? menuStyles.auxillariesSolarIconBackdrop : '';

  return (
    <span
      aria-hidden="true"
      className={`${menuStyles.auxillariesSolarIcon} ${variantClass} ${className}`.trim()}
      data-testid="auxillaries-solar-icon"
      data-variant={variant}
    >
      <span className={menuStyles.auxillariesSolarHalo} />
      <span className={menuStyles.auxillariesSolarRing} data-ring="outer" />
      <span className={menuStyles.auxillariesSolarRing} data-ring="middle" />
      <span className={menuStyles.auxillariesSolarRing} data-ring="inner" />
      {isBackdrop ? (
        <>
          <span className={menuStyles.auxillariesSolarPlanet} data-ring="outer" />
          <span className={menuStyles.auxillariesSolarPlanet} data-ring="middle" />
          <span className={menuStyles.auxillariesSolarPlanet} data-ring="inner" />
          {/*
            Quantum-orb language (square energy plate + frames) under the
            existing circular epic star — enhances, does not replace, the core.
          */}
          <span className={menuStyles.auxillariesSolarQuantumPlate} />
          <span className={menuStyles.auxillariesSolarQuantumFrame} data-frame="outer" />
          <span className={menuStyles.auxillariesSolarQuantumFrame} data-frame="inner" />
          {/* Epic star stack: corona → rotating flare → core */}
          <span className={menuStyles.auxillariesSolarCorona} />
          <span className={menuStyles.auxillariesSolarFlare} />
          <span className={menuStyles.auxillariesSolarCore} data-epic="true" />
        </>
      ) : (
        <span className={menuStyles.auxillariesSolarCore} />
      )}
    </span>
  );
}

export default AuxillariesSolarIcon;
