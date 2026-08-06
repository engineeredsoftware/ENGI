/**
 * Injects CSS to hide all page content except the overlay on the login callback route.
 * Runs at the head of the document for immediate effect during SSR and streaming.
 */
export default function Head() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      *:not(.callback-overlay):not(.callback-overlay *) {
        visibility: hidden !important;
      }
      html, body { overflow: hidden !important; }
    ` }} />
  );
}