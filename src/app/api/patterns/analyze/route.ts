import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeGarmentImage } from '@/services/ai';

const requestSchema = z.object({
  imageBase64: z.string().optional(),
  imageUrl: z.string().url().optional(),
  description: z.string().default(''),
}).refine(data => data.imageBase64 || data.imageUrl, {
  message: 'Either imageBase64 or imageUrl must be provided',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Get the image as base64
    let imageBase64 = validatedData.imageBase64;
    if (!imageBase64 && validatedData.imageUrl) {
      const response = await fetch(validatedData.imageUrl);
      const buffer = await response.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString('base64');
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Failed to process image' },
        { status: 400 }
      );
    }

    const analysis = await analyzeGarmentImage(imageBase64, validatedData.description);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
