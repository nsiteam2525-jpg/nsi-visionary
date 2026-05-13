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
  is_achieved?: boolean;
  achieved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}
export interface Debt {
  id: string;
  name: string;
  type: string;
  amount: number;
  emi: number;
  interest: number;
  stress: number;
  created_at?: string;
  updated_at?: string;
}
export interface OtherGoal {
  id: string;
  title: string;
  category: string;
  amount: number;
  priority: number;
  created_at?: string;
  updated_at?: string;
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

export type ActivityAction = "create" | "update" | "delete";
export type ActivityEntity = "dream" | "debt" | "goal";
export interface Activity {
  id: string;
  action: ActivityAction;
  entity_type: ActivityEntity;
  entity_id: string | null;
  entity_name: string;
  details: any;
  created_at: string;
}

function useUid() {
  const { user } = useAuth();
  return user?.id ?? null;
}

async function logActivity(uid: string, a: Omit<Activity, "id" | "created_at">) {
  await supabase.from("activity_log" as any).insert({ ...a, user_id: uid } as any);
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
        await logActivity(uid, { action: "update", entity_type: "dream", entity_id: id, entity_name: d.name ?? "", details: patch });
      } else {
        const { data, error } = await supabase.from("dreams").insert({ ...d, user_id: uid } as any).select().single();
        if (error) throw error;
        await logActivity(uid, { action: "create", entity_type: "dream", entity_id: data.id, entity_name: d.name ?? "", details: d });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dreams", uid] }); qc.invalidateQueries({ queryKey: ["activity", uid] }); },
  });
}
export function useDeleteDream() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { id: string; name: string }) => {
      const { error } = await supabase.from("dreams").delete().eq("id", item.id);
      if (error) throw error;
      if (uid) await logActivity(uid, { action: "delete", entity_type: "dream", entity_id: item.id, entity_name: item.name, details: null });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dreams", uid] }); qc.invalidateQueries({ queryKey: ["activity", uid] }); },
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
        await logActivity(uid, { action: "update", entity_type: "debt", entity_id: id, entity_name: d.name ?? "", details: patch });
      } else {
        const { data, error } = await supabase.from("debts").insert({ ...d, user_id: uid } as any).select().single();
        if (error) throw error;
        await logActivity(uid, { action: "create", entity_type: "debt", entity_id: data.id, entity_name: d.name ?? "", details: d });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["debts", uid] }); qc.invalidateQueries({ queryKey: ["activity", uid] }); },
  });
}
export function useDeleteDebt() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { id: string; name: string }) => {
      const { error } = await supabase.from("debts").delete().eq("id", item.id);
      if (error) throw error;
      if (uid) await logActivity(uid, { action: "delete", entity_type: "debt", entity_id: item.id, entity_name: item.name, details: null });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["debts", uid] }); qc.invalidateQueries({ queryKey: ["activity", uid] }); },
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
        await logActivity(uid, { action: "update", entity_type: "goal", entity_id: id, entity_name: d.title ?? "", details: patch });
      } else {
        const { data, error } = await supabase.from("other_goals").insert({ ...d, user_id: uid } as any).select().single();
        if (error) throw error;
        await logActivity(uid, { action: "create", entity_type: "goal", entity_id: data.id, entity_name: d.title ?? "", details: d });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["other_goals", uid] }); qc.invalidateQueries({ queryKey: ["activity", uid] }); },
  });
}
export function useDeleteGoal() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { id: string; name: string }) => {
      const { error } = await supabase.from("other_goals").delete().eq("id", item.id);
      if (error) throw error;
      if (uid) await logActivity(uid, { action: "delete", entity_type: "goal", entity_id: item.id, entity_name: item.name, details: null });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["other_goals", uid] }); qc.invalidateQueries({ queryKey: ["activity", uid] }); },
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

// ACTIVITY
export function useActivity() {
  const uid = useUid();
  return useQuery({
    queryKey: ["activity", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from("activity_log" as any).select("*").order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data as unknown as Activity[];
    },
  });
}
