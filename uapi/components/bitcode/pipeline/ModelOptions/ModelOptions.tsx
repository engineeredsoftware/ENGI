import React from 'react';
const statuses = {
  offline: 'text-gray-500 bg-gray-100/10',
  online: 'text-green-400 bg-green-400/10',
  error: 'text-rose-400 bg-rose-400/10',
}
const environments = {
  Preview: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
  Production: 'text-indigo-400 bg-indigo-400/10 ring-indigo-400/30',
}
import { SUPPORTED_LLM_MODELS } from '@/utils/model-pricing';

// Build live catalog-derived list for display
const deployments = SUPPORTED_LLM_MODELS.flatMap((prov, idxProv) =>
  prov.models.map((m, idx) => {
    const inputUSD = m.inputPriceUSDPerMTok;
    const outputUSD = m.outputPriceUSDPerMTok;
    const statusText = (inputUSD !== undefined && outputUSD !== undefined)
      ? `In $${inputUSD}/1M · Out $${outputUSD}/1M`
      : 'Pricing TBD';
    const description = (m.inputLimit || m.outputLimit)
      ? `Limits: in ${m.inputLimit?.toLocaleString?.() ?? '—'} · out ${m.outputLimit?.toLocaleString?.() ?? '—'}`
      : (m.notes || '');
    return {
      id: `${idxProv + 1}-${idx + 1}`,
      href: '#',
      teamName: m.id, // friendly id
      status: 'online' as keyof typeof statuses,
      statusText,
      description,
      environment: prov.provider.charAt(0).toUpperCase() + prov.provider.slice(1),
    };
  })
);

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export default function ModelOptions() {
  return (
    <ul role="list" className="divide-y divide-white/5 px-10">
      {deployments.map((deployment) => (
        <li key={deployment.id} className="text-right relative flex items-center space-x-4 py-4">
          <div className="min-w-0 flex-auto">
            <div className="flex items-center justify-end gap-x-3">
              {/* @ts-ignore */}
              <div className={classNames(statuses[deployment.status], 'flex-none p-1')}>
                <div className="h-2 w-2 bg-current" />
              </div>
              <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
                <a href={deployment.href} className="flex gap-x-2">
                  <span className="truncate">{deployment.teamName}</span>
                  <span className="absolute inset-0" />
                </a>
              </h2>

              <div
                className={classNames(
                  // @ts-ignore
                  environments[deployment.environment],
                  ' flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset'
                )}
              >
                {deployment.environment}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-x-2.5 text-xs leading-5 text-gray-400">
              <p className="truncate">{deployment.description}</p>
              <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-gray-300">
                <circle cx={1} cy={1} r={1} />
              </svg>
              <p className="whitespace-nowrap">{deployment.statusText}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
