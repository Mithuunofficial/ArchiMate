import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Project } from "@/types/project";
import { Architecture } from "@/types/architecture";

export function createEmptyArchitecture(name: string, description: string = ""): Architecture {
  return {
    id: `arch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name,
    description: description,
    nodes: [],
    edges: [],
    metadata: {
      promptUsed: "",
      technologies: [],
      estimatedCost: "$0 / month",
      layerCount: 0,
    },
    databaseSchema: { tables: [] },
    apiSpecification: {
      title: `${name} API`,
      version: "1.0.0",
      endpoints: [],
    },
    dockerCompose: "# Empty Docker Compose configuration\nversion: '3.8'\nservices: {}",
    projectStructure: {
      name: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      type: "directory",
      children: [],
    },
    analysis: {
      overallScore: 100,
      categoryScores: [
        { category: "Security", score: 100, color: "#22C55E" },
        { category: "Scalability", score: 100, color: "#06B6D4" },
        { category: "Performance", score: 100, color: "#2563EB" },
        { category: "Reliability", score: 100, color: "#F59E0B" },
        { category: "Maintainability", score: 100, color: "#22C55E" },
      ],
      insights: [],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

class ProjectService {
  /**
   * Fetch all projects belonging strictly to the authenticated user from Supabase PostgreSQL
   */
  public async getProjects(): Promise<Project[]> {
    if (!isSupabaseConfigured()) return [];

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return [];
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects from Supabase:", error.message);
      return [];
    }

    return (data || []).map((row) => this.mapRowToProject(row));
  }

  /**
   * Fetch a single project by ID belonging to the current user
   */
  public async getProjectById(id: string): Promise<Project | null> {
    if (!isSupabaseConfigured()) return null;

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return null;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToProject(data);
  }

  /**
   * Create a new project for the authenticated user in Supabase PostgreSQL
   */
  public async createProject(
    name: string,
    description: string = "",
    architecture?: Architecture
  ): Promise<Project | null> {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured. Please add credentials to .env.local");
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    const token = sessionData.session?.access_token;
    if (!user) {
      throw new Error("Authentication required to create a project.");
    }

    const arch = architecture || createEmptyArchitecture(name, description);

    // Call server route which validates requireApprovedUser()
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify({
        name,
        description,
        architecture: arch,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "Unable to create project.");
    }

    return this.mapRowToProject(data.project);
  }

  /**
   * Update an existing project in Supabase PostgreSQL
   */
  public async updateProject(
    id: string,
    updatedData: {
      name?: string;
      description?: string;
      architecture?: Architecture;
      techStack?: string[];
    }
  ): Promise<Project | null> {
    if (!isSupabaseConfigured()) return null;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!sessionData.session?.user) {
      return null;
    }

    const res = await fetch("/api/projects/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify({
        id,
        name: updatedData.name,
        description: updatedData.description,
        architecture: updatedData.architecture,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.error("Error updating project:", data.error);
      throw new Error(data.error || "Unable to save project.");
    }

    return this.mapRowToProject(data.project);
  }

  /**
   * Delete a project from Supabase PostgreSQL
   */
  public async deleteProject(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return false;

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      console.error("Error deleting project in Supabase:", error.message);
      return false;
    }
    return true;
  }

  /**
   * Duplicate a project for the authenticated user
   */
  public async duplicateProject(id: string): Promise<Project | null> {
    const source = await this.getProjectById(id);
    if (!source) return null;

    const dupArch: Architecture = JSON.parse(JSON.stringify(source.architecture));
    dupArch.id = `arch-${Date.now()}`;
    dupArch.name = `${source.name} Copy`;

    return this.createProject(`${source.name} Copy`, source.description, dupArch);
  }

  /**
   * Helper to transform Supabase DB row to application Project type
   */
  private mapRowToProject(row: any): Project {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.project_name || row.name || "Untitled Project",
      description: row.description || "",
      techStack: row.tech_stack || [],
      architecture: row.architecture || createEmptyArchitecture(row.project_name || "Untitled"),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      nodeCount: row.node_count ?? (row.architecture?.nodes?.length || 0),
    };
  }
}

export const projectService = new ProjectService();
