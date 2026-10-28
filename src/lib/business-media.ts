import { supabase } from "@/integrations/supabase/client";
import type { BusinessVideo, BusinessVideoCategory } from "./business";

export const VIDEO_MAX_BYTES = 75 * 1024 * 1024; // 75 MB
export const VIDEO_MAX_SECONDS = 30;
export const STOREFRONT_MIN_DIMENSION = 720;

const YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function readVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      const meta = { duration: v.duration, width: v.videoWidth, height: v.videoHeight };
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    v.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read video metadata")); };
    v.src = url;
  });
}

export async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image")); };
    img.src = url;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export async function uploadBusinessVideo(
  file: File,
  businessId: string,
  category: BusinessVideoCategory,
  caption?: string,
): Promise<BusinessVideo> {
  const { data: sess } = await supabase.auth.getUser();
  if (!sess.user) throw new Error("Please sign in to upload videos.");
  if (file.size > VIDEO_MAX_BYTES) throw new Error("Video is larger than 75 MB.");

  const meta = await readVideoMetadata(file);
  if (meta.duration > VIDEO_MAX_SECONDS + 0.5) {
    throw new Error(`Video is ${Math.round(meta.duration)}s — max is ${VIDEO_MAX_SECONDS}s.`);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const path = `${sess.user.id}/${businessId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage.from("business-media").upload(path, file, {
    contentType: file.type || "video/mp4",
    upsert: false,
  });
  if (upErr) throw upErr;

  const { data: signed, error: sErr } = await supabase.storage
    .from("business-media")
    .createSignedUrl(path, YEAR_SECONDS);
  if (sErr || !signed) throw sErr || new Error("Could not sign URL");

  return {
    id: crypto.randomUUID(),
    url: signed.signedUrl,
    storagePath: path,
    caption,
    category,
    durationSec: Math.round(meta.duration),
    sizeBytes: file.size,
    createdAt: Date.now(),
  };
}

export async function deleteBusinessVideo(v: BusinessVideo) {
  await supabase.storage.from("business-media").remove([v.storagePath]);
}
