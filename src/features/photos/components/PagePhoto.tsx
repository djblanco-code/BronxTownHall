import { cn } from "@/lib/utils";
import { BRONX_PHOTOS, type PhotoSlug } from "../lib/photos";

/**
 * A credited Bronx photo across the top of a page, under the back link and
 * above the title. Same shape on every page, so pages feel like Home.
 */
export function PagePhoto({ slug, className }: { slug: PhotoSlug; className?: string }) {
  const p = BRONX_PHOTOS[slug];
  return (
    <div
      className={cn("print-hide relative mb-4 overflow-hidden rounded-3xl bg-masthead", className)}
    >
      <img
        src={`/images/bronx/${p.slug}-800.webp`}
        srcSet={`/images/bronx/${p.slug}-800.webp 800w, /images/bronx/${p.slug}-1280.webp 1280w`}
        sizes="(min-width: 1024px) 1024px, 100vw"
        alt={p.alt}
        width={1280}
        height={400}
        className="h-36 w-full object-cover sm:h-48 lg:h-56"
        style={{ objectPosition: p.focus }}
      />
      <a
        href={p.source}
        target="_blank"
        rel="noopener noreferrer"
        className="no-min-h absolute end-3 bottom-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white/90 hover:text-white"
      >
        Photo: {p.credit} · {p.license}
      </a>
    </div>
  );
}
