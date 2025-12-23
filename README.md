# Sewing Pattern AI

An AI-powered sewing pattern generator that creates custom, production-ready sewing patterns from images or descriptions.

## Features

- **AI-Powered Analysis**: Upload any garment image and the AI analyzes style, construction, and fit details
- **Custom Pattern Generation**: Get production-ready sewing patterns sized to your exact measurements
- **Image Generation**: Describe your dream garment and AI generates a visualization
- **Pattern Export**: Download patterns as SVG or PDF with seam allowances, grain lines, and notches

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript, Tailwind CSS
- **AI**: Claude API (Anthropic) for pattern generation, OpenAI DALL-E for image generation
- **Pattern Engine**: FreeSewing for pattern compilation
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key (for Claude)
- OpenAI API key (for DALL-E image generation)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sewingpatternai.git
cd sewingpatternai
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
  app/                    # Next.js app router
    api/                  # API routes
      patterns/           # Pattern generation endpoints
      images/             # Image generation endpoints
    create/               # Pattern creation page
  components/
    forms/                # Form components
    pattern/              # Pattern-specific components
    ui/                   # Reusable UI components
  services/               # Business logic
    ai.ts                 # AI integration
    pattern-compiler.ts   # Pattern compilation
    export.ts             # Export utilities
  store/                  # Zustand stores
  types/                  # TypeScript types
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude |
| `OPENAI_API_KEY` | Your OpenAI API key for DALL-E |
| `NEXT_PUBLIC_APP_URL` | Your app's URL (optional) |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:

```bash
npm run build
npm start
```

## How It Works

1. **Upload or Generate**: User uploads a garment image or describes their design
2. **AI Analysis**: Claude analyzes the image to identify garment type, silhouette, construction details
3. **Measurements**: User enters their body measurements
4. **Pattern Generation**: AI generates FreeSewing pattern code based on analysis and measurements
5. **Compilation**: Pattern code is compiled to SVG
6. **Export**: User downloads the pattern as SVG or PDF

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [FreeSewing](https://freesewing.org/) for the pattern engine
- [Anthropic](https://anthropic.com/) for Claude AI
- [OpenAI](https://openai.com/) for DALL-E
