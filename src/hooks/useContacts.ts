import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Contact {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  submission_count: number;
  last_submission_at: string | null;
}

export interface ContactNote {
  id: string;
  note: string;
  created_at: string;
}

export function useContacts() {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_contacts");
      if (error) throw error;
      return (data ?? []) as Contact[];
    },
  });

  return { contacts, isLoading };
}

export function useContactNotes(contactId: string | null) {
  const qc = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["contact-notes", contactId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_contact_notes", {
        p_contact_id: contactId as string,
      });
      if (error) throw error;
      return (data ?? []) as ContactNote[];
    },
    enabled: !!contactId,
  });

  const addNote = useMutation({
    mutationFn: async (note: string) => {
      if (!contactId) return;
      const { error } = await supabase.rpc("add_contact_note", {
        p_contact_id: contactId,
        p_note: note,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact-notes", contactId] }),
  });

  return { notes, isLoading, addNote: addNote.mutateAsync };
}
