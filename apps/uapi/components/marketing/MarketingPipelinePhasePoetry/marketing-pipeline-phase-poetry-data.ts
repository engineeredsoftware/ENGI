/**
 * Phase poetry templates, emotional colors, and device quality for pipeline poetry UX.
 */

export const PHASE_POETRY_TEMPLATES = {
  planning: {
    anticipation: [
      'In the quiet space before creation...',
      'Ideas crystallize like morning dew',
      'Your vision takes its first breath',
      'The architecture of dreams begins',
    ],
    technical: [
      'Mapping the pathways of logic',
      'Each requirement a stepping stone',
      'Structure emerges from possibility',
      'The blueprint of excellence unfolds',
    ],
    creative: [
      'Imagination sparks to life',
      'Infinite possibilities dance',
      'The canvas awaits your vision',
      'Creation stirs in the depths of thought',
    ],
  },
  creating: {
    flow: [
      'Fingers dance across keys like rain',
      'Code flows like water finding its course',
      'Each line builds upon the last',
      'The rhythm of creation carries you forward',
    ],
    focus: [
      'Deep in the zone of pure creation',
      'Time dissolves in focused flow',
      'Logic and artistry unite',
      'The work becomes meditation',
    ],
    energy: [
      'Electric with creative force',
      'Ideas cascade into reality',
      'The keyboard sings your vision',
      'Momentum builds with every keystroke',
    ],
  },
  refining: {
    craftsmanship: [
      'Polishing each edge to perfection',
      'Details matter in the pursuit of beauty',
      'Refinement reveals true elegance',
      'Excellence lives in the small touches',
    ],
    clarity: [
      'Complexity gives way to clarity',
      'Each iteration brings greater truth',
      'Simplicity emerges from complexity',
      'The essence shines through',
    ],
    mastery: [
      "The master's touch in every detail",
      'Years of learning guide each choice',
      'Wisdom transforms the ordinary',
      'Craft becomes art',
    ],
  },
  testing: {
    confidence: [
      'Trust builds with every passing test',
      'Confidence grows through validation',
      'Each green light a small victory',
      'Quality assurance becomes assurance of soul',
    ],
    resilience: [
      'Breaking to become unbreakable',
      'Edge cases reveal inner strength',
      'Every bug fixed makes us stronger',
      'Robustness through rigorous trial',
    ],
    precision: [
      'Measuring twice, coding once',
      'Precision in every assertion',
      'Testing the bounds of possibility',
      'Certainty through careful verification',
    ],
  },
  delivering: {
    triumph: [
      'The moment of truth arrives',
      'Your creation ready to serve',
      'From concept to reality complete',
      'The gift of your work enters the world',
    ],
    completion: [
      'The circle closes with delivery',
      'Purpose fulfilled in working code',
      'Your vision now lives and breathes',
      'The Shippable reaches its destination',
    ],
    impact: [
      'Ripples of change begin to spread',
      'Your work touches other lives',
      'Impact radiates from this moment',
      'The future shifts with your contribution',
    ],
  },
  celebrating: {
    fulfillment: [
      "Pause to honor what you've built",
      'Satisfaction settles in your soul',
      'The journey was worth every step',
      'Achievement tastes sweet and true',
    ],
    gratitude: [
      'Grateful for the gift of creation',
      'Thankful for the chance to build',
      'Appreciation for the path traveled',
      'Blessed to bring ideas to life',
    ],
    transcendence: [
      'You are more than when you started',
      'Growth lives in every line written',
      'The creator and creation both transformed',
      'Excellence becomes part of your being',
    ],
  },
} as const;

export const EMOTIONAL_COLORS = {
  anticipation: '#a78bfa',
  flow: '#34d399',
  focus: '#06b6d4',
  confidence: '#67feb7',
  triumph: '#f59e0b',
  fulfillment: '#ec4899',
  craftsmanship: '#8b5cf6',
  clarity: '#10b981',
  mastery: '#d97706',
  resilience: '#ef4444',
  precision: '#3b82f6',
  completion: '#67feb7',
  impact: '#f59e0b',
  gratitude: '#ec4899',
  transcendence: '#a855f7',
} as const;

export const POETRY_QUALITY = (() => {
  if (typeof navigator === 'undefined') return 1;

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) return 0.3;

  const lowSpec = (mem && mem <= 4) || (cores && cores <= 4);
  return lowSpec ? 0.6 : 1;
})();
