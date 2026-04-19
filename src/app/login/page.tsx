import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Sign In | SIG Clearfork Insurance Group",
  description: "Sign in to your Clearfork Insurance account to access personalized features.",
};

export default function LoginPage() {
  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Sign In", href: "/login" },
        ]}
      />
      
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <LoginForm />
      </div>
    </PageShell>
  );
}