import { z } from "zod";

export const inboxSearchSchema = z.object({
  q: z.string().optional().default(""),
  type: z
    .enum(["all", "session_request", "corporate_inquiry", "contact_message"])
    .optional()
    .default("all"),
  status: z.string().optional().default("all"),
  sort: z.enum(["created_at", "name", "status"]).optional().default("created_at"),
  dir: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  open: z.string().optional(),
});

export type InboxSearch = z.infer<typeof inboxSearchSchema>;

export const PAGE_SIZE = 20;

export function rowKey(s: { id: string; type: string }) {
  return `${s.type}:${s.id}`;
}
