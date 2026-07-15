"use client";
import React from 'react';
import styles from './orbital-logo.module.css';

interface Props { className?: string }

export default function OrbitalLogo({ className = '' }: Props) {
  const size = className.includes('print-logo') ? 30 : 60;
  return (
    <div className={`${styles.container} ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <div className={styles.logo}>
        <div className={styles.inner}>
          <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svg}>
            <circle cx="30" cy="30" r="8" fill="rgba(103, 254, 183, 0.9)" />
            <circle cx="30" cy="30" r="12" fill="none" stroke="rgba(103, 254, 183, 0.4)" strokeWidth="1" />
            <ellipse cx="30" cy="30" rx="20" ry="20" fill="none" stroke="rgba(103, 254, 183, 0.3)" strokeWidth="1" className={styles.ring1} />
            <ellipse cx="30" cy="30" rx="26" ry="16" fill="none" stroke="rgba(103, 254, 183, 0.2)" strokeWidth="1" className={styles.ring2} transform="rotate(60 30 30)" />
            <ellipse cx="30" cy="30" rx="16" ry="26" fill="none" stroke="rgba(103, 254, 183, 0.2)" strokeWidth="1" className={styles.ring3} transform="rotate(30 30 30)" />
            <circle cx="50" cy="30" r="2" fill="rgba(103, 254, 183, 0.8)" className={styles.q1} />
            <circle cx="30" cy="10" r="2" fill="rgba(103, 254, 183, 0.8)" className={styles.q2} />
            <circle cx="14" cy="40" r="2" fill="rgba(103, 254, 183, 0.8)" className={styles.q3} />
          </svg>
        </div>
      </div>
    </div>
  );
}
