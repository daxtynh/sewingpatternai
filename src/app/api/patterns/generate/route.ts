import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeGarmentImage, generatePatternCode, fixPatternCode } from '@/services/ai';
import { compilePattern, validatePatternCode, generateTestPattern } from '@/services/pattern-compiler';
import type { PatternRequest, PatternOutput, Measurements } from '@/types';

const measurementSchema = z.object({
  bust: z.number().min(50).max(200),
  waist: z.number().min(40).max(180),
  hips: z.number().min(50).max(200),
  shoulderWidth: z.number().min(30).max(60),
  armLength: z.number().min(40).max(80),
  inseam: z.number().min(50).max(100),
  torsoLength: z.number().min(30).max(60),
  highBust: z.number().optional(),
  underbust: z.number().optional(),
  neck: z.number().optional(),
  upperArm: z.number().optional(),
  wrist: z.number().optional(),
  thigh: z.number().optional(),
  knee: z.number().optional(),
  calf: z.number().optional(),
  ankle: z.number().optional(),
});

const requestSchema = z.object({
  imageBase64: z.string().optional(),
  imageUrl: z.string().url().optional(),
  description: z.string().min(10).max(1000),
  measurements: measurementSchema,
  fabricType: z.enum(['woven', 'knit', 'stretch-woven']).default('woven'),
  seamAllowance: z.number().min(0.5).max(3).default(1.5),
  includeInstructions: z.boolean().default(false),
}).refine(data => data.imageBase64 || data.imageUrl, {
  message: 'Either imageBase64 or imageUrl must be provided',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    const patternId = crypto.randomUUID();

    // If no image is provided, return a test pattern
    if (!validatedData.imageBase64 && !validatedData.imageUrl) {
      const testSvg = generateTestPattern(validatedData.measurements);
      return NextResponse.json({
        id: patternId,
        status: 'completed',
        svg: testSvg,
        message: 'Test pattern generated',
      } as PatternOutput);
    }

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

    // Step 1: Analyze the garment image
    const analysis = await analyzeGarmentImage(imageBase64, validatedData.description);

    // Step 2: Generate pattern code
    let patternCode = await generatePatternCode(
      analysis,
      validatedData.measurements,
      validatedData.fabricType,
      validatedData.seamAllowance
    );

    // Step 3: Validate the code
    const validation = validatePatternCode(patternCode);
    if (!validation.valid) {
      // Try to fix the code
      patternCode = await fixPatternCode(patternCode, validation.error || 'Invalid code');
    }

    // Step 4: Compile the pattern
    let compilationResult = await compilePattern(patternCode, validatedData.measurements);
    let attempts = 0;
    const maxAttempts = 3;

    while (!compilationResult.success && attempts < maxAttempts) {
      attempts++;
      patternCode = await fixPatternCode(patternCode, compilationResult.error || 'Compilation failed');
      compilationResult = await compilePattern(patternCode, validatedData.measurements);
    }

    if (!compilationResult.success) {
      // Fallback to a simple test pattern
      const testSvg = generateTestPattern(validatedData.measurements);
      return NextResponse.json({
        id: patternId,
        status: 'completed',
        analysis,
        code: patternCode,
        svg: testSvg,
        message: 'Using simplified pattern due to compilation issues. AI-generated code available for review.',
        error: compilationResult.error,
      } as PatternOutput);
    }

    return NextResponse.json({
      id: patternId,
      status: 'completed',
      analysis,
      code: patternCode,
      svg: compilationResult.svg,
      message: 'Pattern generated successfully',
    } as PatternOutput);
  } catch (error) {
    console.error('Pattern generation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate pattern' },
      { status: 500 }
    );
  }
}
