import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Landmark, Shield, Users } from "lucide-react";
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
      ruled
      action={
        zip && !editing ? (
          <SectionAction onClick={() => setEditing(true)}>
            {t("home.zipLabel")} {zip} · {t("home.zipChange")}
          </SectionAction>
        ) : (
          <SectionAction asChild>
            <Link to="/civic">{t("home.seeAll")}</Link>
          </SectionAction>
        )
      }
    >
      {zip === undefined ? (
        <div aria-hidden="true" className="h-40 animate-pulse rounded-sm bg-muted" />
      ) : zip && !editing ? (
        <Representatives zip={zip} />
      ) : (
        <ZipForm initial={zip ?? ""} onSave={save} />
      )}
    </Section>
  );
}

function Representatives({ zip }: { zip: string }) {
  const { t } = useI18n();
  const area = ZIP_MAP[zip];
  const council = officialsForZip(zip).council[0];
  const board = area?.cb[0] ? COMMUNITY_BOARDS[area.cb[0]] : undefined;
  const precinct = area?.precincts[0] ? PRECINCTS[area.precincts[0]] : undefined;
  const meets = board
    ? [board.schedule, board.time !== "TBD" ? board.time : null].filter(Boolean).join(" · ")
    : null;

  return (
    <>
      <ul className="divide-y divide-border border-b border-border lg:grid lg:grid-cols-3 lg:gap-6 lg:divide-y-0">
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
    </>
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
      <Link to="/civic" className="no-min-h group flex h-full items-start gap-3 py-3">
        <Icon className="mt-4 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="label-caps block text-primary">{label}</span>
          {/* Schedules and titles come from English records; dir="auto" keeps them readable in Arabic. */}
          <span dir="auto" className="line-clamp-2 font-bold text-foreground group-hover:underline">
            {title}
          </span>
          {sub && (
            <span dir="auto" className="block truncate text-sm text-muted-foreground">
              {sub}
            </span>
          )}
        </span>
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
      className="border-b border-border pb-4"
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
            className="h-11 w-full rounded-md border-2 border-foreground bg-card px-4 text-base text-foreground focus-visible:border-primary focus-visible:outline-none"
          />
        </label>
        <button
          type="submit"
          className="no-min-h h-11 shrink-0 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
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
