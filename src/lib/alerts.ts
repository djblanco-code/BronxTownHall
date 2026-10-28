import { supabase } from "@/integrations/supabase/client";

export type AlertType = "accident" | "closure" | "hazard" | "traffic_light" | "other";
export type AlertSeverity = "low" | "medium" | "high";
export type AlertSource = "311" | "community" | "official" | "dot";

export type TrafficAlert = {
  id: string;
  created_at: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  zip_codes: string[];
  source: AlertSource;
  starts_at: string;
  ends_at: string | null;
  is_resolved: boolean;
};

export type CommunityAlertSubmission = {
  id: string;
  created_at: string;
  submitter_name: string | null;
  submitter_email: string | null;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  zip_code: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  accident: "Accident",
  closure: "Road closure",
  hazard: "Hazard",
  traffic_light: "Traffic light",
  other: "Other",
};

export const ALERT_TYPE_ICONS: Record<AlertType, string> = {
  accident: "🚨",
  closure: "🚧",
  hazard: "⚠️",
  traffic_light: "🚦",
  other: "📍",
};

export const SEVERITY_DOT: Record<AlertSeverity, string> = {
  low: "🟢",
  medium: "🟡",
  high: "🔴",
};

export async function fetchActiveAlerts(zip?: string): Promise<TrafficAlert[]> {
  let q = supabase.from("traffic_alerts").select("*").eq("is_resolved", false).order("created_at", { ascending: false }).limit(200);
  if (zip) q = q.contains("zip_codes", [zip]);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as TrafficAlert[];
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
