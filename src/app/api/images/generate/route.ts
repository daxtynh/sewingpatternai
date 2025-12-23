import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateGarmentImage } from '@/services/ai';

const requestSchema = z.object({
  prompt: z.string().min(5).max(500),
  style: z.enum(['realistic', 'sketch', 'technical']).default('realistic'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Enhance prompt based on style
    let enhancedPrompt = validatedData.prompt;
    switch (validatedData.style) {
      case 'sketch':
        enhancedPrompt = `Fashion sketch illustration: ${validatedData.prompt}. Hand-drawn style, pencil sketch look, fashion croquis proportions.`;
        break;
      case 'technical':
        enhancedPrompt = `Technical flat sketch: ${validatedData.prompt}. Flat lay technical drawing, showing construction details, seams, and closures clearly. Black and white.`;
        break;
      case 'realistic':
      default:
        enhancedPrompt = validatedData.prompt;
        break;
    }

    const imageUrl = await generateGarmentImage(enhancedPrompt);

    return NextResponse.json({
      imageUrl,
      imageId: crypto.randomUUID(),
    });
  } catch (error) {
    console.error('Image generation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}
