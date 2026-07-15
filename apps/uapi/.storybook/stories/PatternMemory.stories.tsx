import type { Meta, StoryObj } from '@storybook/react';

type PatternMemoryProps = {
  patterns: Array<{
    name: string;
    confidence: number;
    source: string;
  }>;
};

function PatternMemoryStoryPanel({ patterns }: PatternMemoryProps) {
  return (
    <section className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm uppercase tracking-wide text-emerald-300">Bitcode Pattern Memory</p>
          <h1 className="mt-2 text-3xl font-semibold">Reusable execution patterns</h1>
        </header>
        <div className="grid gap-3">
          {patterns.map((pattern) => (
            <article key={pattern.name} className="rounded-md border border-emerald-400/20 bg-slate-900 p-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-medium">{pattern.name}</h2>
                <span className="text-sm text-emerald-300">{Math.round(pattern.confidence * 100)}%</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{pattern.source}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const meta: Meta<typeof PatternMemoryStoryPanel> = {
  title: 'Bitcode/Surprise & Delight/Pattern Memory',
  component: PatternMemoryStoryPanel,
};

export default meta;

type Story = StoryObj<typeof PatternMemoryStoryPanel>;

export const StablePatterns: Story = {
  args: {
    patterns: [
      { name: 'Read decomposition', confidence: 0.92, source: 'Repeated across Terminal runs' },
      { name: 'AssetPack evidence review', confidence: 0.87, source: 'Observed in Finish receipts' },
      { name: 'BTC fee posture check', confidence: 0.81, source: 'Wallet readiness flow' },
    ],
  },
};
