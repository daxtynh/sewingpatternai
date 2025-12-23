import type { Measurements } from '@/types';

// Since we can't use VM2 in browser/edge environments, we'll use a different approach
// This is a simplified compiler that wraps the FreeSewing pattern execution

interface CompilationResult {
  success: boolean;
  svg?: string;
  pieces?: string[];
  error?: string;
}

// FreeSewing core types (simplified)
interface PatternPart {
  name: string;
}

interface PatternConfig {
  name: string;
  parts: PatternPart[];
  measurements: string[];
  options?: Record<string, unknown>;
}

// This function will be called server-side where we have access to @freesewing/core
export async function compilePattern(
  code: string,
  measurements: Measurements
): Promise<CompilationResult> {
  try {
    // For server-side execution, we need to use a more secure approach
    // In production, this would use a sandboxed environment

    // Convert measurements from cm to mm (FreeSewing uses mm)
    const measurementsInMm: Record<string, number> = {};
    for (const [key, value] of Object.entries(measurements)) {
      if (typeof value === 'number') {
        measurementsInMm[key] = value * 10;
      }
    }

    // Dynamic import of FreeSewing core
    const freesewing = await import('@freesewing/core');

    // Create a safe execution context
    const safeExecute = new Function(
      'freesewing',
      'measurements',
      `
      const { Design, Point, Path, Snippet } = freesewing;

      ${code}

      // The code should export a design
      if (typeof design !== 'undefined') {
        return design;
      }
      throw new Error('Pattern code must define a "design" variable');
      `
    );

    const design = safeExecute(freesewing, measurementsInMm);

    // Create pattern instance with measurements
    const pattern = new design({ measurements: measurementsInMm });

    // Draft and render the pattern
    pattern.draft();
    const svg = pattern.render();

    // Extract piece names
    const pieces = Object.keys(pattern.parts || {});

    return {
      success: true,
      svg,
      pieces,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown compilation error',
    };
  }
}

// Validate pattern code syntax before execution
export function validatePatternCode(code: string): { valid: boolean; error?: string } {
  try {
    // Check for required elements
    if (!code.includes('Design') && !code.includes('design')) {
      return { valid: false, error: 'Pattern must include a Design definition' };
    }

    if (!code.includes('Point') || !code.includes('Path')) {
      return { valid: false, error: 'Pattern must use Point and Path for geometry' };
    }

    // Try to parse as JavaScript
    new Function(code);

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JavaScript syntax',
    };
  }
}

// Simple SVG generation for testing/fallback
export function generateSimpleSVG(width: number, height: number, content: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}mm"
     height="${height}mm"
     viewBox="0 0 ${width} ${height}">
  <style>
    .fabric { stroke: #212121; stroke-width: 0.5; fill: none; }
    .lining { stroke: #666; stroke-width: 0.3; fill: none; stroke-dasharray: 4 2; }
    .help { stroke: #aaa; stroke-width: 0.2; fill: none; }
    .note { font-family: sans-serif; font-size: 4; }
    text { font-family: sans-serif; }
  </style>
  ${content}
</svg>`;
}

// Generate a basic bodice pattern for testing
export function generateTestPattern(measurements: Measurements): string {
  const bust = measurements.bust * 10; // Convert to mm
  const waist = measurements.waist * 10;
  const shoulderWidth = measurements.shoulderWidth * 10;
  const torsoLength = measurements.torsoLength * 10;

  const frontWidth = bust / 4 + 10; // Quarter bust + ease
  const backWidth = bust / 4 + 10;

  const svgContent = `
    <!-- Front Bodice -->
    <g transform="translate(20, 20)">
      <path class="fabric" d="
        M 0 0
        L ${frontWidth} 0
        L ${frontWidth} ${torsoLength}
        L 0 ${torsoLength}
        Z
      "/>
      <text x="${frontWidth / 2}" y="${torsoLength / 2}" class="note" text-anchor="middle">FRONT</text>
      <text x="${frontWidth / 2}" y="${torsoLength / 2 + 10}" class="note" text-anchor="middle">Cut 1</text>
      <!-- Grain line -->
      <line x1="${frontWidth / 2}" y1="20" x2="${frontWidth / 2}" y2="${torsoLength - 20}" class="help"/>
      <polygon points="${frontWidth / 2 - 3},25 ${frontWidth / 2},15 ${frontWidth / 2 + 3},25" class="help"/>
    </g>

    <!-- Back Bodice -->
    <g transform="translate(${frontWidth + 40}, 20)">
      <path class="fabric" d="
        M 0 0
        L ${backWidth} 0
        L ${backWidth} ${torsoLength}
        L 0 ${torsoLength}
        Z
      "/>
      <text x="${backWidth / 2}" y="${torsoLength / 2}" class="note" text-anchor="middle">BACK</text>
      <text x="${backWidth / 2}" y="${torsoLength / 2 + 10}" class="note" text-anchor="middle">Cut 1</text>
      <!-- Grain line -->
      <line x1="${backWidth / 2}" y1="20" x2="${backWidth / 2}" y2="${torsoLength - 20}" class="help"/>
      <polygon points="${backWidth / 2 - 3},25 ${backWidth / 2},15 ${backWidth / 2 + 3},25" class="help"/>
    </g>
  `;

  return generateSimpleSVG(
    frontWidth + backWidth + 80,
    torsoLength + 40,
    svgContent
  );
}
