import { create } from 'zustand';
import type { Measurements, GarmentAnalysis, PatternOutput, MeasurementSet } from '@/types';

interface PatternState {
  // Current pattern generation
  currentPattern: PatternOutput | null;

  // User's measurement sets
  measurementSets: MeasurementSet[];
  selectedMeasurementSetId: string | null;

  // Current image
  uploadedImage: string | null;
  generatedImage: string | null;

  // Form data
  description: string;
  fabricType: 'woven' | 'knit' | 'stretch-woven';
  seamAllowance: number;

  // UI state
  isGenerating: boolean;
  currentStep: 'upload' | 'describe' | 'measurements' | 'generating' | 'preview';
  error: string | null;

  // Actions
  setUploadedImage: (image: string | null) => void;
  setGeneratedImage: (image: string | null) => void;
  setDescription: (description: string) => void;
  setFabricType: (type: 'woven' | 'knit' | 'stretch-woven') => void;
  setSeamAllowance: (allowance: number) => void;
  setMeasurementSets: (sets: MeasurementSet[]) => void;
  selectMeasurementSet: (id: string | null) => void;
  addMeasurementSet: (set: MeasurementSet) => void;
  setCurrentPattern: (pattern: PatternOutput | null) => void;
  updatePatternStatus: (status: PatternOutput['status'], message?: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setCurrentStep: (step: PatternState['currentStep']) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentPattern: null,
  measurementSets: [],
  selectedMeasurementSetId: null,
  uploadedImage: null,
  generatedImage: null,
  description: '',
  fabricType: 'woven' as const,
  seamAllowance: 1.5,
  isGenerating: false,
  currentStep: 'upload' as const,
  error: null,
};

export const usePatternStore = create<PatternState>((set) => ({
  ...initialState,

  setUploadedImage: (image) => set({ uploadedImage: image, generatedImage: null }),
  setGeneratedImage: (image) => set({ generatedImage: image, uploadedImage: null }),
  setDescription: (description) => set({ description }),
  setFabricType: (fabricType) => set({ fabricType }),
  setSeamAllowance: (seamAllowance) => set({ seamAllowance }),
  setMeasurementSets: (sets) => set({ measurementSets: sets }),
  selectMeasurementSet: (id) => set({ selectedMeasurementSetId: id }),
  addMeasurementSet: (measurementSet) => set((state) => ({
    measurementSets: [...state.measurementSets, measurementSet]
  })),
  setCurrentPattern: (pattern) => set({ currentPattern: pattern }),
  updatePatternStatus: (status, message) => set((state) => ({
    currentPattern: state.currentPattern
      ? { ...state.currentPattern, status, message }
      : null
  })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
