import { Architecture } from "@/types/architecture";
import { getMockArchitectureForPrompt } from "@/mocks/presets";
import { supabase } from "@/lib/supabase/client";

export interface GenerationStep {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "completed";
}

export class ArchitectureService {
  public async generateArchitecture(
    prompt: string,
    onStepUpdate?: (steps: GenerationStep[]) => void
  ): Promise<Architecture> {
    const steps: GenerationStep[] = [
      { id: "step-1", label: "Identifying application components", status: "pending" },
      { id: "step-2", label: "Detecting external services & APIs", status: "pending" },
      { id: "step-3", label: "Creating system relationships & data flows", status: "pending" },
      { id: "step-4", label: "Optimizing topology & layer distribution", status: "pending" },
    ];

    if (onStepUpdate) onStepUpdate([...steps]);

    // Step 1
    steps[0].status = "in-progress";
    if (onStepUpdate) onStepUpdate([...steps]);
    await this.delay(600);
    steps[0].status = "completed";

    // Step 2
    steps[1].status = "in-progress";
    if (onStepUpdate) onStepUpdate([...steps]);
    await this.delay(700);
    steps[1].status = "completed";

    // Step 3
    steps[2].status = "in-progress";
    if (onStepUpdate) onStepUpdate([...steps]);
    await this.delay(700);
    steps[2].status = "completed";

    // Step 4
    steps[3].status = "in-progress";
    if (onStepUpdate) onStepUpdate([...steps]);

    // Call server endpoint protected by requireApprovedUser
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "Your account is awaiting approval.");
    }

    steps[3].status = "completed";
    if (onStepUpdate) onStepUpdate([...steps]);

    return data.architecture || getMockArchitectureForPrompt(prompt);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const architectureService = new ArchitectureService();
