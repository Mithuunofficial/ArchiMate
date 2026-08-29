import { create } from "zustand";
import { Architecture, ArchitectureNode, ArchitectureEdge } from "@/types/architecture";
import { createEmptyArchitecture } from "@/services/project.service";
import { getAutoLayout, LayoutDirection } from "@/utils/layout";
import { applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, addEdge, Connection } from "@xyflow/react";

interface HistoryItem {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

interface ArchitectureStore {
  currentProjectId: string | null;
  currentArchitecture: Architecture | null;
  selectedNodeId: string | null;
  activeTab: "inspector" | "analysis" | "schema" | "api" | "docker" | "structure";
  activeLayers: string[];
  history: HistoryItem[];
  historyIndex: number;
  
  // Actions
  loadProjectArchitecture: (projectId: string, arch: Architecture) => void;
  setArchitecture: (arch: Architecture) => void;
  setSelectedNodeId: (id: string | null) => void;
  setActiveTab: (tab: ArchitectureStore["activeTab"]) => void;
  toggleLayer: (layerName: string) => void;
  
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  updateNodeData: (nodeId: string, updatedData: Partial<ArchitectureNode["data"]>) => void;
  addNode: (node: ArchitectureNode) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  
  applyLayout: (direction?: LayoutDirection) => void;
  undo: () => void;
  redo: () => void;
}

export const useArchitectureStore = create<ArchitectureStore>((set, get) => ({
  currentProjectId: null,
  currentArchitecture: null,
  selectedNodeId: null,
  activeTab: "inspector",
  activeLayers: ["Presentation", "Application", "Business", "Data", "Infrastructure", "External Services"],
  history: [],
  historyIndex: 0,

  loadProjectArchitecture: (projectId, arch) => {
    set({
      currentProjectId: projectId,
      currentArchitecture: arch,
      selectedNodeId: null,
      history: [{ nodes: arch.nodes, edges: arch.edges }],
      historyIndex: 0,
    });
  },

  setArchitecture: (arch) => {
    set({
      currentArchitecture: arch,
      selectedNodeId: null,
      history: [{ nodes: arch.nodes, edges: arch.edges }],
      historyIndex: 0,
    });
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleLayer: (layerName) =>
    set((state) => {
      const exists = state.activeLayers.includes(layerName);
      return {
        activeLayers: exists
          ? state.activeLayers.filter((l) => l !== layerName)
          : [...state.activeLayers, layerName],
      };
    }),

  onNodesChange: (changes) => {
    const { currentArchitecture } = get();
    if (!currentArchitecture) return;
    const updatedNodes = applyNodeChanges(changes, currentArchitecture.nodes) as ArchitectureNode[];
    set({
      currentArchitecture: { ...currentArchitecture, nodes: updatedNodes },
    });
  },

  onEdgesChange: (changes) => {
    const { currentArchitecture } = get();
    if (!currentArchitecture) return;
    const updatedEdges = applyEdgeChanges(changes, currentArchitecture.edges) as ArchitectureEdge[];
    set({
      currentArchitecture: { ...currentArchitecture, edges: updatedEdges },
    });
  },

  onConnect: (connection) => {
    const { currentArchitecture } = get();
    if (!currentArchitecture) return;
    const updatedEdges = addEdge({ ...connection, animated: true }, currentArchitecture.edges) as ArchitectureEdge[];
    set({
      currentArchitecture: { ...currentArchitecture, edges: updatedEdges },
    });
  },

  updateNodeData: (nodeId, updatedData) => {
    const { currentArchitecture } = get();
    if (!currentArchitecture) return;
    const updatedNodes = currentArchitecture.nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, ...updatedData },
        };
      }
      return node;
    });
    set({
      currentArchitecture: { ...currentArchitecture, nodes: updatedNodes },
    });
  },

  addNode: (newNode) => {
    const { currentArchitecture } = get();
    if (!currentArchitecture) return;
    const updatedNodes = [...currentArchitecture.nodes, newNode];
    set({
      currentArchitecture: { ...currentArchitecture, nodes: updatedNodes },
      selectedNodeId: newNode.id,
    });
  },

  deleteNode: (nodeId) => {
    const { currentArchitecture, selectedNodeId } = get();
    if (!currentArchitecture) return;
    const updatedNodes = currentArchitecture.nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = currentArchitecture.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    set({
      currentArchitecture: { ...currentArchitecture, nodes: updatedNodes, edges: updatedEdges },
      selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
    });
  },

  duplicateNode: (nodeId) => {
    const { currentArchitecture } = get();
    if (!currentArchitecture) return;
    const target = currentArchitecture.nodes.find((n) => n.id === nodeId);
    if (!target) return;

    const dupId = `node-dup-${Date.now()}`;
    const duplicatedNode: ArchitectureNode = {
      ...target,
      id: dupId,
      position: {
        x: target.position.x + 30,
        y: target.position.y + 30,
      },
      data: {
        ...target.data,
        label: `${target.data.label} (Copy)`,
      },
    };

    set({
      currentArchitecture: {
        ...currentArchitecture,
        nodes: [...currentArchitecture.nodes, duplicatedNode],
      },
      selectedNodeId: dupId,
    });
  },

  applyLayout: (direction = "HIERARCHICAL") => {
    const { currentArchitecture } = get();
    if (!currentArchitecture) return;
    const { nodes: layoutedNodes, edges: layoutedEdges } = getAutoLayout(
      currentArchitecture.nodes,
      currentArchitecture.edges,
      direction
    );
    set({
      currentArchitecture: {
        ...currentArchitecture,
        nodes: layoutedNodes,
        edges: layoutedEdges,
      },
    });
  },

  undo: () => {
    const { history, historyIndex, currentArchitecture } = get();
    if (!currentArchitecture) return;
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      set({
        historyIndex: historyIndex - 1,
        currentArchitecture: {
          ...currentArchitecture,
          nodes: prev.nodes,
          edges: prev.edges,
        },
      });
    }
  },

  redo: () => {
    const { history, historyIndex, currentArchitecture } = get();
    if (!currentArchitecture) return;
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      set({
        historyIndex: historyIndex + 1,
        currentArchitecture: {
          ...currentArchitecture,
          nodes: next.nodes,
          edges: next.edges,
        },
      });
    }
  },
}));
