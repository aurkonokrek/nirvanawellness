import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CalendarEntry {
  id: string;
  type: "session_request" | "corporate_inquiry";
  name: string;
  status: string;
  scheduled_at: string;
  assigned_expert: string | null;
}

function toDateParam(d: Date) {
  return d.toISOString().split("T")[0];
}

export function useCalendar(from: Date, to: Date) {
  const fromParam = toDateParam(from);
  const toParam = toDateParam(to);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["calendar", fromParam, toParam],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_calendar", {
        p_from: fromParam,
        p_to: toParam,
      });
      if (error) throw error;
      return (data ?? []) as CalendarEntry[];
    },
  });

  return { entries, isLoading };
}
