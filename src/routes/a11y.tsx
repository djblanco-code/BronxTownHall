import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/features/shell";
import { useI18n } from "@/lib/i18n-context";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SpeakButton } from "@/components/SpeakButton";
import { ArrowLeft, MapPin, Clock, Info } from "lucide-react";

export const Route = createFileRoute("/a11y")({
  staticData: { sitemap: true },
  component: A11yDemo,
});

function A11yDemo() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const sample = {
    name: {
      en: "BronxWorks Food Pantry",
      es: "Despensa de BronxWorks",
      fr: "Banque Alimentaire BronxWorks",
      bn: "ব্রঙ্কসওয়ার্কস ফুড প্যান্ট্রি",
      ar: "مخزن طعام برونكس وركس",
    } as const,
    address: "1130 Grand Concourse, Bronx, NY 10456",
    hours: {
      en: "Open Mon, Wed, Fri 9am to 1pm",
      es: "Abierto Lun, Mié, Vie 9am a 1pm",
      fr: "Ouvert Lun, Mer, Ven 9h à 13h",
      bn: "সোম, বুধ, শুক্র সকাল ৯টা থেকে দুপুর ১টা পর্যন্ত খোলা",
      ar: "مفتوح الإثنين والأربعاء والجمعة من 9 صباحاً حتى 1 ظهراً",
    } as const,
    requirements: {
      en: "Free. No ID required. All neighbors welcome.",
      es: "Gratis. No se requiere identificación. Todos los vecinos bienvenidos.",
      fr: "Gratuit. Aucune pièce d'identité requise. Tous les voisins bienvenus.",
      bn: "বিনামূল্যে। কোনো আইডি লাগবে না। সকল প্রতিবেশীকে স্বাগতম।",
      ar: "مجاني. لا حاجة لبطاقة هوية. جميع الجيران مرحب بهم.",
    } as const,
  };

  const fullText = `${sample.name[lang]}. ${sample.address}. ${sample.hours[lang]}. ${sample.requirements[lang]}`;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h inline-flex items-center gap-1.5 text-sm text-primary font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </button>

        <div className="rounded-3xl bg-gradient-to-br from-accent/15 via-primary/10 to-background p-6 sm:p-10 border border-border">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{t("a11yTitle")}</h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">{t("a11yBlurb")}</p>

          <div className="mt-6">
            <LanguageSelector />
          </div>
        </div>

        <div className="mt-8 rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <SpeakButton text={fullText} large label={t("listenAll")} />
            <p className="mt-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t("listenAll")}
            </p>
          </div>

          <hr className="my-6 border-border" />

          <h2 className="text-2xl font-bold text-foreground">{sample.name[lang]}</h2>
          <ul className="mt-4 space-y-3 text-foreground">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>{sample.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>{sample.hours[lang]}</span>
            </li>
            <li className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>{sample.requirements[lang]}</span>
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
