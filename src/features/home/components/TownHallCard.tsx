import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Landmark, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import {
  CIVIC_ZIP_KEY,
  COMMUNITY_BOARDS,
  PRECINCTS,
  ZIP_MAP,
  officialsForZip,
} from "@/lib/civic-data";
import { Section, SectionAction } from "@/components/ui/section";

/**
 * Who represents you, by ZIP: council member, community board (with its
 * published meeting schedule) and police precinct. Uses the same ZIP the
 * Town Hall tab saves, kept only on this device.
 */
export function TownHallCard() {
  const { t } = useI18n();
  // undefined until read on the client, so the server never guesses a ZIP.
  const [zip, setZip] = useState<string | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(CIVIC_ZIP_KEY);
    } catch {
      /* storage unavailable */
    }
    setZip(saved && ZIP_MAP[saved] ? saved : null);
  }, []);

  const save = (z: string) => {
    setZip(z);
    setEditing(false);
    try {
      localStorage.setItem(CIVIC_ZIP_KEY, z);
    } catch {
      /* keep it for this visit only */
    }
  };

  return (
    <Section
      id="home-townhall-title"
      title={t("home.townHallTitle")}
      action={
        <SectionAction asChild>
          <Link to="/civic">{t("home.seeAll")}</Link>
        </SectionAction>
      }
    >
      {zip === undefined ? (
        <div aria-hidden="true" className="h-40 animate-pulse rounded-2xl bg-muted" />
      ) : zip && !editing ? (
        <Representatives zip={zip} onChange={() => setEditing(true)} />
      ) : (
        <ZipForm initial={zip ?? ""} onSave={save} />
      )}
    </Section>
  );
}

function Representatives({ zip, onChange }: { zip: string; onChange: () => void }) {
  const { t } = useI18n();
  const area = ZIP_MAP[zip];
  const council = officialsForZip(zip).council[0];
  const board = area?.cb[0] ? COMMUNITY_BOARDS[area.cb[0]] : undefined;
  const precinct = area?.precincts[0] ? PRECINCTS[area.precincts[0]] : undefined;
  const meets = board
    ? [board.schedule, board.time !== "TBD" ? board.time : null].filter(Boolean).join(" · ")
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          {t("home.zipLabel")}: <span className="font-bold text-foreground">{zip}</span>
        </span>
        <button
          type="button"
          onClick={onChange}
          className="no-min-h h-8 rounded-full px-3 font-semibold text-primary hover:bg-secondary"
        >
          {t("home.zipChange")}
        </button>
      </div>
      <ul className="divide-y divide-border lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0 rtl:lg:divide-x-reverse">
        {council && (
          <Row
            icon={Landmark}
            label={t("home.councilMember")}
            title={council.name}
            sub={council.title}
          />
        )}
        {board && (
          <Row
            icon={Users}
            label={`${t("home.communityBoard", { n: board.id.replace(/\D/g, "") })} · ${t("home.meetings")}`}
            title={meets ?? board.address}
            sub={board.address}
          />
        )}
        {precinct && (
          <Row
            icon={Shield}
            label={t("home.precinct")}
            title={precinct.name}
            sub={precinct.phone}
          />
        )}
      </ul>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  title,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  sub?: string;
}) {
  return (
    <li>
      <Link
        to="/civic"
        className="no-min-h flex h-full items-center gap-3 px-3 py-3 transition hover:bg-secondary/60"
      >
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-muted-foreground">{label}</span>
          {/* Schedules and titles come from English records; dir="auto" keeps them readable in Arabic. */}
          <span dir="auto" className="line-clamp-2 font-semibold text-foreground">
            {title}
          </span>
          {sub && (
            <span dir="auto" className="block truncate text-xs text-muted-foreground">
              {sub}
            </span>
          )}
        </span>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

function ZipForm({ initial, onSave }: { initial: string; onSave: (zip: string) => void }) {
  const { t } = useI18n();
  const [value, setValue] = useState(initial);
  const [invalid, setInvalid] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const z = value.trim();
        if (ZIP_MAP[z]) onSave(z);
        else setInvalid(true);
      }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <p className="text-sm text-foreground">{t("home.townHallPrompt")}</p>
      <div className="mt-3 flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">{t("home.zipLabel")}</span>
          <input
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="10451"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.replace(/\D/g, ""));
              setInvalid(false);
            }}
            aria-invalid={invalid}
            aria-describedby="home-zip-hint"
            className="h-11 w-full rounded-full border border-border bg-background px-4 text-base text-foreground focus-visible:border-primary focus-visible:outline-none"
          />
        </label>
        <button
          type="submit"
          className="no-min-h h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {t("home.zipShow")}
        </button>
      </div>
      <p
        id="home-zip-hint"
        role={invalid ? "alert" : undefined}
        className={
          invalid
            ? "mt-2 text-xs font-semibold text-destructive"
            : "mt-2 text-xs text-muted-foreground"
        }
      >
        {invalid ? t("home.zipInvalid") : t("home.zipSavedHere")}
      </p>
    </form>
  );
}
