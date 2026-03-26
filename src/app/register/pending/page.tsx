// src/app/register/pending/page.tsx
// Shown to recruiters whose userStatus is PENDING_APPROVAL after sign-in.
// No shell layout — this is a standalone holding page.

import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <section className="content-section">
      <header className="content-header">
        <h1>Awaiting approval</h1>
      </header>
      <section className="auth-card">
        <div style={{ padding: "0.5rem 0" }}>
          <p style={{ marginBottom: "1rem" }}>
            Your recruiter account has been registered and is currently{" "}
            <strong>pending admin approval</strong>. You will be able to access
            the Talent Platform once an administrator reviews your registration.
          </p>
          <p style={{ marginBottom: "1.5rem" }}>
            If you believe this is taking too long, please contact{" "}
            <a href="mailto:alliances@cs.ucl.ac.uk" className="auth-linklike">
              alliances@cs.ucl.ac.uk
            </a>
            .
          </p>
          <Link href="/sign-in" className="button-link button-link--secondary">
            Back to sign in
          </Link>
        </div>
      </section>
    </section>
  );
}
