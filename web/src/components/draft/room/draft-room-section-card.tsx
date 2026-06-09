import type { ReactNode } from "react";
import { SectionCard } from "@/components/common/ui";

interface DraftRoomSectionCardProps {
  children: ReactNode;
  className?: string;
  description: string;
  title: string;
}

export function DraftRoomSectionCard({
  children,
  className,
  description,
  title,
}: DraftRoomSectionCardProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      className={className}
      contentClassName="min-h-0 flex-1"
    >
      {children}
    </SectionCard>
  );
}
