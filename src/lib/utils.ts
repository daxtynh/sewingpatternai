import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMeasurement(value: number, unit: 'cm' | 'in' = 'cm'): string {
  if (unit === 'in') {
    return `${(value / 2.54).toFixed(1)}"`;
  }
  return `${value.toFixed(1)} cm`;
}

export function cmToInches(cm: number): number {
  return cm / 2.54;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
