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
    <div className="mt-3 overflow-x-auto">
      <div
        className={cn(
          "grid min-w-[560px] items-start gap-2",
          steps.length === 4 ? "grid-cols-4" : "grid-cols-3",
        )}
      >
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex((item) => item.id === currentStep) > index;

          return (
            <div key={step.id} className="relative">
              {index < steps.length - 1 ? (
                <div className="absolute left-[calc(50%+0.75rem)] right-[-50%] top-3 h-px bg-border">
                  <div
                    className={cn(
                      "h-full bg-violet-500 transition-all",
                      isCompleted ? "w-full" : "w-0",
                    )}
                  />
                </div>
              ) : null}

              <div className="relative z-10 flex flex-col items-center text-center">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border text-[10px] font-bold",
                    isActive || isCompleted
                      ? "border-violet-500 bg-violet-500 text-white"
                      : "border-border bg-surface text-text-secondary",
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "mt-1 text-[10px] font-semibold",
                    isActive ? "text-violet-700" : "text-text-secondary",
                  )}
                >
                  {step.label.replace(/^\d+\.\s*/, "")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
