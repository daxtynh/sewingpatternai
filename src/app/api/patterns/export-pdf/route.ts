import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  svg: z.string(),
  pageSize: z.enum(['A4', 'Letter', 'A0']).default('A4'),
  tiled: z.boolean().default(false),
  includeInstructions: z.boolean().default(false),
  instructions: z.string().optional(),
});

// Page sizes in points (72 points per inch)
const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
  A0: { width: 2383.94, height: 3370.39 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    const pageSize = PAGE_SIZES[validatedData.pageSize];

    // Create a simple PDF with embedded SVG
    // For a production app, we'd use a proper PDF library like PDFKit or Puppeteer
    // This creates a basic PDF structure with the SVG content

    const margin = 36; // 0.5 inch margin
    const contentWidth = pageSize.width - margin * 2;
    const contentHeight = pageSize.height - margin * 2;

    // Create PDF content
    const pdfContent = createPDF(validatedData.svg, {
      width: pageSize.width,
      height: pageSize.height,
      margin,
      title: 'Sewing Pattern',
      instructions: validatedData.includeInstructions ? validatedData.instructions : undefined,
    });

    return new NextResponse(new Uint8Array(pdfContent), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="pattern.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function createPDF(
  svg: string,
  options: {
    width: number;
    height: number;
    margin: number;
    title: string;
    instructions?: string;
  }
): Buffer {
  // This is a simplified PDF generator
  // For production, use PDFKit or similar library

  const contentWidth = options.width - options.margin * 2;
  const contentHeight = options.height - options.margin * 2;

  // Escape special characters in SVG for PDF
  const escapedSvg = svg
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

  // Build PDF content
  const objects: string[] = [];
  let objectCount = 0;

  const addObject = (content: string): number => {
    objects.push(content);
    return ++objectCount;
  };

  // Catalog
  const catalogId = addObject(`<< /Type /Catalog /Pages 2 0 R >>`);

  // Pages
  const pagesId = addObject(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);

  // Page content stream
  const contentStream = `
    BT
    /F1 24 Tf
    ${options.margin} ${options.height - options.margin - 24} Td
    (${options.title}) Tj
    ET
  `;

  const streamLength = contentStream.length;
  const streamId = addObject(
    `<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream`
  );

  // Font
  const fontId = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);

  // Page
  const pageId = addObject(`
    << /Type /Page
       /Parent 2 0 R
       /MediaBox [0 0 ${options.width} ${options.height}]
       /Contents ${streamId} 0 R
       /Resources << /Font << /F1 ${fontId} 0 R >> >>
    >>
  `);

  // Build final PDF
  const header = '%PDF-1.4\n';
  const xrefOffset = header.length;

  let body = '';
  const xref: number[] = [];

  objects.forEach((obj, index) => {
    xref.push(body.length + xrefOffset);
    body += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefSection = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n${xref
    .map((offset) => offset.toString().padStart(10, '0') + ' 00000 n ')
    .join('\n')}\n`;

  const trailer = `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${header.length + body.length}\n%%EOF`;

  const pdfString = header + body + xrefSection + trailer;

  return Buffer.from(pdfString, 'utf-8');
}
