import { ArchitectureNode, ArchitectureEdge } from "@/types/architecture";
import { ArchitectureLayer } from "@/types/node";

export type LayoutDirection = "HORIZONTAL" | "VERTICAL" | "HIERARCHICAL";

const LAYER_ORDER: Record<ArchitectureLayer, number> = {
  "Presentation": 0,
  "Application": 1,
  "Business": 2,
  "Data": 3,
  "Infrastructure": 4,
  "External Services": 5,
};

export function getAutoLayout(
  nodes: ArchitectureNode[],
  edges: ArchitectureEdge[],
  direction: LayoutDirection = "HIERARCHICAL"
): { nodes: ArchitectureNode[]; edges: ArchitectureEdge[] } {
  if (!nodes || nodes.length === 0) return { nodes: [], edges };

  const nodeWidth = 240;
  const nodeHeight = 110;

  if (direction === "HIERARCHICAL") {
    // Group nodes by layer
    const layerGroups: Record<number, ArchitectureNode[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };

    nodes.forEach((node) => {
      const layer = node.data?.layer || "Application";
      const layerIdx = LAYER_ORDER[layer] ?? 1;
      layerGroups[layerIdx].push(node);
    });

    const ySpacing = 180;
    const xSpacing = 280;

    const layoutedNodes = nodes.map((node) => {
      const layer = node.data?.layer || "Application";
      const layerIdx = LAYER_ORDER[layer] ?? 1;
      const indexInLayer = layerGroups[layerIdx].findIndex((n) => n.id === node.id);
      const totalInLayer = layerGroups[layerIdx].length;

      // Center the layer horizontally
      const layerWidth = totalInLayer * xSpacing;
      const startX = 100 - layerWidth / 2;

      return {
        ...node,
        position: {
          x: startX + indexInLayer * xSpacing,
          y: layerIdx * ySpacing + 80,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  } else if (direction === "HORIZONTAL") {
    const xSpacing = 300;
    const ySpacing = 140;

    const layoutedNodes = nodes.map((node, idx) => {
      const col = Math.floor(idx / 3);
      const row = idx % 3;
      return {
        ...node,
        position: {
          x: col * xSpacing + 100,
          y: row * ySpacing + 100,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  } else {
    // VERTICAL
    const xSpacing = 260;
    const ySpacing = 160;

    const layoutedNodes = nodes.map((node, idx) => {
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      return {
        ...node,
        position: {
          x: col * xSpacing + 100,
          y: row * ySpacing + 100,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }
}
