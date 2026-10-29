import { toast } from "sonner";

/** Copies a public list's link and says so. */
export function copyShareLink(slug: string, t: (key: string) => string) {
  const url = `${window.location.origin}/l/${slug}`;
  navigator.clipboard
    .writeText(url)
    .then(() => toast.success(t("saved.linkCopied")))
    .catch(() => toast.info(url));
}
