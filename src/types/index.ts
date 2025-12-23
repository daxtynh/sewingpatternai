// Measurement set
export interface Measurements {
  // Core (required)
  bust: number;
  waist: number;
  hips: number;
  shoulderWidth: number;
  armLength: number;
  inseam: number;
  torsoLength: number;

  // Extended (optional)
  highBust?: number;
  underbust?: number;
  neck?: number;
  upperArm?: number;
  wrist?: number;
  thigh?: number;
  knee?: number;
  calf?: number;
  ankle?: number;
}

export interface MeasurementSet {
  id: string;
  userId: string;
  name: string;
  measurements: Measurements;
  createdAt: Date;
  updatedAt: Date;
}

// AI Analysis output
export interface GarmentAnalysis {
  garmentType: 'dress' | 'top' | 'bottom' | 'outerwear' | 'jumpsuit' | 'other';
  silhouette: 'fitted' | 'semi-fitted' | 'loose' | 'oversized';
  length: string;
  sleeves: {
    type: 'none' | 'cap' | 'short' | 'elbow' | 'three-quarter' | 'long';
    fit: 'fitted' | 'loose' | 'puff' | 'bell';
  };
  neckline: string;
  closure: string;
  seaming: string[];
  details: string[];
  suggestedFabric: 'woven' | 'knit' | 'stretch-woven';
  estimatedEase: {
    bust: number;
    waist: number;
    hip: number;
  };
}

// Pattern generation request
export interface PatternRequest {
  imageUrl?: string;
  imageBase64?: string;
  description: string;
  measurements: Measurements;
  fabricType?: 'woven' | 'knit' | 'stretch-woven';
  seamAllowance?: number; // in cm, default 1.5
  includeInstructions?: boolean;
}

// Pattern output
export interface PatternOutput {
  id: string;
  status: 'pending' | 'generating' | 'analyzing' | 'coding' | 'compiling' | 'completed' | 'failed';
  analysis?: GarmentAnalysis;
  code?: string;
  svgUrl?: string;
  pdfUrl?: string;
  svg?: string;
  instructions?: string;
  error?: string;
  progress?: number;
  message?: string;
}

// User type
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pattern error
export interface PatternError {
  code: string;
  message: string;
  technicalDetails?: string;
  suggestions?: string[];
}

// Image generation request
export interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'sketch' | 'technical';
}

// Image generation response
export interface ImageGenerationResponse {
  imageUrl: string;
  imageId: string;
}

// Pattern piece
export interface PatternPiece {
  name: string;
  svg: string;
  width: number;
  height: number;
  grainLine?: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  seamAllowance?: number;
  cutQuantity: number;
  onFold?: boolean;
}

// Complete pattern
export interface Pattern {
  id: string;
  userId: string;
  name: string;
  sourceImageUrl?: string;
  description: string;
  measurementSetId: string;
  analysis: GarmentAnalysis;
  patternCode: string;
  pieces: PatternPiece[];
  instructions?: string;
  status: PatternOutput['status'];
  createdAt: Date;
  updatedAt: Date;
}
