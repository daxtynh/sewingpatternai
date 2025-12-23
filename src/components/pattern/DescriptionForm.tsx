'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatternStore } from '@/store/usePatternStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const descriptionSchema = z.object({
  description: z.string().min(10, 'Please provide a more detailed description').max(1000),
  fabricType: z.enum(['woven', 'knit', 'stretch-woven']),
  seamAllowance: z.number().min(0.5).max(3),
});

type DescriptionFormData = z.infer<typeof descriptionSchema>;

interface DescriptionFormProps {
  onSubmit: (data: DescriptionFormData) => void;
  onBack?: () => void;
}

const fabricOptions = [
  { value: 'woven', label: 'Woven Fabric', description: 'Cotton, linen, silk, etc. No stretch.' },
  { value: 'knit', label: 'Knit Fabric', description: 'Jersey, rib knit, etc. Stretchy.' },
  { value: 'stretch-woven', label: 'Stretch Woven', description: 'Woven with lycra/spandex blend.' },
];

export function DescriptionForm({ onSubmit, onBack }: DescriptionFormProps) {
  const { description, fabricType, seamAllowance } = usePatternStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DescriptionFormData>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      description,
      fabricType,
      seamAllowance,
    },
  });

  const selectedFabric = watch('fabricType');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Describe Your Garment</h2>
          <p className="text-sm text-gray-500 mt-1">
            The more details you provide, the better the AI can understand your design.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Garment Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className={cn(
                'block w-full rounded-lg border px-3 py-2 text-sm transition-colors',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                errors.description
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              )}
              placeholder="Example: A wrap dress with knee length, princess seams, V-neckline, and 3/4 sleeves. Fitted bodice with a flared skirt. Tie closure at the waist."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Fabric Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fabricOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('fabricType', option.value as DescriptionFormData['fabricType'])}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-colors',
                    selectedFabric === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="block font-medium text-gray-900">{option.label}</span>
                  <span className="block text-sm text-gray-500 mt-1">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seam Allowance (cm)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                {...register('seamAllowance', { valueAsNumber: true })}
                className="w-48"
              />
              <span className="text-sm font-medium text-gray-700 w-16">
                {watch('seamAllowance')} cm
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Standard is 1.5cm. Use less for lightweight fabrics, more for heavy fabrics.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button type="submit" className="ml-auto">
            Continue
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
