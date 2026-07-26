import { createAPIFileRoute } from "@tanstack/react-start/api";
import { handleCollect, type CollectEnv } from "@/lib/analytics-collect";

// POST /api/collect — receives client beacon, inserts pageview via service role
export const APIRoute = createAPIFileRoute("/api/collect")({
  POST: ({ request }) => handleCollect(request, process.env as unknown as CollectEnv),
  GET: () => new Response(null, { status: 405 }),
});
