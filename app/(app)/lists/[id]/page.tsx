import { SmartListView } from "@/components/tasks/SmartListView";

export default function SmartListPage({ params }: { params: { id: string } }) {
  return <SmartListView listId={params.id} />;
}
