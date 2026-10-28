# Business legal help, Fair Chance tags, and Bronx Preferred hiring

## What will be built

### 1. Legal consultation requests

- Add a business-owner form in the organization dashboard titled **Request a Free/Reduced-Cost Legal Consultation**.
- Collect business name, legal topic, optional topic details, and preferred contact method. Reuse the business account’s saved email/phone rather than asking owners to re-enter it.
- Save each request to a private queue with a clear status: New, Contacted, Scheduled, Completed, or Closed.
- Add a dedicated admin dashboard section where verified admins can review requests, see the owner’s contact details, add private scheduling notes, and update status.
- Keep all public copy partner-neutral; no legal organization or prospective partner will be named.

### 2. Fair Chance Employer tag

- Add **Fair Chance Employer** to the self-reported business tags available during registration and profile editing.
- Show the tag on relevant business/job cards as self-reported until reviewed under the existing verification model.
- Add a Jobs-page filter for Fair Chance Employer and ensure it filters both hiring-board posts and compatible business/job listings.

### 3. Bronx Preferred hiring board

- Add a lightweight hiring-post form to business dashboards with role title, short description, and one contact/application method.
- Allow owners to mark a post **Bronx Preferred** when they specifically want applicants who live in or understand the Bronx community.
- Add a distinct **Now Hiring** view within Jobs, separate from Internships, Job Training, Full-Time/Part-Time Jobs, and Self-Employment Resources.
- Support separate filtering and sorting for all hiring posts, Bronx Preferred posts, and Fair Chance employers.
- Show only active posts publicly; owners can edit, publish, and close their own posts, while admins can review and moderate all posts.

### 4. Roadmap only

Add three new **Coming Soon** cards in the existing format, without building their functionality:

- Peer Collaboration Board
- Self-Employed Insurance Guidance
- Grant & Loan Alerts for Businesses

The roadmap will contain **12 cards total** after this change.

## Technical details

- Add two database tables: one for legal consultation requests and one for lightweight hiring posts.
- Grant only the required access, enable row-level security, and use owner/admin policies so private requests never become public.
- Hiring posts will allow public read access only when published and active; all writes remain tied to an authenticated business owner or verified admin.
- Use the existing organization contact and role systems; no client-side admin checks will protect sensitive actions.
- Update generated database types through the migration workflow, then add focused data helpers and UI panels.
- Verify submission, owner management, admin queue actions, Jobs filters/sorting, roadmap count/content, mobile layout, and route metadata.
