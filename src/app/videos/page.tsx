import { getAllVlogs } from "@/lib/vlogs";
import { toVlogPublicCard } from "@/lib/vlog-card";
import { VideosPageClient, type VideoItem } from "./videos-page-client";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  const { vlogs } = await getAllVlogs(
    { published_only: true },
    { page: 1, limit: 100 },
  );
  const items: VideoItem[] = vlogs.map((r) => toVlogPublicCard(r));

  return <VideosPageClient items={items} />;
}
