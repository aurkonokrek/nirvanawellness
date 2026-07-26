import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SubmissionType = "session_request" | "corporate_inquiry" | "contact_message";
export type SubmissionStatus = "new" | "contacted" | "confirmed" | "rescheduled" | "cancelled" | "closed";

export interface Submission {
  id: string;
  type: SubmissionType;
  name: string;
  email: string | null;
  phone?: string | null;
  organisation?: string | null;
  message?: string | null;
  notes?: string | null;
  context?: string | null;
  session_type?: string | null;
  preferred_format?: string | null;
  timezone?: string | null;
  expert_name?: string | null;
  program_interest?: string | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
}

async function fetchSubmissions(): Promise<Submission[]> {
  const [sessionRes, corporateRes, contactRes] = await Promise.all([
    supabase
      .from("session_requests")
      .select("id,name,email,phone,session_type,preferred_format,timezone,expert_name,preferred_date,notes,status,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("corporate_inquiries")
      .select("id,name,work_email,organisation,program_interest,context,preferred_date,status,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("contact_messages")
      .select("id,name,email,message,preferred_date,status,created_at")
      .order("created_at", { ascending: false }),
  ]);

  const sessions: Submission[] = (sessionRes.data ?? []).map((r) => ({
    ...r,
    type: "session_request" as const,
    email: r.email,
    message: null,
    organisation: null,
    context: null,
  }));

  const corporate: Submission[] = (corporateRes.data ?? []).map((r) => ({
    ...r,
    type: "corporate_inquiry" as const,
    email: r.work_email,
    phone: null,
    message: null,
    notes: null,
    session_type: null,
    preferred_format: null,
    timezone: null,
    expert_name: null,
  }));

  const contacts: Submission[] = (contactRes.data ?? []).map((r) => ({
    ...r,
    type: "contact_message" as const,
    phone: null,
    notes: null,
    organisation: null,
    context: null,
    session_type: null,
    preferred_format: null,
    timezone: null,
    expert_name: null,
    program_interest: null,
  }));

  return [...sessions, ...corporate, ...contacts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function useSubmissions() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["submissions"] });

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: fetchSubmissions,
  });

  const confirmSession = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await supabase.rpc("confirm_session_request", { p_id: id, p_notes: notes });
      if (error) throw error;
    },
    onSuccess: inv,
  });

  const rescheduleSession = useMutation({
    mutationFn: async ({ id, newDate }: { id: string; newDate: string }) => {
      const { error } = await supabase.rpc("reschedule_session_request", { p_id: id, p_new_date: newDate });
      if (error) throw error;
    },
    onSuccess: inv,
  });

  const confirmCorporate = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.rpc("confirm_corporate_inquiry", { p_id: id });
      if (error) throw error;
    },
    onSuccess: inv,
  });

  const rescheduleCorporate = useMutation({
    mutationFn: async ({ id, newDate }: { id: string; newDate: string }) => {
      const { error } = await supabase.rpc("reschedule_corporate_inquiry", { p_id: id, p_new_date: newDate });
      if (error) throw error;
    },
    onSuccess: inv,
  });

  const updateContactStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.rpc("update_contact_message_status", { p_id: id, p_status: status });
      if (error) throw error;
    },
    onSuccess: inv,
  });

  return {
    submissions,
    isLoading,
    confirmSession: confirmSession.mutateAsync,
    rescheduleSession: rescheduleSession.mutateAsync,
    confirmCorporate: confirmCorporate.mutateAsync,
    rescheduleCorporate: rescheduleCorporate.mutateAsync,
    updateContactStatus: updateContactStatus.mutateAsync,
  };
}
