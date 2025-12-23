'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Scissors, Sparkles, Ruler, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Upload any garment image and our AI analyzes the style, construction, and fit details.',
  },
  {
    icon: Scissors,
    title: 'Custom Pattern Generation',
    description: 'Get production-ready sewing patterns generated specifically for your measurements.',
  },
  {
    icon: Ruler,
    title: 'Perfect Fit',
    description: 'Patterns are created using your exact body measurements for a perfect custom fit.',
  },
  {
    icon: Download,
    title: 'Ready to Sew',
    description: 'Download SVG or PDF patterns with seam allowances, grain lines, and instructions.',
  },
];

const steps = [
  { step: 1, title: 'Upload or Generate', description: 'Upload a photo of a garment you love or describe your dream design' },
  { step: 2, title: 'Enter Measurements', description: 'Add your body measurements for a custom-fitted pattern' },
  { step: 3, title: 'AI Creates Pattern', description: 'Our AI analyzes the design and generates your pattern' },
  { step: 4, title: 'Download & Sew', description: 'Get your pattern as SVG or PDF and start sewing!' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Scissors className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Sewing Pattern AI</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/create" className="text-gray-600 hover:text-gray-900">
                Create Pattern
              </Link>
              <Button variant="primary" size="sm" asChild>
                <Link href="/create">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
            Turn Any Image Into a<br />
            <span className="text-indigo-600">Custom Sewing Pattern</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Powered by AI, our pattern generator creates production-ready sewing patterns
            from photos or descriptions, perfectly sized to your measurements.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/create" className="gap-2">
                Create Your Pattern
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Create Custom Patterns
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-indigo-200" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4 relative z-10">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Create Your First Pattern?
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            Upload an image or describe your dream garment, and let AI do the rest.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-indigo-600 hover:bg-gray-100"
            asChild
          >
            <Link href="/create" className="gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Scissors className="w-6 h-6 text-indigo-400" />
              <span className="text-lg font-bold text-white">Sewing Pattern AI</span>
            </div>
            <p className="text-gray-400 text-sm">
              Powered by Claude AI and FreeSewing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
