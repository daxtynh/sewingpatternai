'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import type { Measurements } from '@/types';

const measurementSchema = z.object({
  bust: z.number().min(50).max(200),
  waist: z.number().min(40).max(180),
  hips: z.number().min(50).max(200),
  shoulderWidth: z.number().min(30).max(60),
  armLength: z.number().min(40).max(80),
  inseam: z.number().min(50).max(100),
  torsoLength: z.number().min(30).max(60),
  highBust: z.number().min(50).max(200).optional(),
  underbust: z.number().min(50).max(180).optional(),
  neck: z.number().min(25).max(60).optional(),
  upperArm: z.number().min(20).max(60).optional(),
  wrist: z.number().min(10).max(30).optional(),
  thigh: z.number().min(30).max(90).optional(),
  knee: z.number().min(25).max(60).optional(),
  calf: z.number().min(20).max(60).optional(),
  ankle: z.number().min(15).max(40).optional(),
});

interface MeasurementFormProps {
  initialValues?: Partial<Measurements>;
  onSubmit: (measurements: Measurements) => void;
  onCancel?: () => void;
}

const measurementFields = [
  { name: 'bust', label: 'Bust', required: true, helperText: 'Measure around the fullest part of your bust' },
  { name: 'waist', label: 'Waist', required: true, helperText: 'Measure around your natural waistline' },
  { name: 'hips', label: 'Hips', required: true, helperText: 'Measure around the fullest part of your hips' },
  { name: 'shoulderWidth', label: 'Shoulder Width', required: true, helperText: 'Measure from shoulder point to shoulder point' },
  { name: 'armLength', label: 'Arm Length', required: true, helperText: 'Measure from shoulder to wrist' },
  { name: 'inseam', label: 'Inseam', required: true, helperText: 'Measure from crotch to ankle' },
  { name: 'torsoLength', label: 'Torso Length', required: true, helperText: 'Measure from shoulder to waist' },
] as const;

const extendedMeasurementFields = [
  { name: 'highBust', label: 'High Bust', helperText: 'Measure around your chest, above the bust' },
  { name: 'underbust', label: 'Underbust', helperText: 'Measure directly under your bust' },
  { name: 'neck', label: 'Neck', helperText: 'Measure around the base of your neck' },
  { name: 'upperArm', label: 'Upper Arm', helperText: 'Measure around the fullest part of your upper arm' },
  { name: 'wrist', label: 'Wrist', helperText: 'Measure around your wrist' },
  { name: 'thigh', label: 'Thigh', helperText: 'Measure around the fullest part of your thigh' },
  { name: 'knee', label: 'Knee', helperText: 'Measure around your knee' },
  { name: 'calf', label: 'Calf', helperText: 'Measure around the fullest part of your calf' },
  { name: 'ankle', label: 'Ankle', helperText: 'Measure around your ankle' },
] as const;

export function MeasurementForm({ initialValues, onSubmit, onCancel }: MeasurementFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Measurements>({
    resolver: zodResolver(measurementSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Your Measurements</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter your body measurements in centimeters for accurate pattern sizing.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Core Measurements (Required)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {measurementFields.map((field) => (
                <Input
                  key={field.name}
                  id={field.name}
                  type="number"
                  step="0.1"
                  label={field.label}
                  helperText={field.helperText}
                  error={errors[field.name]?.message}
                  {...register(field.name, { valueAsNumber: true })}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Extended Measurements (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {extendedMeasurementFields.map((field) => (
                <Input
                  key={field.name}
                  id={field.name}
                  type="number"
                  step="0.1"
                  label={field.label}
                  helperText={field.helperText}
                  error={errors[field.name]?.message}
                  {...register(field.name, { valueAsNumber: true })}
                />
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" isLoading={isSubmitting}>
            Save Measurements
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
