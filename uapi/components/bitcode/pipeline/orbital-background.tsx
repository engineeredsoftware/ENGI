import { motion } from 'framer-motion';

interface OrbitalBackgroundProps {
  isProcessing: boolean;
}

/*
  The orbital background is rendered twice –
  1.  A rich three-ring version for >= md break-point (desktop / tablet).
  2.  A lightweight, mobile-optimised variant for < md.

  Tailwind `hidden laptop:block` / `laptop:hidden` classes selectively mount each tree
  so no runtime window-size logic is required (works flawlessly with SSR).
*/

export const OrbitalBackground = ({ isProcessing }: OrbitalBackgroundProps) => {
  /* ---------------------------------------------------------------------- */
  /*  Desktop / tablet version                                              */
  /* ---------------------------------------------------------------------- */
  const desktopRings = [0, 1, 2];

  /* ---------------------------------------------------------------------- */
  /*  Mobile variant: single ring + subtle glow                             */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      {/* Desktop / tablet */}
      <div className="absolute -top-20 left-0 right-0 overflow-hidden h-[1000px] w-full -z-10 opacity-50 pointer-events-none mx-auto hidden laptop:block">
        {desktopRings.map((i) => (
          <div
            key={i}
            className={`absolute left-1/2 top-1/2 orbital-ring execution-postprocess-shippable-ring ${isProcessing ? 'orbital-ring-activated' : ''}`}
            style={{
              width: `${600 + i * 100}px`,
              height: `${600 + i * 100}px`,
              marginLeft: `${-(600 + i * 100) / 2}px`,
              marginTop: `${-(600 + i * 100) / 2}px`,
              border: '1px solid rgba(103, 254, 183, 0.1)',
              borderRadius: '50%',
              animation: `spin-${i} ${15 + i * 5}s linear infinite`,
              // Custom CSS vars used by existing keyframes
              '--ring-index': i,
              '--ring-delay': `${i * 0.2}s`,
            } as React.CSSProperties}
          >
            {/* Energy points */}
            {[...Array(12)].map((_, j) => (
              <div
                key={j}
                className={`absolute w-1 h-1 bg-emerald-400/30 rounded-full quantum-point ${isProcessing ? 'quantum-point-activated' : ''}`}
                style={{
                  transform: `rotate(${j * 30}deg) translateX(${300 + i * 50}px)`,
                  '--point-index': j,
                  '--point-delay': `${j * 0.05}s`,
                } as React.CSSProperties}
              />
            ))}

            {/* Ripple */}
            <div
              className={`absolute inset-0 rounded-full energy-wave ${isProcessing ? 'energy-wave-activated' : ''}`}
              style={{ '--wave-delay': `${i * 0.3}s` } as React.CSSProperties}
            />
          </div>
        ))}

        {/* Shockwave */}
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none activation-shockwave ${isProcessing ? 'activation-shockwave-triggered' : ''}`} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-emerald-400/90"
            initial={{ scale: 0 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              y: [-2, 2, -2],
            }}
            transition={{ duration: 3, delay: i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              left: `${30 + i * 15}%`,
              top: `${20 + (i % 3) * 15}%`,
              filter: 'blur(1px)',
              boxShadow: '0 0 20px rgba(103, 254, 183, 0.3)',
            }}
          />
        ))}
      </div>

      {/* Mobile – lighter & faster */}
      <div className="absolute inset-0 -z-10 pointer-events-none laptop:hidden flex items-center justify-center">
        {/* Glowing radial background */}
        <div className="absolute inset-0 bg-gradient-radial from-emerald-500/15 via-transparent to-transparent opacity-40" />

        {/* Single animated ring */}
        <motion.div
          className={`relative border border-emerald-400/20 rounded-full`}
          initial={false}
          animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ width: 320, height: 320 }}
        >
          {/* Four energy points */}
          {[...Array(4)].map((_, idx) => (
            <motion.span
              key={idx}
              className="absolute w-1.5 h-1.5 bg-emerald-400/70 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: 'center',
                transform: `rotate(${idx * 90}deg) translateX(160px)`,
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.5, delay: idx * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </div>
    </>
  );
};
