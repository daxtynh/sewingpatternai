'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Scissors, ArrowLeft, Upload, Wand2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ImageUploader } from '@/components/pattern/ImageUploader';
import { DescriptionForm } from '@/components/pattern/DescriptionForm';
import { MeasurementForm } from '@/components/forms/MeasurementForm';
import { GenerationProgress } from '@/components/pattern/GenerationProgress';
import { PatternPreview } from '@/components/pattern/PatternPreview';
import { usePatternStore } from '@/store/usePatternStore';
import { downloadSVG } from '@/services/export';
import { cn } from '@/lib/utils';
import type { Measurements, PatternOutput } from '@/types';

type Step = 'input' | 'describe' | 'measurements' | 'generating' | 'preview';

export default function CreatePage() {
  const [step, setStep] = useState<Step>('input');
  const [inputMethod, setInputMethod] = useState<'upload' | 'generate' | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');

  const {
    uploadedImage,
    description,
    fabricType,
    seamAllowance,
    currentPattern,
    setDescription,
    setFabricType,
    setSeamAllowance,
    setCurrentPattern,
  } = usePatternStore();

  const [measurements, setMeasurements] = useState<Measurements | null>(null);

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;

    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, style: 'realistic' }),
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      setGeneratedImageUrl(data.imageUrl);
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDescriptionSubmit = (data: {
    description: string;
    fabricType: 'woven' | 'knit' | 'stretch-woven';
    seamAllowance: number;
  }) => {
    setDescription(data.description);
    setFabricType(data.fabricType);
    setSeamAllowance(data.seamAllowance);
    setStep('measurements');
  };

  const handleMeasurementsSubmit = async (meas: Measurements) => {
    setMeasurements(meas);
    setStep('generating');

    // Start pattern generation
    setCurrentPattern({
      id: crypto.randomUUID(),
      status: 'analyzing',
      message: 'Analyzing your garment...',
    });

    try {
      const imageData = uploadedImage || generatedImageUrl;

      const response = await fetch('/api/patterns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedImage,
          imageUrl: generatedImageUrl,
          description,
          measurements: meas,
          fabricType,
          seamAllowance,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setCurrentPattern({
          id: crypto.randomUUID(),
          status: 'failed',
          error: error.error || 'Failed to generate pattern',
        });
        return;
      }

      const result: PatternOutput = await response.json();
      setCurrentPattern(result);

      if (result.status === 'completed') {
        setStep('preview');
      }
    } catch (error) {
      setCurrentPattern({
        id: crypto.randomUUID(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  const handleDownloadSVG = () => {
    if (currentPattern?.svg) {
      downloadSVG(currentPattern.svg, 'sewing-pattern.svg');
    }
  };

  const handleDownloadPDF = async () => {
    // For now, just download SVG - PDF generation can be added later
    handleDownloadSVG();
  };

  const handleStartOver = () => {
    setStep('input');
    setInputMethod(null);
    setGeneratedImageUrl(null);
    setImagePrompt('');
    setCurrentPattern(null);
    setMeasurements(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-indigo-600" />
              <span className="text-lg font-bold text-gray-900">Sewing Pattern AI</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleStartOver}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {['Input', 'Details', 'Measurements', 'Generate'].map((label, index) => {
              const stepMap: Step[] = ['input', 'describe', 'measurements', 'generating'];
              const isActive = stepMap.indexOf(step) >= index || step === 'preview';
              const isCurrent = stepMap[index] === step || (step === 'preview' && index === 3);

              return (
                <div key={label} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isActive
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={cn(
                      'ml-2 text-sm font-medium hidden sm:block',
                      isCurrent ? 'text-indigo-600' : isActive ? 'text-gray-700' : 'text-gray-400'
                    )}
                  >
                    {label}
                  </span>
                  {index < 3 && (
                    <ChevronRight className="w-5 h-5 text-gray-300 mx-2 sm:mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Input Method Selection */}
        {step === 'input' && !inputMethod && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Create Your Pattern</h1>
              <p className="text-gray-600 mt-2">
                Choose how you want to start your pattern
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setInputMethod('upload')}
                className="group p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-500 transition-colors text-left"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Image</h3>
                <p className="text-gray-600">
                  Upload a photo of a garment you love and we'll create a pattern based on it.
                </p>
              </button>

              <button
                onClick={() => setInputMethod('generate')}
                className="group p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-500 transition-colors text-left"
              >
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Wand2 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate with AI</h3>
                <p className="text-gray-600">
                  Describe your dream garment and AI will generate an image for your pattern.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Upload Image */}
        {step === 'input' && inputMethod === 'upload' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Upload Your Image</h1>
              <p className="text-gray-600 mt-2">
                Upload a clear photo of the garment you want to recreate
              </p>
            </div>

            <ImageUploader />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setInputMethod(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setStep('describe')}
                disabled={!uploadedImage}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Generate Image */}
        {step === 'input' && inputMethod === 'generate' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Describe Your Design</h1>
              <p className="text-gray-600 mt-2">
                Tell us about the garment you want to create
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Prompt
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={4}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Example: A flowy bohemian maxi dress with bell sleeves, V-neckline, and a wrap waist. Made from lightweight cotton in a sage green color."
                  />
                </div>

                <Button
                  onClick={handleGenerateImage}
                  isLoading={isGeneratingImage}
                  disabled={!imagePrompt}
                  className="w-full"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Image
                </Button>

                {generatedImageUrl && (
                  <div className="mt-4">
                    <img
                      src={generatedImageUrl}
                      alt="Generated garment"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setInputMethod(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setStep('describe')}
                disabled={!generatedImageUrl}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {step === 'describe' && (
          <DescriptionForm
            onSubmit={handleDescriptionSubmit}
            onBack={() => setStep('input')}
          />
        )}

        {/* Step 3: Measurements */}
        {step === 'measurements' && (
          <MeasurementForm
            onSubmit={handleMeasurementsSubmit}
            onCancel={() => setStep('describe')}
          />
        )}

        {/* Step 4: Generating */}
        {step === 'generating' && currentPattern && (
          <GenerationProgress pattern={currentPattern} />
        )}

        {/* Step 5: Preview */}
        {step === 'preview' && currentPattern?.svg && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Your Pattern is Ready!</h1>
              <p className="text-gray-600 mt-2">
                Preview your pattern below and download when ready
              </p>
            </div>

            <div className="h-[600px]">
              <PatternPreview
                svg={currentPattern.svg}
                patternName="Custom Pattern"
                onDownloadSVG={handleDownloadSVG}
                onDownloadPDF={handleDownloadPDF}
              />
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleStartOver}>
                Create Another Pattern
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
