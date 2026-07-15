/**
 * Package-grounded API reference blocks for interface docs pages.
 */
import React from 'react';
import type { DocsInterfaceApiSection } from '@/components/docs/models/bitcode-docs-types';

export function DocsInterfaceApiReferenceSection({ sections }: { sections: readonly DocsInterfaceApiSection[] }) {
  if (!sections.length) return null;

  return (
    <section className="grid gap-5">
      <div className="rounded-none border border-emerald-300/12 bg-emerald-400/[0.045] p-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200/72">API reference</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Usage features, inputs, and expected outputs
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-50/72">
          These references are grounded in the package code. Read them like API docs: when to call
          the feature, how to shape the payload, what should come back, and where product or
          Exchange should verify the result.
        </p>
      </div>

      {sections.map((section) => (
        <article
          key={section.id}
          id={section.id}
          className="scroll-mt-32 rounded-none border border-white/10 bg-black/24 p-5 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-semibold tracking-tight text-white">{section.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/70">{section.summary}</p>
            </div>
            <code className="rounded-none border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[0.68rem] text-emerald-100/74">
              {section.packagePath}
            </code>
          </div>

          <div className="mt-5 grid gap-4">
            {section.features.map((feature) => (
              <div
                key={`${section.id}-${feature.name}`}
                className="rounded-none border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="break-all rounded-none border border-cyan-300/12 bg-cyan-400/[0.06] px-3 py-1.5 text-[0.72rem] text-cyan-50">
                        {feature.name}
                      </code>
                      {feature.method ? (
                        <span className="rounded-none border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/52">
                          {feature.method}
                        </span>
                      ) : null}
                      {feature.requiresConfirmation ? (
                        <span className="rounded-none border border-amber-300/20 bg-amber-400/[0.08] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-100/72">
                          confirmed write
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/76">{feature.useWhen}</p>
                  </div>
                  <code className="rounded-none border border-white/8 bg-black/20 px-3 py-1.5 text-[0.66rem] text-white/45">
                    {feature.packagePath}
                  </code>
                </div>

                <div className="mt-4 rounded-none border border-emerald-300/10 bg-emerald-400/[0.035] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">How to use</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/76">{feature.howToUse}</p>
                </div>

                <div className="mt-4 grid gap-3 laptop:grid-cols-2">
                  <div className="rounded-none border border-white/8 bg-black/18 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Inputs</p>
                    <ul className="mt-3 grid gap-2">
                      {feature.inputs.map((input) => (
                        <li key={`${feature.name}-input-${input}`} className="text-sm leading-6 text-white/70">
                          {input}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-none border border-white/8 bg-black/18 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/62">Expected outputs</p>
                    <ul className="mt-3 grid gap-2">
                      {feature.outputs.map((output) => (
                        <li key={`${feature.name}-output-${output}`} className="text-sm leading-6 text-cyan-50/72">
                          {output}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {feature.verifyInProduct || feature.failureModes?.length ? (
                  <div className="mt-4 grid gap-3 laptop:grid-cols-2">
                    {feature.verifyInProduct ? (
                      <div className="rounded-none border border-emerald-300/10 bg-emerald-400/[0.035] p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/68">Verify</p>
                        <p className="mt-2 text-sm leading-6 text-emerald-50/70">{feature.verifyInProduct}</p>
                      </div>
                    ) : null}
                    {feature.failureModes?.length ? (
                      <div className="rounded-none border border-amber-300/12 bg-amber-400/[0.045] p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-100/72">Failure posture</p>
                        <ul className="mt-3 grid gap-2">
                          {feature.failureModes.map((mode) => (
                            <li key={`${feature.name}-failure-${mode}`} className="text-sm leading-6 text-amber-50/72">
                              {mode}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
