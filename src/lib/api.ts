import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export interface Dream {
  id: string;
  name: string;
  category: "short" | "medium" | "long";
  amount: number;
  deadline_years: number;
  priority: number;
  why: string;
  saved: number;
  emoji: string;
}
export interface Debt {
  id: string;
  name: string;
  type: string;
  amount: number;
  emi: number;
  interest: number;
  stress: number;
}
export interface OtherGoal {
  id: string;
  title: string;
  category: string;
  amount: number;
  priority: number;
}
export interface Profile {
  user_id: string;
  full_name: string;
  nickname: string;
  city: string;
  age: number | null;
  monthly_income: number;
  savings: number;
  retirement_age: number | null;
  motivation: string;
  onboarded: boolean;
}

function useUid() {
  const { user } = useAuth();
  return user?.id ?? null;
}

// DREAMS
export function useDreams() {
  const uid = useUid();
  return useQuery({
    queryKey: ["dreams", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from("dreams").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Dream[];
    },
  });
}
export function useSaveDream() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Partial<Dream> & { id?: string }) => {
      if (!uid) throw new Error("Not signed in");
      if (d.id) {
        const { id, ...patch } = d;
        const { error } = await supabase.from("dreams").update(patch).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dreams").insert({ ...d, user_id: uid });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dreams", uid] }),
  });
}
export function useDeleteDream() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dreams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dreams", uid] }),
  });
}

// DEBTS
export function useDebts() {
  const uid = useUid();
  return useQuery({
    queryKey: ["debts", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from("debts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Debt[];
    },
  });
}
export function useSaveDebt() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Partial<Debt> & { id?: string }) => {
      if (!uid) throw new Error("Not signed in");
      if (d.id) {
        const { id, ...patch } = d;
        const { error } = await supabase.from("debts").update(patch).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("debts").insert({ ...d, user_id: uid });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts", uid] }),
  });
}
export function useDeleteDebt() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("debts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts", uid] }),
  });
}

// OTHER GOALS
export function useGoals() {
  const uid = useUid();
  return useQuery({
    queryKey: ["other_goals", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from("other_goals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as OtherGoal[];
    },
  });
}
export function useSaveGoal() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Partial<OtherGoal> & { id?: string }) => {
      if (!uid) throw new Error("Not signed in");
      if (d.id) {
        const { id, ...patch } = d;
        const { error } = await supabase.from("other_goals").update(patch).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("other_goals").insert({ ...d, user_id: uid });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["other_goals", uid] }),
  });
}
export function useDeleteGoal() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("other_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["other_goals", uid] }),
  });
}

// PROFILE
export function useProfile() {
  const uid = useUid();
  return useQuery({
    queryKey: ["profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", uid!).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}
export function useSaveProfile() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      if (!uid) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").update(patch).eq("user_id", uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", uid] }),
  });
}
