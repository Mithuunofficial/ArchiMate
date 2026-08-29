import { Architecture } from "./architecture";

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  techStack: string[];
  architecture: Architecture;
  createdAt: string;
  updatedAt: string;
  starCount?: number;
  nodeCount: number;
}
