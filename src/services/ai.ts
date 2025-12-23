import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { Measurements, GarmentAnalysis, PatternRequest } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FREESEWING_KNOWLEDGE = `
FreeSewing Pattern Creation Guide:

1. Basic Structure:
A FreeSewing pattern consists of:
- Design object with name, parts array, measurements, and options
- Part objects with name and draft function
- Draft functions receive { points, paths, measurements, options, part } and return part

2. Key Concepts:
- Points: Define locations using new Point(x, y)
- Paths: Connect points using .move(), .line(), .curve(), .close()
- Measurements: User body measurements in millimeters
- Options: Configurable values like ease percentages

3. Example Pattern:
\`\`\`javascript
import { Design, Point, Path } from '@freesewing/core';

const front = {
  name: 'front',
  draft: ({ points, paths, measurements, options, part }) => {
    // Calculate with ease
    const bustWithEase = measurements.bust * (1 + options.ease);

    // Define points
    points.topLeft = new Point(0, 0);
    points.topRight = new Point(bustWithEase / 4, 0);
    points.bottomRight = new Point(bustWithEase / 4, measurements.waistToHip);
    points.bottomLeft = new Point(0, measurements.waistToHip);

    // Create seam path
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.topRight)
      .line(points.bottomRight)
      .line(points.bottomLeft)
      .close()
      .attr('class', 'fabric');

    return part;
  }
};

const myDesign = new Design({
  name: 'MyGarment',
  parts: [front],
  measurements: ['bust', 'waist', 'hips'],
  options: {
    ease: { pct: 8, min: 0, max: 20 }
  }
});
\`\`\`

4. Important Conventions:
- All measurements should be in mm (multiply cm by 10)
- Ease is typically a percentage (0.05 = 5%)
- Seam allowance is added separately via options
- Use curves for natural body shapes
- Add grain lines, notches, and labels
`;

const PATTERNMAKING_KNOWLEDGE = `
Patternmaking Fundamentals:

1. Ease Values by Garment Type:
- Fitted: 2-5% ease
- Semi-fitted: 5-10% ease
- Loose: 10-15% ease
- Oversized: 15-25% ease

2. Standard Seam Allowances:
- Regular seams: 1.5cm
- French seams: 1cm
- Hems: 2-5cm depending on style
- Armholes/necklines: 0.6-1cm

3. Pattern Pieces by Garment:
- Basic bodice: Front, Back, Sleeve (optional)
- Dress: Bodice front, Bodice back, Skirt front, Skirt back, Sleeves
- Pants: Front, Back, Waistband, Pocket (optional)
- Skirt: Front, Back, Waistband

4. Key Measurements:
- Bust: Fullest part of bust
- Waist: Natural waistline
- Hips: Fullest part of hips (usually 20cm below waist)
- Shoulder: Shoulder point to shoulder point
- Arm length: Shoulder to wrist

5. Dart Placement:
- Bust darts: Point toward apex, stop 2.5cm before
- Waist darts: Center on front/back panels
- Dart width: Typically 2-4cm

6. Grain Line:
- Usually parallel to center front/back
- For sleeves: parallel to center of sleeve
`;

export async function analyzeGarmentImage(
  imageBase64: string,
  description: string
): Promise<GarmentAnalysis> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
          {
            type: 'text',
            text: `Analyze this garment image for pattern creation.

User description: ${description}

Identify and output valid JSON (no markdown):
{
  "garmentType": "dress|top|bottom|outerwear|jumpsuit|other",
  "silhouette": "fitted|semi-fitted|loose|oversized",
  "length": "string describing length (e.g., 'knee', 'midi', 'cropped')",
  "sleeves": {
    "type": "none|cap|short|elbow|three-quarter|long",
    "fit": "fitted|loose|puff|bell"
  },
  "neckline": "string describing neckline",
  "closure": "string describing closure type",
  "seaming": ["array of seam types like 'princess', 'side', 'center-back'"],
  "details": ["array of details like 'pockets', 'pleats', 'gathers'"],
  "suggestedFabric": "woven|knit|stretch-woven",
  "estimatedEase": {
    "bust": 0.05-0.25,
    "waist": 0.05-0.25,
    "hip": 0.05-0.25
  }
}

Be precise and accurate. Only output the JSON, nothing else.`,
          },
        ],
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    return JSON.parse(content.text) as GarmentAnalysis;
  } catch {
    throw new Error('Failed to parse garment analysis: ' + content.text);
  }
}

export async function generatePatternCode(
  analysis: GarmentAnalysis,
  measurements: Measurements,
  fabricType: string,
  seamAllowance: number
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `You are an expert patternmaker. Generate FreeSewing pattern code for the following garment.

${FREESEWING_KNOWLEDGE}

${PATTERNMAKING_KNOWLEDGE}

GARMENT ANALYSIS:
${JSON.stringify(analysis, null, 2)}

USER MEASUREMENTS (in cm - convert to mm for FreeSewing):
${JSON.stringify(measurements, null, 2)}

FABRIC TYPE: ${fabricType}
SEAM ALLOWANCE: ${seamAllowance}cm

Generate complete, valid JavaScript code for a FreeSewing pattern.

Requirements:
1. Include ALL necessary pattern pieces
2. Use the actual measurements provided (convert cm to mm)
3. Apply appropriate ease based on the silhouette
4. Ensure connecting seam lengths match
5. Add seam allowance, grain lines, and notches
6. Export the design as the default export

Output ONLY the JavaScript code, no explanation. Start with imports and end with the export.
The code must be complete and executable.

IMPORTANT: Use only @freesewing/core imports. Available: Design, Point, Path, Snippet.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Extract code from response (might be wrapped in code blocks)
  let code = content.text;
  const codeBlockMatch = code.match(/```(?:javascript|js)?\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    code = codeBlockMatch[1];
  }

  return code.trim();
}

export async function fixPatternCode(
  code: string,
  error: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `The following FreeSewing pattern code has an error. Fix it.

CURRENT CODE:
\`\`\`javascript
${code}
\`\`\`

ERROR:
${error}

${FREESEWING_KNOWLEDGE}

Fix the code and output ONLY the corrected JavaScript code.
Do not include any explanation, just the code.
Make sure all imports are correct and the code is complete.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  let fixedCode = content.text;
  const codeBlockMatch = fixedCode.match(/```(?:javascript|js)?\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    fixedCode = codeBlockMatch[1];
  }

  return fixedCode.trim();
}

export async function generateGarmentImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `Fashion design illustration: ${prompt}. Clean, professional garment design visualization on a simple background. Focus on the garment construction details, seams, and silhouette. Technical fashion illustration style.`,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error('Failed to generate image');
  }

  return imageUrl;
}

export async function generateSewingInstructions(
  analysis: GarmentAnalysis,
  patternPieces: string[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `Generate clear sewing instructions for the following garment.

GARMENT ANALYSIS:
${JSON.stringify(analysis, null, 2)}

PATTERN PIECES:
${patternPieces.join(', ')}

Write step-by-step sewing instructions that are:
1. Clear and beginner-friendly
2. In logical construction order
3. Include tips for each step
4. Mention seam allowances and finishing techniques

Format as numbered steps with clear headings.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  return content.text;
}
