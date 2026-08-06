# PERFORMANCE OPTIMIZATION

**Engineering Excellence Through Speed**

## Core Principles

### 1. Measure First, Optimize Second
Never optimize based on assumptions. The bottleneck is rarely where you think it is.

### 2. The Three Layers of Performance
- **Network**: Prefetch, preconnect, warm caches
- **JavaScript**: Code splitting, lazy loading, memoization
- **Rendering**: CSS containment, GPU layers, animation optimization

## Critical Performance Patterns in Bitcode

### Product surfaces (pipeline telemetry + deposit review, 2026)

Living launch surfaces under `/deposits`, `/reads`, and shared pipeline chrome:

| Hot path | Law | Primary files |
| --- | --- | --- |
| Pipeline log stall clock | 1s tick only re-renders stall chrome, not every completed row | `PipelineExecutionLog.tsx` → `PipelineProcessingStallChrome` |
| Elapsed run-start | Compute once per `flatLines` / `startedAtMs` snapshot, not per row | `resolvedRunStartMs` useMemo |
| Absolute expand (65 kinds) | Memoize by `option.measurements` (or pre-expand at hydrate) | `DepositOptionCard.tsx` |
| QuantumOrb particles | Skip draw when tab hidden; honor reduced motion | `ParticleLayer.tsx` |
| Marketing continuous paint | Mouse glow rAF-throttled; **cache shell geometry** (no per-move layout); **rAF-coalesce scroll/resize geometry**; skip mouse style when tab hidden; **pause orbital/particle CSS** when tab hidden (`marketing-landing-shell--anims-paused`); **no `will-change:background`** on document-tall glow; ambient particles `motion-reduce` / laptop+ gated; measure bars CSS `marketing-bar-fill`. Active-tab appearance unchanged. | `MarketingLandingPage.tsx`, `marketing-landing-shell.css` |

Spec/parity: `BITCODE_SPEC_V48_NOTES.md` § Client pipeline + deposit review
performance law; parity matrix row **Client product surface performance**.

### Dynamic Import Prefetching

**Pattern**: Prefetch heavy components during idle time
```typescript
// Prefetch after initial render to not block
useEffect(() => {
 const timeout = setTimeout(() => {
 import('./HeavyComponent').catch(() => {});
 }, 1000); // Delay based on priority
 return () => clearTimeout(timeout);
}, []);
```

**Priority Hierarchy**:
1. Auxillary - 1s (most likely first interaction)
2. Conversation - 2s (second most common)
3. Sidebars - 3s (less immediate)

### CSS Performance Killers

**The Hidden Bottlenecks**:
- Multiple `@keyframes` animations running simultaneously
- Complex `calc()` in animations
- Unoptimized `box-shadow` with blur
- Missing `will-change` hints
- No CSS containment

**Solutions**:
```css
.heavy-component {
 /* Isolate rendering */
 contain: layout style paint;

 /* Hint browser for GPU */
 will-change: transform, opacity;
 transform: translateZ(0);

 /* Prevent reflow */
 backface-visibility: hidden;
}
```

### React Rendering Optimization

**Common Mistakes**:
- Synchronous operations in component mount
- Missing React.memo on heavy components
- useEffect running expensive operations immediately
- Creating new objects/arrays in render

**Solutions**:
```typescript
// Defer expensive operations
useEffect(() => {
 requestAnimationFrame(() => {
 // Heavy operation after paint
 });
}, []);

// Memoize heavy computations
const expensiveValue = useMemo(() => {
 return computeExpensive(deps);
}, [deps]);
```

### Network Optimization

**Warm Everything**:
```typescript
// Warm auth
createClient().auth.getUser().catch(() => {});

// Preconnect to API
fetch('/api/endpoint', { method: 'HEAD' }).catch(() => {});

// DNS prefetch for external resources
<link rel="dns-prefetch" href="https://api.example.com" />
```

## Performance Debugging Checklist

### When Components Are Slow to Open:

1. **Check for blocking operations**:
 - Search for synchronous `fetch` or heavy computations
 - Look for multiple `useState` updates causing re-renders
 - Check for animation cascade (multiple elements animating)

2. **Profile the render**:
 ```typescript
 useEffect(() => {
 performance.mark('component-start');
 return () => {
 performance.mark('component-end');
 performance.measure('component-render', 'component-start', 'component-end');
 console.log(performance.getEntriesByName('component-render'));
 };
 }, []);
 ```

3. **Check CSS performance**:
 - Open DevTools → Rendering → Paint flashing
 - Look for continuous repaints
 - Check for layout thrashing

