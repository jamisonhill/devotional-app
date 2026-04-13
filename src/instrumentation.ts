// Runs before Next.js loads any route modules.
// pdfjs-dist (used by pdf-parse) requires browser canvas APIs (DOMMatrix,
// Path2D, ImageData) at module evaluation time. We stub them here since
// we only need text extraction, not canvas rendering.
export async function register() {
  const g = globalThis as Record<string, unknown>;
  if (!g.DOMMatrix) {
    g.DOMMatrix = class DOMMatrix { constructor() {} };
  }
  if (!g.Path2D) {
    g.Path2D = class Path2D { constructor() {} };
  }
  if (!g.ImageData) {
    g.ImageData = class ImageData { constructor() {} };
  }
}
