export interface FrequencyLevel {
  level: number;
  name: string;
  color: string;
  description: string;
}

export interface QuestionOption {
  label: string;
  score: number;
  dimensionScores: Record<string, number>;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

export interface DimensionResult {
  key: string;
  label: string;
  value: number;
  description: string;
}

export interface AnalysisResult {
  totalScore: number;
  level: FrequencyLevel;
  dimensions: DimensionResult[];
  aiAnalysis: string;
  aiAdvice: string;
  strongestDimensionAnalysis: string;
  weakestDimensionAnalysis: string;
}
