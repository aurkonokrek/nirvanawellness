import { createFileRoute } from "@tanstack/react-router";
import { handleCollect, type CollectEnv } from "@/lib/analytics-collect";

// POST /api/collect — receives the client beacon, inserts a pageview via service role.
//
// Must use createFileRoute + server.handlers (same shape as api/chat.ts). The older
// `createAPIFileRoute` export from @tanstack/react-start/api is not picked up by this
// version of the router: it warns "does not export a Route. This file will not be
// included in the route tree" at startup and the endpoint 404s, so every analytics
// beacon was silently discarded.
export const Route = createFileRoute("/api/collect")({
  server: {
    handlers: {
      POST: ({ request }) => handleCollect(request, process.env as unknown as CollectEnv),
      GET: () => new Response(null, { status: 405 }),
    },
  },
});
