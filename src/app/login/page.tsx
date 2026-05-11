import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Sign In | SIG Clearfork Insurance Group",
  description: "Sign in to your Clearfork Insurance account to access personalized features.",
};

/** OAuth flags come from runtime env (Docker `env_file`); build-time prerender has no `GOOGLE_*` → buttons hidden. */
export const dynamic = "force-dynamic";

function oauthFlags() {
  return {
    google:
      !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    apple: !!process.env.APPLE_ID && !!process.env.APPLE_SECRET,
  };
}

export default function LoginPage() {
  const { google, apple } = oauthFlags();
  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Sign In", href: "/login" },
        ]}
      />
      
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <LoginForm oauthGoogle={google} oauthApple={apple} />
      </div>
    </PageShell>
  );
}