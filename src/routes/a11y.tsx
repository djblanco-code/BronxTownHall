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
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="no-min-h mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t("back")}
        </button>

        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{t("a11yTitle")}</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{t("a11yBlurb")}</p>

        <div className="mt-6">
          <LanguageSelector />
        </div>

        <section aria-labelledby="a11y-sample" className="mt-8 pt-4">
          <div className="flex items-center gap-3">
            <SpeakButton text={fullText} large label={t("listenAll")} />
            <p className="label-caps text-muted-foreground">{t("listenAll")}</p>
          </div>

          <h2 id="a11y-sample" className="mt-6 text-2xl font-bold text-foreground">
            {sample.name[lang]}
          </h2>
          <ul className="mt-3 divide-y divide-border border-y border-border text-foreground">
            <li className="flex items-start gap-3 py-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{sample.address}</span>
            </li>
            <li className="flex items-start gap-3 py-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{sample.hours[lang]}</span>
            </li>
            <li className="flex items-start gap-3 py-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{sample.requirements[lang]}</span>
            </li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
