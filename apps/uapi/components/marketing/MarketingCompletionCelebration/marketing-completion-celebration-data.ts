/**
 * Celebration messages, achievement definitions, and device quality for completion UX.
 */

export const CELEBRATION_QUALITY = (() => {
  if (typeof navigator === 'undefined') return 1;

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) return 0.3;

  const lowSpec = (mem && mem <= 4) || (cores && cores <= 4);
  return lowSpec ? 0.6 : 1;
})();

export const CELEBRATION_MESSAGES = {
  component: [
    '🎨 Beautiful component created!',
    '✨ Component mastery achieved!',
    '🔥 Outstanding component work!',
    '🌟 Component excellence unlocked!',
  ],
  service: [
    '⚡ Service architecture perfected!',
    '🚀 Backend brilliance delivered!',
    '🔧 Service engineering mastery!',
    '💎 Robust service created!',
  ],
  test: [
    '🧪 Testing excellence achieved!',
    '✅ Quality assurance champion!',
    '🎯 Perfect test coverage!',
    '🛡️ Bulletproof testing deployed!',
  ],
  refactor: [
    '🔄 Code transformation complete!',
    '✨ Refactoring mastery unlocked!',
    '🏗️ Architecture improvement achieved!',
    '💫 Code elegance perfected!',
  ],
  feature: [
    '🎉 Feature milestone reached!',
    '🌈 User experience enhanced!',
    '🚀 Innovation delivered!',
    '⭐ Feature excellence achieved!',
  ],
  bug: [
    '🐛 Bug vanquished successfully!',
    '🔥 Problem solving mastery!',
    '🎯 Debug precision achieved!',
    '💪 Code reliability restored!',
  ],
  documentation: [
    '📚 Documentation excellence!',
    '✍️ Knowledge sharing champion!',
    '📖 Clarity and precision achieved!',
    '💡 Developer experience enhanced!',
  ],
} as const;

export const ACHIEVEMENT_DEFINITIONS = {
  'first-completion': '🎯 First Completion',
  'speed-demon': '⚡ Speed Demon',
  'quality-champion': '👑 Quality Champion',
  'pattern-master': '🧠 Pattern Master',
  'streak-warrior': '🔥 Streak Warrior',
  'efficiency-guru': '💎 Efficiency Guru',
  'architecture-sage': '🏗️ Architecture Sage',
  'testing-legend': '🧪 Testing Legend',
  'refactor-specialist': '✨ Refactor Specialist',
  'innovation-pioneer': '🚀 Innovation Pioneer',
} as const;

export function formatCelebrationDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function getQualityColor(quality: number): string {
  if (quality >= 0.9) return 'text-green-400';
  if (quality >= 0.7) return 'text-yellow-400';
  return 'text-orange-400';
}
