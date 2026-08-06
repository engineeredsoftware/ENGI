/**
 * product read-surface guide section used on the read-results docs page.
 */
import React from 'react';
import { PRODUCT_READ_GUIDES } from '@/components/docs/models/bitcode-docs-content';

export function DocsProductReadsSection() {
  return (
    <section
      id="product-reads"
      className="min-w-0 max-w-full scroll-mt-32 overflow-x-clip rounded-none border border-white/10 bg-black/24 p-4 backdrop-blur-xl phone:p-5"
    >
      <div className="min-w-0 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/72">Read guide</p>
        <h2 className="mt-3 break-words text-3xl font-semibold tracking-tight text-white">
          Expected results and proof-bearing reads
        </h2>
        <p className="mt-3 break-words text-sm leading-7 text-white/72">
          These are the read surfaces a product user should trust before moving from source
          supply into fit, closure, settlement, or ledger history.
        </p>
      </div>
      <div className="mt-6 grid min-w-0 gap-3 tablet:grid-cols-2">
        {PRODUCT_READ_GUIDES.map((item) => (
          <article
            key={item.id}
            className="min-w-0 max-w-full rounded-none border border-white/8 bg-white/[0.03] p-4"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/68">{item.location}</p>
            <h3 className="mt-2 break-words text-lg font-semibold text-white">{item.read}</h3>
            <p className="mt-2 break-words text-sm leading-6 text-white/74">{item.tellsYou}</p>
            <p className="mt-3 break-words rounded-none border border-cyan-300/10 bg-cyan-400/[0.045] px-3 py-2 text-xs leading-5 text-cyan-50/68">
              {item.expectedResult}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
