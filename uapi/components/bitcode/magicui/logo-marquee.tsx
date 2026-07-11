import { cn } from '@bitcode/styling';

/**
 * A lightweight marquee purpose-built for simple, uniform logo rows.
 *
 * It purposely avoids the padding / gap / duplicate heavy implementation
 * used by the generic `Marquee` component so that the logo carousel can run
 * independently without interfering with – or being affected by – other
 * marquees on the page (e.g. the testimonials marquee).
 *
 *  – Uses its own CSS custom properties ( `--logo-marquee-*` ) so variables
 *    are scoped per-instance and never clash with the generic marquee.
 *  – Employs a custom keyframe + utility class ( `animate-logo-marquee` ) so
 *    Tailwind can tree-shake unused styles and there is zero runtime style
 *    overlap with the testimonials marquee.
 */

interface LogoMarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  repeat?: number;
  children?: React.ReactNode;
}

export default function LogoMarquee({
  className,
  reverse,
  pauseOnHover = false,
  repeat = 2,
  children,
  ...props
}: LogoMarqueeProps) {
  return (
    <div
      {...props}
      /*
       * The container sets custom properties that are consumed by the inner
       * flex row which actually animates.  Because the properties are declared
       * directly on this element they are scoped per carousel instance – no
       * bleeding across components.
       */
      className={cn(
        "group flex overflow-hidden [--logo-marquee-duration:32s] [--logo-marquee-gap:2.5rem]",
        className,
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 items-center justify-around [gap:var(--logo-marquee-gap)] animate-logo-marquee",
            {
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            },
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
