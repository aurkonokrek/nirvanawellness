import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SubmissionType = "session_request" | "corporate_inquiry" | "contact_message";
export type SubmissionStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "closed";

export interface Submission {
  id: string;
  type: SubmissionType;
  name: string;
  email: string | null;
  phone?: string | null;
  organisation?: string | null;
  message?: string | null;
  notes?: string | null;
  admin_notes: string | null;
  context?: string | null;
  session_type?: string | null;
  preferred_format?: string | null;
  timezone?: string | null;
  expert_name?: string | null;
  program_interest?: string | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  /** session_request / corporate_inquiry only — contact_messages have no appointment concept. */
  scheduled_at: string | null;
  assigned_expert: string | null;
  contact_id: string | null;
}

async function fetchSubmissions(): Promise<Submission[]> {
  const [sessionRes, corporateRes, contactRes] = await Promise.all([
    supabase
      .from("session_requests")
      .select(
        "id,name,email,phone,session_type,preferred_format,timezone,expert_name,preferred_date,notes,admin_notes,status,created_at,updated_at,scheduled_at,assigned_expert,contact_id",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("corporate_inquiries")
      .select(
        "id,name,work_email,organisation,program_interest,context,preferred_date,admin_notes,status,created_at,updated_at,scheduled_at,assigned_expert,contact_id",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("contact_messages")
      .select(
        "id,name,email,message,preferred_date,admin_notes,status,created_at,updated_at,contact_id",
      )
      .order("created_at", { ascending: false }),
  ]);

  if (sessionRes.error) throw sessionRes.error;
  if (corporateRes.error) throw corporateRes.error;
  if (contactRes.error) throw contactRes.error;

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
    scheduled_at: null,
    assigned_expert: null,
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

  // Handles every (type, status) pair through one RPC — the old code routed
  // "Close" through update_contact_message_status regardless of type, which
  // only ever touched contact_messages, so closing a session silently
  // updated zero rows. set_submission_status now raises on a missed or
  // forbidden update instead of returning a jsonb {"status":"not_found"}
  // that supabase-js can't see, so mutateAsync rejects and callers' catch
  // blocks actually fire.
  const setStatus = useMutation({
    mutationFn: async ({
      type,
      id,
      status,
    }: {
      type: SubmissionType;
      id: string;
      status: SubmissionStatus;
    }) => {
      const { error } = await supabase.rpc("set_submission_status", {
        p_type: type,
        p_id: id,
        p_status: status,
      });
      if (error) throw error;
    },
    onSuccess: inv,
  });

  const reschedule = useMutation({
    mutationFn: async ({
      type,
      id,
      newDate,
    }: {
      type: SubmissionType;
      id: string;
      newDate: string;
    }) => {
      const { error } = await supabase.rpc("reschedule_submission", {
        p_type: type,
        p_id: id,
        p_new_date: newDate,
      });
      if (error) throw error;
    },
    onSuccess: inv,
  });

  const setNotes = useMutation({
    mutationFn: async ({
      type,
      id,
      notes,
    }: {
      type: SubmissionType;
      id: string;
      notes: string;
    }) => {
      const { error } = await supabase.rpc("set_submission_notes", {
        p_type: type,
        p_id: id,
        p_notes: notes,
      });
      if (error) throw error;
    },
    onSuccess: inv,
  });

  const setSchedule = useMutation({
    mutationFn: async ({
      type,
      id,
      scheduledAt,
      assignedExpert,
    }: {
      type: "session_request" | "corporate_inquiry";
      id: string;
      /** null clears the slot */
      scheduledAt: string | null;
      assignedExpert?: string | null;
    }) => {
      // p_scheduled_at has no SQL DEFAULT, so NULL (unschedule) must be sent
      // explicitly — but the generated Args type doesn't model that a
      // nullable-column param can legally be null when there's no DEFAULT,
      // so it types as plain `string`. Cast reflects a real, valid DB call.
      const { error } = await supabase.rpc("set_schedule", {
        p_type: type,
        p_id: id,
        p_scheduled_at: scheduledAt as string,
        ...(assignedExpert ? { p_assigned_expert: assignedExpert } : {}),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      inv();
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  return {
    submissions,
    isLoading,
    setStatus: setStatus.mutateAsync,
    reschedule: reschedule.mutateAsync,
    setNotes: setNotes.mutateAsync,
    setSchedule: setSchedule.mutateAsync,
  };
}
