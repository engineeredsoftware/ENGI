import { cn } from '@bitcode/styling';

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  [key: string]: any;
}

export default function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        // The container defines *testimonial/review* carousel specific CSS
        // custom properties – all prefixed with `--review-marquee-*` so that
        // timing / spacing values never bleed into other components (e.g. the
        // logo marquee).  Child rows then consume the variables.
        "group flex overflow-hidden p-2 [--review-marquee-duration:40s] [--review-marquee-gap:1rem] [gap:var(--review-marquee-gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
      style={{ contain: 'paint' }}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 [gap:var(--review-marquee-gap)]", {
              "animate-review-marquee flex-row": !vertical,
              "animate-review-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
