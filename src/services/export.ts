// Export utilities for patterns

export function downloadSVG(svg: string, filename: string = 'pattern.svg'): void {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadPDF(
  svg: string,
  filename: string = 'pattern.pdf',
  options: {
    pageSize?: 'A4' | 'Letter' | 'A0';
    tiled?: boolean;
    includeInstructions?: boolean;
    instructions?: string;
  } = {}
): Promise<void> {
  // For PDF generation, we'll use a server-side API
  const response = await fetch('/api/patterns/export-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      svg,
      pageSize: options.pageSize || 'A4',
      tiled: options.tiled || false,
      includeInstructions: options.includeInstructions || false,
      instructions: options.instructions,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate PDF');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Convert SVG to Data URL for inline display
export function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}

// Parse SVG dimensions
export function getSVGDimensions(svg: string): { width: number; height: number } | null {
  const widthMatch = svg.match(/width="([^"]+)"/);
  const heightMatch = svg.match(/height="([^"]+)"/);

  if (!widthMatch || !heightMatch) {
    return null;
  }

  const parseValue = (str: string): number => {
    const num = parseFloat(str);
    if (str.includes('mm')) return num;
    if (str.includes('cm')) return num * 10;
    if (str.includes('in')) return num * 25.4;
    return num;
  };

  return {
    width: parseValue(widthMatch[1]),
    height: parseValue(heightMatch[1]),
  };
}

// Calculate print pages needed for tiled printing
export function calculateTiledPages(
  svgWidth: number,
  svgHeight: number,
  pageSize: 'A4' | 'Letter' | 'A0'
): { rows: number; cols: number; totalPages: number } {
  const pageSizes = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 },
    A0: { width: 841, height: 1189 },
  };

  const page = pageSizes[pageSize];
  const margin = 10; // 10mm margin on each side
  const printableWidth = page.width - margin * 2;
  const printableHeight = page.height - margin * 2;
  const overlap = 10; // 10mm overlap for taping

  const cols = Math.ceil((svgWidth - overlap) / (printableWidth - overlap));
  const rows = Math.ceil((svgHeight - overlap) / (printableHeight - overlap));

  return {
    rows,
    cols,
    totalPages: rows * cols,
  };
}
