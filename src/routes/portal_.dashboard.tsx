import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/features/shell";
import { useAuth } from "@/hooks/use-auth";
import {
  ACCOUNT_TYPES,
  CATEGORY_LABELS,
  FREE_TIER_EVENTS_PER_MONTH,
  badgeFor,
  eventsThisMonth,
  loadContacts,
  loadMyOrgs,
  orgPhotoUrl,
  postOfficialUpdate,
  saveContact,
  updateOwnOrg,
  uploadOrgPhoto,
  type OfficialUpdate,
  type OrgAccount,
  type OrgContact,
} from "@/lib/org-accounts";
import { supabase } from "@/integrations/supabase/client";
import { OrgListingForm, fromExisting, type OrgFormValue } from "@/components/OrgListingForm";
import { StatusBadge } from "@/components/OrgStatusBadge";
import { ArrowLeft, BarChart3, ImagePlus, Loader2, Megaphone, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { BusinessSupportPanel } from "@/components/BusinessSupportPanel";

const TITLE = "Your organization dashboard | The Bronx App";
const DESC =
  "Manage the listings your business, community organization or government office has submitted to The Bronx App.";

export const Route = createFileRoute("/portal_/dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<OrgAccount[]>([]);
  const [contacts, setContacts] = useState<Record<string, OrgContact>>({});
  const [busy, setBusy] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<OrgFormValue | null>(null);
  const [monthEvents, setMonthEvents] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    const list = await loadMyOrgs(user.id);
    setOrgs(list);
    setContacts(await loadContacts(list.map((o) => o.id)));
    setMonthEvents(await eventsThisMonth(user.id));
    setBusy(false);
  }, [user]);

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  if (loading) {
    return (
      <AppShell>
        <p className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-10 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
        </p>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Sign in to manage your listing
          </h1>
          <p className="text-muted-foreground">Organization accounts sign in here.</p>
          <Link
            to="/portal"
            className="no-min-h inline-flex h-11 items-center rounded-md bg-primary-fill px-5 font-semibold text-primary-fill-foreground hover:bg-primary-fill-hover"
          >
            Go to the organization portal
          </Link>
        </div>
      </AppShell>
    );
  }

  const save = async (v: OrgFormValue) => {
    if (!editing) return;
    const {
      contact_name,
      contact_role,
      contact_email,
      contact_phone,
      id,
      user_id,
      created_at,
      updated_at,
      status,
      verified_at,
      verified_fields,
      premium,
      priority_review,
      published,
      admin_notes,
      ...listing
    } = v as OrgFormValue & OrgAccount;
    try {
      // Edited details are unconfirmed again until a reviewer re-checks them.
      await updateOwnOrg(editing, {
        ...listing,
        status: "pending_review",
        verified_at: null,
        verified_fields: {},
      });
      await saveContact({
        org_id: editing,
        user_id: user.id,
        contact_name,
        contact_role,
        contact_email,
        contact_phone,
      });
      toast.success("Saved. Your changes are live and back in the review queue.");
      setEditing(null);
      setForm(null);
      void refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <Link
          to="/"
          className="no-min-h inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> Home
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Your listings</h1>
            <p className="text-sm break-all text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/portal"
              className="no-min-h inline-flex h-11 items-center gap-1.5 rounded-md bg-primary-fill px-4 text-sm font-semibold text-primary-fill-foreground hover:bg-primary-fill-hover"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Add another
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              className="no-min-h h-11 rounded-md border border-border px-4 text-sm font-bold text-foreground hover:bg-secondary"
            >
              Sign out
            </button>
          </div>
        </header>

        {busy && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading your listings…
          </p>
        )}

        {!busy && orgs.length === 0 && (
          <div className="space-y-1 border-y border-border py-4">
            <p className="font-bold">You haven&apos;t submitted a listing yet.</p>
            <Link to="/portal" className="font-bold text-primary underline underline-offset-4">
              Create your first listing
            </Link>
          </div>
        )}

        {orgs.map((o) =>
          editing === o.id && form ? (
            <div key={o.id} className="space-y-3">
              <button
                onClick={() => {
                  setEditing(null);
                  setForm(null);
                }}
                className="no-min-h inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline"
              >
                ← Cancel editing
              </button>
              <OrgListingForm
                value={form}
                onChange={setForm}
                onSubmit={save}
                submitLabel="Save changes"
              />
            </div>
          ) : (
            <OrgCard
              key={o.id}
              org={o}
              monthEvents={monthEvents}
              onEdit={() => {
                setEditing(o.id);
                setForm(fromExisting(o, contacts[o.id]));
              }}
              onChanged={refresh}
              userId={user.id}
              contact={contacts[o.id]}
            />
          ),
        )}
      </div>
    </AppShell>
  );
}

