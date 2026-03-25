// src/app/register/page.tsx
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <section className="content-section">
      <header className="content-header">
        <h1>Create an account</h1>
        <p>
          Join the UCL CS Alliances Talent Platform as a student or industry
          recruiter.
        </p>
      </header>
      <RegisterForm />
    </section>
  );
}
