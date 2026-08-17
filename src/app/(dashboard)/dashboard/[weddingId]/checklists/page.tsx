import { PreweddingChecklistManager } from "@/components/modules/checklist/prewedding-checklist-manager";

export default async function PreweddingChecklistsPage(props: {
  params: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };

  return <PreweddingChecklistManager weddingId={weddingId} />;
}