4. **Bundle size impact**:
 ```bash
 # Check what's in the chunk
 npm run build
 npx source-map-explorer .next/static/chunks/*.js
 ```

## Critical Areas in Bitcode

### Auxillary Performance ⚡ SOLVED
**Problem**: Heavy animations + auth check + multiple child components + synchronous imports
**Final Solution Stack**:
- **React Query for caching** - Prefetch auth on page load, instant cached response
- **Portal pre-rendered hidden** - Always in DOM, just CSS class toggle (THE KEY!)
- **Component preloading** - Auxillary surface loaded before user clicks
- **useDeferredValue for animations** - Animations don't block urgent updates
- **Remove all inline styles** - Prevents synchronous recalculation
- **Auxillary rings imported directly** - Lightweight, needed immediately
- **FlipText stays dynamic** - Preserves UX while deferring framer-motion bundle
- **Dynamic imports for pane components** - LoginPane, ProfilePane, etc load async
- **Defer animations with `animation-play-state: paused`** until mount
- **Remove `will-change` until animations actually start**
- **Remove `backdrop-filter` until after mount** - expensive GPU operation
- **Use `contain: layout style paint`** for CSS isolation

**Result**: First click is now **instant** (<16ms) - as fast as React allows!

### Conversations Chat
**Problem**: Canvas animations + rich text editor + streaming
**Solution**:
- Use RAF for canvas updates
- Virtualize message list
- Debounce input handlers

### Pipeline Process Logs
**Problem**: Potentially hundreds of log lines
**Solution**:
- Virtualize with react-window
- Render only visible items
- Use CSS contain on each row

## Critical Blocking Operations (The Real Performance Killers)

### 1. Synchronous Heavy Imports
**Problem**: `import { AnimatePresence } from 'framer-motion'` loads 100KB+ synchronously
**Solution**: Dynamic import or remove entirely

### 2. Inline Styles on Mount
**Problem**: `style={{ position: 'fixed', inset: 0, display: 'flex' }}` forces style recalc
**Solution**: Use CSS classes instead

### 3. Creating New Clients/Instances
**Problem**: `createClient()` on every component mount
**Solution**: Global singleton pattern with caching

### 4. Portal Creation on State Change
**Problem**: `createPortal` requires re-render cycle
**Solution**: Pre-render hidden components, toggle with CSS

### 5. Expensive CSS Properties on Init
**Problem**: `backdrop-filter: blur(16px)` creates GPU layers immediately
**Solution**: Add expensive properties after mount

## Anti-Patterns to Avoid

1. **Never block the main thread**
 - No synchronous localStorage in render
 - No heavy computations without Web Workers
 - No blocking network requests

2. **Never animate expensive properties**
 - Avoid animating width/height (use transform: scale)
 - Avoid animating box-shadow (use opacity on a duplicate)
 - Avoid animating border-radius on large elements

3. **Never create unnecessary layers**
 - Don't use will-change on everything
 - Remove will-change after animation completes
 - Limit simultaneous GPU layers

## React Query Integration for Performance

### Setup
1. **QueryClient Configuration**
 - 5 minute stale time (data considered fresh)
 - 10 minute cache time (data kept in memory)
 - Refetch on window focus enabled
 - Single retry on failure

2. **Prefetching Strategy**
 - Auth data prefetched on page load via `useLayoutEffect`
 - Happens in microtask to not block render
 - Profile & onboarding data fetched in parallel if user exists
 - Silent failure handling - queries fetch on demand if prefetch fails

3. **Cache Management**
 - Auth state changes invalidate dependent queries
 - Sign out clears all auth queries
 - Mutations optimistically update cache

### Common Pitfalls to Avoid
1. **Creating new QueryClient instances** - Use the singleton from context
2. **Conditional hooks** - All hooks must be called unconditionally
3. **Missing error boundaries** - Wrap providers with error boundaries
4. **Not prefetching** - Always prefetch predictable user actions

## Performance Budget

**Target Metrics**:
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Component open time: ✅ **<16ms ACHIEVED!** (was 450ms)
- Animation FPS: 60fps constant

**Orbital Performance Timeline**:
- **Before optimization**: 450-550ms to open
- **After React Query**: ~100ms (auth cached)
- **After portal pre-render**: **<16ms** 🚀

**Measurement**:
```typescript
// Add to components for monitoring
if (process.env.NODE_ENV === 'development') {
 console.time('ComponentRender');
 // ... component logic
 console.timeEnd('ComponentRender');
}
```

## Remember

Performance is not about making everything fast - it's about making the right things fast at the right time. Prioritize user-perceived performance over synthetic benchmarks.

**The Golden Rule**: If the user doesn't notice it's slow, it's not slow.
