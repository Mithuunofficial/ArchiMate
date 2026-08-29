import { Architecture } from "./architecture";

export interface Template {
  id: string;
  name: string;
  category: "E-Commerce" | "SaaS" | "Social" | "Real-Time" | "FinTech" | "Healthcare" | "AI/ML" | "Microservices";
  description: string;
  technologies: string[];
  componentsCount: number;
  previewNodes: string[]; // List of component names for card visual preview
  architecture: Architecture;
}
