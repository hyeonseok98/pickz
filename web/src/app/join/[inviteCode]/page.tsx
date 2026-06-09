import { redirect } from "next/navigation";

interface JoinDraftPageProps {
  params: Promise<{
    inviteCode: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readSearchParamValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export default async function JoinDraftPage({
  params,
  searchParams,
}: JoinDraftPageProps) {
  const { inviteCode } = await params;
  const resolvedSearchParams = await searchParams;
  const nextSearchParams = new URLSearchParams({
    draftType: readSearchParamValue(resolvedSearchParams, "draftType") ?? "snake",
    inviteCode,
    mode: "party",
    teamCount: readSearchParamValue(resolvedSearchParams, "teamCount") ?? "5",
    teamSize: readSearchParamValue(resolvedSearchParams, "teamSize") ?? "5",
  });

  const headCoachEnabled = readSearchParamValue(resolvedSearchParams, "headCoachEnabled");
  const coachEnabled = readSearchParamValue(resolvedSearchParams, "coachEnabled");

  if (headCoachEnabled === "true") {
    nextSearchParams.set("headCoachEnabled", "true");
  }

  if (coachEnabled === "true") {
    nextSearchParams.set("coachEnabled", "true");
  }

  redirect(`/draft/create/invite?${nextSearchParams.toString()}`);
}
