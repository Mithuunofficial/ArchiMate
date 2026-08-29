import { Node, Edge } from "@xyflow/react";
import { CustomNodeData } from "./node";
import { DatabaseSchema } from "./schema";
import { ApiSpecification } from "./api";
import { AnalysisResult } from "./analysis";

export type ArchitectureNode = Node<CustomNodeData>;
export type ArchitectureEdge = Edge;

export interface DirectoryNode {
  name: string;
  type: "file" | "directory";
  children?: DirectoryNode[];
}

export interface ArchitectureMetadata {
  promptUsed?: string;
  technologies: string[];
  estimatedCost?: string;
  layerCount: number;
}

export interface Architecture {
  id: string;
  name: string;
  description: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  metadata: ArchitectureMetadata;
  databaseSchema: DatabaseSchema;
  apiSpecification: ApiSpecification;
  dockerCompose: string;
  projectStructure: DirectoryNode;
  analysis: AnalysisResult;
  createdAt: string;
  updatedAt: string;
}
