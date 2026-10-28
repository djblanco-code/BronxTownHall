import { useEffect, useState } from "react";
import { BriefcaseBusiness, Gavel, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { OrgAccount, OrgContact } from "@/lib/org-accounts";
import {
  LEGAL_TOPICS,
  createHiringPost,
  createLegalRequest,
  loadHiringPosts,
  updateHiringPost,
  type HiringPost,
  type LegalTopic,
} from "@/lib/business-support";

const field = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]";

export function BusinessSupportPanel({
  org,
  contact,
  userId,
}: {
  org: OrgAccount;
  contact?: OrgContact;
  userId: string;
}) {
  const [legalOpen, setLegalOpen] = useState(false);
  const [hiringOpen, setHiringOpen] = useState(false);
  const [posts, setPosts] = useState<HiringPost[]>([]);

  const refreshPosts = async () => setPosts(await loadHiringPosts(org.id));
  useEffect(() => {
    void refreshPosts();
  }, [org.id]);

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-md border border-border p-3 space-y-2">
          <Gavel className="h-5 w-5 text-primary" aria-hidden />
          <h3 className="font-bold">Business legal help</h3>
          <p className="text-xs text-muted-foreground">
            Request a free or reduced-cost consultation. Staff will follow up to arrange next steps.
          </p>
          <Button variant="outline" onClick={() => setLegalOpen((v) => !v)}>
            {legalOpen ? <X /> : <Gavel />} {legalOpen ? "Close" : "Request consultation"}
          </Button>
        </div>
        <div className="rounded-md border border-border p-3 space-y-2">
          <BriefcaseBusiness className="h-5 w-5 text-primary" aria-hidden />
          <h3 className="font-bold">Now hiring</h3>
          <p className="text-xs text-muted-foreground">
            Post a short opening to the Jobs page and close it when the role is filled.
          </p>
          <Button variant="outline" onClick={() => setHiringOpen((v) => !v)}>
            {hiringOpen ? <X /> : <Plus />} {hiringOpen ? "Close" : "Post an opening"}
          </Button>
        </div>
      </div>
      {legalOpen && (
        <LegalRequestForm
          org={org}
          contact={contact}
          userId={userId}
          onDone={() => setLegalOpen(false)}
        />
      )}
      {hiringOpen && (
        <HiringForm
          org={org}
          userId={userId}
          onDone={() => {
            setHiringOpen(false);
            void refreshPosts();
          }}
        />
      )}
      {posts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-sm">Your hiring posts</h3>
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-md border border-border p-3 flex items-start justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-sm">{post.role_title}</p>
                <p className="text-xs text-muted-foreground">
                  {post.status}
                  {post.bronx_preferred ? " · Bronx Preferred" : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await updateHiringPost(post.id, {
                    status: post.status === "published" ? "closed" : "published",
                  });
                  toast.success(
                    post.status === "published" ? "Hiring post closed." : "Hiring post published.",
                  );
                  void refreshPosts();
                }}
              >
                {post.status === "published" ? "Close post" : "Publish"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LegalRequestForm({
  org,
  contact,
  userId,
  onDone,
}: {
  org: OrgAccount;
  contact?: OrgContact;
  userId: string;
  onDone: () => void;
}) {
  const [topic, setTopic] = useState<LegalTopic>("contract_review");
  const [details, setDetails] = useState("");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createLegalRequest({
        org_id: org.id,
        user_id: userId,
        business_name: org.org_name,
        topic,
        topic_details: details.trim() || null,
        preferred_contact: method,
        contact_email: contact?.contact_email ?? null,
        contact_phone: contact?.contact_phone ?? null,
      });
      toast.success("Request sent. Staff will contact you to arrange the consultation.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send request");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      onSubmit={submit}
      className="rounded-md border-2 border-primary/20 bg-primary/5 p-4 space-y-3"
    >
      <h3 className="font-bold">Request a Free/Reduced-Cost Legal Consultation</h3>
      <p className="text-xs text-muted-foreground">
        This is a request for follow-up, not a live appointment booking.
      </p>
      <label className="block text-sm font-medium">
        Business name
        <input className={field} value={org.org_name} readOnly />
      </label>
      <label className="block text-sm font-medium">
        Topic
        <select
          className={field}
          value={topic}
          onChange={(e) => setTopic(e.target.value as LegalTopic)}
        >
          {LEGAL_TOPICS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        What do you need help with?
        <textarea
          className={field}
          rows={3}
          maxLength={500}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Preferred contact method
        <select
          className={field}
          value={method}
          onChange={(e) => setMethod(e.target.value as "email" | "phone")}
        >
          <option value="email">Email ({contact?.contact_email ?? "saved account email"})</option>
          <option value="phone" disabled={!contact?.contact_phone}>
            Phone ({contact?.contact_phone ?? "add a contact phone first"})
          </option>
        </select>
      </label>
      <Button type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send request"}
      </Button>
    </form>
  );
}

function HiringForm({
  org,
  userId,
  onDone,
}: {
  org: OrgAccount;
  userId: string;
  onDone: () => void;
}) {
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [application, setApplication] = useState("");
  const [preferred, setPreferred] = useState(false);
  const [busy, setBusy] = useState(false);
  const fairChance = org.ownership_tags.includes("Fair Chance Employer");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createHiringPost({
        org_id: org.id,
        user_id: userId,
        employer_name: org.org_name,
        role_title: role.trim(),
        description: description.trim(),
        application_method: application.trim(),
        bronx_preferred: preferred,
        fair_chance_employer: fairChance,
        status: "published",
      });
      toast.success("Opening published to Jobs.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish opening");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      onSubmit={submit}
      className="rounded-md border-2 border-primary/20 bg-primary/5 p-4 space-y-3"
    >
      <h3 className="font-bold">Post a Now Hiring opening</h3>
      {fairChance && (
        <p className="text-xs font-semibold text-success">
          Fair Chance Employer tag will appear with this post.
        </p>
      )}
      <label className="block text-sm font-medium">
        Role title
        <input
          required
          maxLength={100}
          className={field}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Brief description
        <textarea
          required
          maxLength={500}
          rows={3}
          className={field}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Contact or application method
        <input
          required
          maxLength={300}
          className={field}
          placeholder="Application URL, email, or phone"
          value={application}
          onChange={(e) => setApplication(e.target.value)}
        />
      </label>
      <label className="flex gap-2 text-sm">
        <input
          type="checkbox"
          checked={preferred}
          onChange={(e) => setPreferred(e.target.checked)}
        />
        <span>
          <strong>Bronx Preferred</strong>
          <br />
          <span className="text-xs text-muted-foreground">
            We especially welcome applicants who live in or understand the Bronx community.
          </span>
        </span>
      </label>
      <Button type="submit" disabled={busy}>
        {busy ? "Publishing…" : "Publish opening"}
      </Button>
    </form>
  );
}
