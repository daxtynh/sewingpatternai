'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, Sparkles, Scissors, FileText, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { PatternOutput } from '@/types';

interface GenerationProgressProps {
  pattern: PatternOutput;
}

const steps = [
  { status: 'analyzing', label: 'Analyzing garment', icon: Sparkles, description: 'Identifying garment type, silhouette, and construction details' },
  { status: 'coding', label: 'Generating pattern code', icon: FileText, description: 'Creating FreeSewing pattern with measurements' },
  { status: 'compiling', label: 'Compiling pattern', icon: Scissors, description: 'Building pattern pieces and verifying construction' },
  { status: 'completed', label: 'Pattern ready', icon: Download, description: 'Your pattern is ready to download' },
];

function getStepIndex(status: PatternOutput['status']): number {
  switch (status) {
    case 'pending':
    case 'generating':
    case 'analyzing':
      return 0;
    case 'coding':
      return 1;
    case 'compiling':
      return 2;
    case 'completed':
      return 3;
    case 'failed':
      return -1;
    default:
      return 0;
  }
}

export function GenerationProgress({ pattern }: GenerationProgressProps) {
  const currentStepIndex = getStepIndex(pattern.status);
  const isFailed = pattern.status === 'failed';

  return (
    <Card>
      <CardContent className="p-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900">
              {isFailed ? 'Generation Failed' : 'Creating Your Pattern'}
            </h2>
            {pattern.message && (
              <p className="text-sm text-gray-500 mt-2">{pattern.message}</p>
            )}
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const isFutureStep = index > currentStepIndex;

              return (
                <div
                  key={step.status}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg transition-colors',
                    isActive && !isFailed && 'bg-indigo-50',
                    isCompleted && 'bg-green-50',
                    isFailed && isActive && 'bg-red-50'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                      isActive && !isFailed && 'bg-indigo-100',
                      isCompleted && 'bg-green-100',
                      isFutureStep && 'bg-gray-100',
                      isFailed && isActive && 'bg-red-100'
                    )}
                  >
                    {isActive && !isFailed ? (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : isFailed && isActive ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <StepIcon
                        className={cn(
                          'w-5 h-5',
                          isFutureStep ? 'text-gray-400' : 'text-gray-600'
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'font-medium',
                        isActive && !isFailed && 'text-indigo-900',
                        isCompleted && 'text-green-900',
                        isFutureStep && 'text-gray-400',
                        isFailed && isActive && 'text-red-900'
                      )}
                    >
                      {step.label}
                    </p>
                    <p
                      className={cn(
                        'text-sm mt-0.5',
                        isActive && !isFailed && 'text-indigo-700',
                        isCompleted && 'text-green-700',
                        isFutureStep && 'text-gray-400',
                        isFailed && isActive && 'text-red-700'
                      )}
                    >
                      {isFailed && isActive ? pattern.error : step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {isFailed && pattern.error && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {pattern.error}
              </p>
              <p className="text-sm text-red-600 mt-2">
                Please try again with a different image or description.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
