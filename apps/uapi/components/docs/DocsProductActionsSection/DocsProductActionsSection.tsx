/**
 * product write-action manual section used on the product-actions docs page.
 */
import React from 'react';
import { PRODUCT_ACTION_GUIDES } from '@/components/docs/models/bitcode-docs-content';

export function DocsProductActionsSection() {
  return (
    <section
      id="product-actions"
      className="min-w-0 max-w-full scroll-mt-32 overflow-x-clip rounded-none border border-white/10 bg-black/24 p-4 backdrop-blur-xl phone:p-5"
    >
      <div className="min-w-0 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200/72">Action manual</p>
        <h2 className="mt-3 break-words text-3xl font-semibold tracking-tight text-white">
          Write deliberately, then read the result
        </h2>
        <p className="mt-3 break-words text-sm leading-7 text-white/72">
          The product workspace is not a button pile. Each write changes a bounded part of Bitcode state,
          and each expected read tells you whether to continue, stop, or open exact proof detail.
        </p>
      </div>
      <div className="mt-6 grid min-w-0 gap-3">
        {PRODUCT_ACTION_GUIDES.map((item, index) => (
          <article
            id={item.id}
            key={item.id}
            className="grid min-w-0 scroll-mt-32 gap-4 rounded-none border border-white/8 bg-white/[0.03] p-4 tablet:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)]"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-200/70">
                {String(index + 1).padStart(2, '0')} / {item.location}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{item.action}</h3>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Write</p>
              <p className="mt-2 text-sm leading-6 text-white/76">{item.write}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/65">
                Expected read
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-50/76">{item.expectedRead}</p>
              <p className="mt-3 rounded-none border border-emerald-300/10 bg-emerald-400/[0.045] px-3 py-2 text-xs leading-5 text-emerald-50/64">
                {item.proofSignal}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
