import { cn } from "@/utils";
import type { ParticipationMode } from "@/types/drafts";

export type DraftCreateStep = "draft" | "settings" | "streamers" | "invite";

interface DraftStepperProps {
  currentStep: DraftCreateStep;
  mode: ParticipationMode;
}

interface DraftStepDefinition {
  id: DraftCreateStep;
  label: string;
}

const soloDraftSteps: DraftStepDefinition[] = [
  { id: "draft", label: "1. 방식 선택" },
  { id: "settings", label: "2. 방 설정" },
  { id: "streamers", label: "3. 참가 스트리머 설정" },
];

const partyDraftSteps: DraftStepDefinition[] = [
  ...soloDraftSteps,
  { id: "invite", label: "4. 참가자 초대" },
];

export function DraftStepper({ currentStep, mode }: DraftStepperProps) {
  const steps = mode === "party" ? partyDraftSteps : soloDraftSteps;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 text-text-muted">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          {index > 0 ? <span className="text-xs">›</span> : null}
          <span
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold",
              step.id === currentStep
                ? "border-violet-200 bg-violet-100 text-violet-700"
                : "border-border bg-surface text-text-secondary",
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
