import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Create Account | SIG Clearfork Insurance Group",
  description: "Create your Clearfork Insurance account to access personalized features and manage your quotes.",
};

export default function RegisterPage() {
  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Create Account", href: "/register" },
        ]}
      />
      
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <RegisterForm />
      </div>
    </PageShell>
  );
}