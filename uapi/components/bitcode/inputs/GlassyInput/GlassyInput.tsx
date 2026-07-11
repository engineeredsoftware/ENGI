"use client";

import React from 'react';
import styles from './glassy-input.module.css';

type Props = React.PropsWithChildren<{ className?: string } & React.HTMLAttributes<HTMLDivElement>>;

export function GlassyInput({ className = '', children, ...rest }: Props) {
  return (
    <div className={`${styles.container} ${className}`} {...rest}>
      <div className={`${styles.cornerDot} ${styles.tl}`} />
      <div className={`${styles.cornerDot} ${styles.tr}`} />
      <div className={`${styles.cornerDot} ${styles.bl}`} />
      <div className={`${styles.cornerDot} ${styles.br}`} />
      {children}
    </div>
  );
}

export default GlassyInput;