function OrgCard({
  org,
  monthEvents,
  onEdit,
  onChanged,
  userId,
  contact,
}: {
  org: OrgAccount;
  monthEvents: number;
  onEdit: () => void;
  onChanged: () => void;
  userId: string;
  contact?: OrgContact;
}) {
  const typeLabel = ACCOUNT_TYPES.find((t) => t.id === org.account_type)?.label ?? org.account_type;
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    void orgPhotoUrl(org.photo_url).then(setPhoto);
  }, [org.photo_url]);

  const upload = async (file: File) => {
    try {
      const path = await uploadOrgPhoto(userId, file);
      await updateOwnOrg(org.id, { photo_url: path });
      toast.success("Photo uploaded.");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  };

  return (
    <section className="space-y-3 pt-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex gap-3">
          {photo ? (
            <img
              src={photo}
              alt={`${org.org_name} logo`}
              className="h-14 w-14 shrink-0 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-border text-muted-foreground">
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold sm:text-2xl">{org.org_name}</h2>
            <p className="text-sm text-muted-foreground">
              {typeLabel}
              {org.category ? ` · ${CATEGORY_LABELS[org.category] ?? org.category}` : ""}
            </p>
            <div className="mt-1">
              <StatusBadge org={org} />
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="no-min-h inline-flex h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-bold text-foreground hover:bg-secondary"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" /> Edit listing
        </button>
      </div>

      {org.status === "needs_changes" && (
        <p className="rounded-md border border-border p-3 text-sm">
          A reviewer asked for changes{org.admin_notes ? `: ${org.admin_notes}` : "."} Edit your
          listing and save to send it back.
        </p>
      )}

      <label className="no-min-h inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold text-primary hover:underline">
        <ImagePlus className="h-4 w-4" aria-hidden="true" />{" "}
        {org.photo_url ? "Replace photo" : "Add a logo or storefront photo"}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
      </label>

      {org.account_type === "business" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-semibold">Event posts this month</p>
              <p className="text-2xl font-bold">
                {monthEvents}
                {!org.premium && (
                  <span className="text-base font-medium text-muted-foreground">
                    {" "}
                    / {FREE_TIER_EVENTS_PER_MONTH}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {org.premium
                  ? "Premium — unlimited event posts."
                  : `Free listing includes ${FREE_TIER_EVENTS_PER_MONTH} event posts a month.`}
              </p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                <BarChart3 className="h-4 w-4" aria-hidden="true" /> This week
              </p>
              {org.premium ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Views and calls appear here once residents start using your listing.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Weekly views and calls come with Premium ($19/mo, launching soon). Nothing is
                  charged today.
                </p>
              )}
            </div>
          </div>
          <BusinessSupportPanel org={org} contact={contact} userId={userId} />
        </>
      )}

      {org.account_type === "government" && <OfficialUpdateBox org={org} userId={userId} />}
    </section>
  );
}

function OfficialUpdateBox({ org, userId }: { org: OrgAccount; userId: string }) {
  const [body, setBody] = useState("");
  const [items, setItems] = useState<OfficialUpdate[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("official_updates")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setItems((data ?? []) as OfficialUpdate[]);
  }, [org.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const post = async () => {
    if (!body.trim()) return;
    setBusy(true);
    try {
      await postOfficialUpdate(org.id, userId, body.trim());
      setBody("");
      toast.success("Posted to Latest from Your Officials.");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not post");
    } finally {
      setBusy(false);
    }
  };

  // The database only accepts posts from offices staff have verified.
  if (org.status !== "verified") {
    return (
      <div className="space-y-1 rounded-md border border-border p-3">
        <p className="font-semibold inline-flex items-center gap-1.5">
          <Megaphone className="h-4 w-4" /> Post to “Latest from Your Officials”
        </p>
        <p className="text-sm text-muted-foreground">
          You can post updates for residents once our team has verified your office.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <p className="font-semibold inline-flex items-center gap-1.5">
        <Megaphone className="h-4 w-4" /> Post to “Latest from Your Officials”
      </p>
      <textarea
        rows={2}
        maxLength={280}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Short announcement for residents…"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-base focus-visible:border-primary focus-visible:outline-none"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {body.length}/280 · date stamped automatically
        </span>
        <button
          onClick={post}
          disabled={busy || !body.trim()}
          className="no-min-h h-11 rounded-md bg-primary-fill px-4 text-sm font-semibold text-primary-fill-foreground hover:bg-primary-fill-hover disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post"}
        </button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1 pt-1 border-t border-border">
          {items.map((u) => (
            <li key={u.id} className="text-sm">
              <span className="text-xs text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString()}
              </span>{" "}
              — {u.body}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
