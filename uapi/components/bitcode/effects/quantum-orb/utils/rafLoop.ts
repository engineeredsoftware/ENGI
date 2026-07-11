// Small helper to manage requestAnimationFrame loops in the Quantum Orb
// layers.  Ensures we always cancel the previous loop before starting a new
// one and returns a function to stop the loop – useful for React cleanup.

export type RAFHandleRef = { current: number } | React.MutableRefObject<number>;

export function startLoop(
  draw: () => void,
  ref: RAFHandleRef,
): () => void {
  cancelAnimationFrame(ref.current);

  const loop = () => {
    draw();
    ref.current = requestAnimationFrame(loop);
  };

  ref.current = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(ref.current);
}
