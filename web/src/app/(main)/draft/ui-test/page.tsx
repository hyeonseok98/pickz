import { ArrowForwardIcon, PlusIcon } from "@/components/common/icons";
import {
  AvatarNameCard,
  Badge,
  Button,
  DataTable,
  DataTableBodyRow,
  DataTableCell,
  DataTableHeaderCell,
  DataTableHeaderRow,
  SectionCard,
  StatusChip,
} from "@/components/common/ui";

export default function DraftUiTestPage() {
  return (
    <main className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 py-8">
      <SectionCard
        title="공통 UI 테스트"
        description="버튼, 배지, 상태칩, 카드, 표를 빠르게 확인하는 임시 페이지입니다."
        variant="elevated"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Button" description="variant와 size 조합 확인용" padding="sm">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm">
                Primary
              </Button>
              <Button variant="primary" size="md" leadingIcon={<PlusIcon />}>
                방 만들기
              </Button>
              <Button variant="primary" size="lg" trailingIcon={<ArrowForwardIcon />}>
                다음 단계
              </Button>
              <Button variant="secondary" size="md">
                Secondary
              </Button>
              <Button variant="outline" size="md" leadingIcon={<PlusIcon />}>
                링크 복사
              </Button>
              <Button variant="ghost" size="md">
                뒤로가기
              </Button>
              <Button variant="danger" size="md">
                방 나가기
              </Button>
              <Button variant="primary" size="iconMd" aria-label="아이콘 버튼">
                <PlusIcon />
              </Button>
              <Button variant="primary" size="md" isLoading>
                저장
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Badge / Status" description="라벨과 상태 구분 확인용" padding="sm">
            <div className="flex flex-wrap gap-3">
              <Badge tone="brand" variant="soft">
                스네이크
              </Badge>
              <Badge tone="success" variant="soft">
                참여 가능
              </Badge>
              <Badge tone="warning" variant="outline">
                대기
              </Badge>
              <Badge tone="danger" variant="solid">
                삭제
              </Badge>
              <StatusChip tone="neutral">기본 상태</StatusChip>
              <StatusChip tone="active">선택 완료</StatusChip>
              <StatusChip tone="success">연결됨</StatusChip>
              <StatusChip tone="danger">오류</StatusChip>
            </div>
          </SectionCard>

          <SectionCard title="SectionCard" description="카드 variant 확인용" padding="sm">
            <div className="grid gap-3">
              <SectionCard title="기본 카드" description="default variant" padding="sm">
                <p className="text-sm text-text-secondary">
                  드래프트 페이지의 기본 영역에 사용하는 카드입니다.
                </p>
              </SectionCard>
              <SectionCard
                title="Muted 카드"
                description="muted variant"
                padding="sm"
                variant="muted"
              >
                <p className="text-sm text-text-secondary">
                  요약이나 보조 영역에 사용하는 muted 카드입니다.
                </p>
              </SectionCard>
            </div>
          </SectionCard>

          <SectionCard
            title="AvatarNameCard"
            description="아바타 + 이름 표시형 카드 확인용"
            padding="sm"
          >
            <div className="flex flex-wrap gap-3">
              <AvatarNameCard name="러너" />
              <AvatarNameCard
                name="마린"
                imageUrl="https://pickz.co.kr/favicon.ico"
                avatarAlt="마린"
              />
              <AvatarNameCard
                name="참가자"
                avatarSize="sm"
                avatarFallback={<span className="text-xs font-bold text-violet-700">pickz</span>}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="DataTable"
            description="compact / comfortable 밀도 확인용"
            padding="sm"
          >
            <div className="grid gap-4">
              <DataTable layout="fixed">
                <thead>
                  <DataTableHeaderRow>
                    <DataTableHeaderCell density="compact">픽 순서</DataTableHeaderCell>
                    <DataTableHeaderCell density="compact">감독</DataTableHeaderCell>
                    <DataTableHeaderCell density="compact">상태</DataTableHeaderCell>
                  </DataTableHeaderRow>
                </thead>
                <tbody>
                  <DataTableBodyRow>
                    <DataTableCell density="compact">1</DataTableCell>
                    <DataTableCell density="compact">마린</DataTableCell>
                    <DataTableCell density="compact">
                      <StatusChip tone="active">선택 완료</StatusChip>
                    </DataTableCell>
                  </DataTableBodyRow>
                  <DataTableBodyRow>
                    <DataTableCell density="compact">2</DataTableCell>
                    <DataTableCell density="compact">베릴</DataTableCell>
                    <DataTableCell density="compact">
                      <StatusChip tone="muted">대기 중</StatusChip>
                    </DataTableCell>
                  </DataTableBodyRow>
                </tbody>
              </DataTable>
            </div>
          </SectionCard>
        </div>
      </SectionCard>
    </main>
  );
}
