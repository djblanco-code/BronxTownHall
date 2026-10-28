import { useEffect, useState } from "react";
import {
  createCreator,
  linkCreatorToUser,
  listCreators,
  setCreatorActive,
  type Creator,
} from "@/lib/creators";
import { Link } from "@tanstack/react-router";

/**
 * Creator accounts are invite-only: an admin creates the page here.
 * There is deliberately no public creator sign-up.
 */
export function AdminCreatorPanel() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    handle: "",
    display_name: "",
    bio: "",
    photo_url: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    follower_count: "",
    contact_email: "",
  });

  const refresh = () => listCreators({ includeInactive: true }).then(setCreators);
  useEffect(() => {
    refresh();
  }, []);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <section className="rounded-2xl border-2 border-border bg-card p-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold">Creator pages (invite-only)</h2>
        <p className="text-sm text-muted-foreground">
          Creators curate listings that already exist. Their notes never change a listing&apos;s
          verification status.
        </p>
      </div>

      <form
        className="grid sm:grid-cols-2 gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await createCreator({
            handle: form.handle,
            display_name: form.display_name,
            bio: form.bio,
            photo_url: form.photo_url || null,
            socials: {
              instagram: form.instagram || undefined,
              tiktok: form.tiktok || undefined,
              youtube: form.youtube || undefined,
            },
            follower_count: form.follower_count ? Number(form.follower_count) : null,
            contact_email: form.contact_email || undefined,
          });
          if ("error" in res && res.error) {
            setMsg(`Could not create that page: ${res.error.message}`);
            return;
          }
          setMsg(`Created /creators/${form.handle.toLowerCase()}`);
          setForm({
            handle: "",
            display_name: "",
            bio: "",
            photo_url: "",
            instagram: "",
            tiktok: "",
            youtube: "",
            follower_count: "",
            contact_email: "",
          });
          refresh();
        }}
      >
        <Field
          label="Page handle (URL)"
          value={form.handle}
          onChange={set("handle")}
          required
          placeholder="fatmatas-picks"
        />
        <Field
          label="Display name"
          value={form.display_name}
          onChange={set("display_name")}
          required
          placeholder="Fatmata's Bronx Picks"
        />
        <Field
          label="Photo URL"
          value={form.photo_url}
          onChange={set("photo_url")}
          placeholder="https://…"
        />
        <Field
          label="Contact email (private)"
          value={form.contact_email}
          onChange={set("contact_email")}
          type="email"
        />
        <Field
          label="Instagram"
          value={form.instagram}
          onChange={set("instagram")}
          placeholder="@handle"
        />
        <Field label="TikTok" value={form.tiktok} onChange={set("tiktok")} placeholder="@handle" />
        <Field
          label="YouTube"
          value={form.youtube}
          onChange={set("youtube")}
          placeholder="@channel"
        />
        <Field
          label="Follower count (internal)"
          value={form.follower_count}
          onChange={set("follower_count")}
          type="number"
        />
        <label className="sm:col-span-2 block">
          <span className="text-sm font-medium">Short bio (shown publicly, 200 characters)</span>
          <textarea
            value={form.bio}
            onChange={set("bio")}
            maxLength={200}
            rows={2}
            className="mt-1 w-full px-3 py-2 rounded-xl border-2 border-border bg-background"
          />
        </label>
        <button className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold">
          Create creator page
        </button>
      </form>

      {msg && <p className="text-sm font-medium">{msg}</p>}

      <ul className="space-y-2">
        {creators.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-border p-3 flex flex-wrap items-center gap-3"
          >
            <span className="font-semibold">{c.display_name}</span>
            <Link
              to="/creators/$handle"
              params={{ handle: c.handle }}
              className="text-sm text-primary hover:underline"
            >
              /creators/{c.handle}
            </Link>
            <span className="text-xs text-muted-foreground">{c.active ? "Active" : "Hidden"}</span>
            <span className="text-xs text-muted-foreground">
              {c.user_id ? "Linked to an account" : "Not linked to an account yet"}
            </span>
            <span className="ms-auto flex gap-2">
              <button
                onClick={async () => {
                  await setCreatorActive(c.id, !c.active);
                  refresh();
                }}
                className="no-min-h text-sm text-primary hover:underline"
              >
                {c.active ? "Hide" : "Show"}
              </button>
              <button
                onClick={async () => {
                  const uid = window.prompt("Account user ID to link to this page");
                  if (!uid) return;
                  await linkCreatorToUser(c.id, uid.trim());
                  refresh();
                }}
                className="no-min-h text-sm text-primary hover:underline"
              >
                Link account
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full px-3 py-2 rounded-xl border-2 border-border bg-background"
      />
    </label>
  );
}
