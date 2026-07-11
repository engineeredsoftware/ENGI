'use client';

import React from 'react';

export type BitcodeMetric = {
  label: string;
  value: string;
};

interface BitcodeMetricGridProps {
  metrics: BitcodeMetric[];
  className?: string;
  columnsClassName?: string;
  itemClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  emptyMessage?: string;
  emptyClassName?: string;
}

export default function BitcodeMetricGrid({
  metrics,
  className,
  columnsClassName,
  itemClassName,
  labelClassName,
  valueClassName,
  emptyMessage,
  emptyClassName,
}: BitcodeMetricGridProps) {
  if (!metrics.length) {
    return emptyMessage ? (
      <div
        className={
          emptyClassName ||
          ' border border-white/8 bg-white/5 px-4 py-4 text-sm leading-6 text-neutral-300'
        }
      >
        {emptyMessage}
      </div>
    ) : null;
  }

  return (
    <div className={`grid gap-3 ${columnsClassName || 'sm:grid-cols-2'} ${className || ''}`.trim()}>
      {metrics.map((metric) => (
        <div
          key={`${metric.label}-${metric.value}`}
          className={itemClassName || ' border border-white/8 bg-white/5 px-4 py-4'}
        >
          <p className={labelClassName || 'text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500'}>
            {metric.label}
          </p>
          <p className={`mt-2 ${valueClassName || 'text-sm font-semibold text-white'}`.trim()}>{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
