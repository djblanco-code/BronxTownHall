import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { FOOTER_SECTIONS } from "../nav";

/**
 * Laptops only. Phones reach the same pages from the profile sheet
 * (`AccountButton`), the way apps keep About and legal out of the scroll.
 */
export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-12 hidden lg:block">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.titleKey}>
              <h3 className="mb-2 text-sm font-bold">{t(section.titleKey)}</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="no-min-h hover:text-primary">
                      {t(link.labelKey)}
                      {link.soon && (
                        <span className="ms-1 text-[10px] font-bold text-warning">
                          {t("common.footerSoon")}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="mb-2 text-sm font-bold">{t("common.footerSupport")}</h3>
            <Link
              to="/donate"
              className="no-min-h inline-flex items-center gap-1.5 rounded-md bg-primary-fill px-4 py-2 text-sm font-bold text-primary-fill-foreground hover:bg-primary-fill-hover"
            >
              <Heart className="h-4 w-4" fill="currentColor" aria-hidden="true" />{" "}
              {t("common.footerDonate")}
            </Link>
          </div>
        </div>
        <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
          {t("footer")}
        </div>
      </div>
    </footer>
  );
}
