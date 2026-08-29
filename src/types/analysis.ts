export type MetricCategory = "Security" | "Scalability" | "Performance" | "Reliability" | "Maintainability";

export interface CategoryScore {
  category: MetricCategory;
  score: number; // 0-100
  color: string;
}

export interface AnalysisInsight {
  id: string;
  type: "success" | "warning" | "error" | "info";
  category: MetricCategory;
  title: string;
  description: string;
  recommendation?: string;
  affectedNodeIds?: string[];
}

export interface AnalysisResult {
  overallScore: number;
  categoryScores: CategoryScore[];
  insights: AnalysisInsight[];
}
