"use client";
// src/components/RegisterForm.tsx
// Role-toggling registration form for students and recruiters.
// Recruiter flow: company email + name + company name + password → /api/auth/register
// Student flow: placeholder (Sadhana, #17) — shows a coming-soon message for now.

import { useState } from "react";
import Link from "next/link";

type Role = "recruiter" | "student";

export default function RegisterForm() {
  const [role, setRole] = useState<Role>("recruiter");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          companyName: companyName.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message ?? "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section className="auth-card">
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <h2 style={{ marginBottom: "0.75rem" }}>Registration submitted</h2>
          <p style={{ marginBottom: "1rem" }}>
            Your account is <strong>pending admin approval</strong>. You will
            receive access once an administrator reviews your registration.
          </p>
          <p className="small">
            Already have an account?{" "}
            <Link href="/sign-in" className="auth-linklike">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-card">
      {/* Role selector */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          type="button"
          className={`button-link ${role === "recruiter" ? "button-link--primary" : "button-link--secondary"}`}
          onClick={() => setRole("recruiter")}
        >
          I&apos;m a recruiter
        </button>
        <button
          type="button"
          className={`button-link ${role === "student" ? "button-link--primary" : "button-link--secondary"}`}
          onClick={() => setRole("student")}
        >
          I&apos;m a student
        </button>
      </div>

      {role === "student" ? (
        <div style={{ padding: "1rem 0" }}>
          <p>
            Student registration is managed by UCL. Please contact your
            programme administrator to be added to the platform.
          </p>
          <p className="small" style={{ marginTop: "0.75rem" }}>
            Already have an account?{" "}
            <Link href="/sign-in" className="auth-linklike">
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="auth-field" style={{ flex: 1 }}>
              <label className="auth-label" htmlFor="firstName">
                First name
              </label>
              <input
                className="auth-input"
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="auth-field" style={{ flex: 1 }}>
              <label className="auth-label" htmlFor="lastName">
                Last name
              </label>
              <input
                className="auth-input"
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Work email
            </label>
            <input
              className="auth-input"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="small" style={{ marginTop: "0.25rem", opacity: 0.7 }}>
              Use your company email — your domain identifies your organisation.
            </p>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="companyName">
              Company name
            </label>
            <input
              className="auth-input"
              id="companyName"
              name="companyName"
              type="text"
              autoComplete="organization"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <input
              className="auth-input"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              className="auth-input"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="small">
              {error}
            </p>
          )}

          <div className="auth-actions">
            <button
              type="submit"
              className="button-link button-link--primary"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Register"}
            </button>
            <Link href="/sign-in" className="auth-linklike">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
